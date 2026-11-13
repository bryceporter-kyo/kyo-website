import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
  apiVersion: '2025-01-27.acacia' as any
});

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Stripe Webhook Signature Verification Failed]:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  } else {
    // If webhook secret is not set, parse event body with warning (e.g. dev testing)
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch (err: any) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  // Handle successful payments
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata || {};

    // Check if this donation is for Bass Repairs
    if (metadata.catalogue_item_id === 'bass-repairs') {
      const donatedAmountCAD = paymentIntent.amount / 100;

      try {
        const campaignDocRef = doc(db, 'campaigns', 'bass-repairs');
        await runTransaction(db, async (transaction) => {
          const campaignSnap = await transaction.get(campaignDocRef);
          let currentRaised = 1000;
          let currentGoal = 2800;

          if (campaignSnap.exists()) {
            const data = campaignSnap.data();
            currentRaised = typeof data.raised === 'number' ? data.raised : 1000;
            currentGoal = typeof data.goal === 'number' ? data.goal : 2800;
          }

          transaction.set(
            campaignDocRef,
            {
              raised: Math.round((currentRaised + donatedAmountCAD) * 100) / 100,
              goal: currentGoal,
              updatedAt: new Date().toISOString(),
              lastDonation: {
                id: paymentIntent.id,
                amount: donatedAmountCAD,
                donor_name: metadata.donor_name || 'Anonymous',
                timestamp: new Date().toISOString(),
              }
            },
            { merge: true }
          );
        });
        console.log(`[Stripe Webhook] Updated Bass Repairs raised amount by +$${donatedAmountCAD} CAD`);
      } catch (err) {
        console.error('[Stripe Webhook] Failed to update Bass Repairs in Firestore:', err);
      }
    }

    // Handle tax receipt generation
    if (metadata.wants_tax_receipt === 'true') {
      const { logTaxReceipt, updateTaxReceiptStatus, getTaxReceiptSettings } = 
        await import('@/lib/taxReceipts');
      
      const donorData = {
        donorName: metadata.donor_name || 'Anonymous',
        donorEmail: metadata.donor_email || '',
        donorPhone: metadata.donor_phone || '',
        donorAddress: metadata.donor_address || '',
        amount: paymentIntent.amount / 100,
        frequency: metadata.frequency || 'one-time',
        donationDate: metadata.donation_date || new Date().toLocaleDateString('en-US'),
        status: 'pending' as const,
      };

      // Log to Firestore immediately
      let firestoreId: string | null = null;
      try {
        firestoreId = await logTaxReceipt(donorData);
      } catch (err) {
        console.error('[Tax Receipt] Failed to log to Firestore:', err);
      }

      // Load admin settings and trigger Apps Script
      try {
        const settings = await getTaxReceiptSettings();
        
        if (!settings.appsScriptWebAppUrl) {
          console.warn('[Tax Receipt] Apps Script URL not configured. Skipping receipt generation.');
          if (firestoreId) {
            await updateTaxReceiptStatus(firestoreId, 'failed', { 
              errorMessage: 'Apps Script URL not configured in admin settings.' 
            });
          }
        } else {
          const scriptResponse = await fetch(settings.appsScriptWebAppUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              secret: settings.appsScriptSecret || '',
              donorName: donorData.donorName,
              donorEmail: donorData.donorEmail,
              donorAddress: donorData.donorAddress,
              amount: donorData.amount.toFixed(2),
              donationDate: donorData.donationDate,
              frequency: donorData.frequency,
            }),
          });

          if (scriptResponse.ok) {
            const result = await scriptResponse.json();
            if (firestoreId) {
              await updateTaxReceiptStatus(firestoreId, 'emailed', {
                receiptId: result.receiptId || '',
                driveUrl: result.receiptUrl || '',
              });
            }
            console.log(`[Tax Receipt] Receipt generated and emailed for ${donorData.donorName}`);
          } else {
            const errText = await scriptResponse.text();
            console.error('[Tax Receipt] Apps Script error:', errText);
            if (firestoreId) {
              await updateTaxReceiptStatus(firestoreId, 'failed', { 
                errorMessage: `Apps Script returned ${scriptResponse.status}: ${errText.slice(0, 200)}` 
              });
            }
          }
        }
      } catch (err: any) {
        console.error('[Tax Receipt] Error triggering Apps Script:', err);
        if (firestoreId) {
          await updateTaxReceiptStatus(firestoreId, 'failed', { errorMessage: err.message });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
