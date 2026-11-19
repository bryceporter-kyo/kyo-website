import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';

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
    // If webhook secret is not set, parse event body (dev/test only)
    if (webhookSecret && !signature) {
      console.warn('[Stripe Webhook] Secret is set but no signature header received — possible misconfiguration.');
    }
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

    // ── Bass Repairs campaign tracker ──────────────────────────────────────────
    if (metadata.catalogue_item_id === 'bass-repairs') {
      const donatedAmountCAD = paymentIntent.amount / 100;
      try {
        const campaignRef = doc(db, 'campaigns', 'bass-repairs');
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(campaignRef);
          const data = snap.exists() ? snap.data() : {};
          const currentRaised = typeof data.raised === 'number' ? data.raised : 1000;
          const currentGoal   = typeof data.goal   === 'number' ? data.goal   : 2800;
          tx.set(campaignRef, {
            raised: Math.round((currentRaised + donatedAmountCAD) * 100) / 100,
            goal: currentGoal,
            updatedAt: new Date().toISOString(),
            lastDonation: {
              id: paymentIntent.id,
              amount: donatedAmountCAD,
              donor_name: metadata.donor_name || 'Anonymous',
              timestamp: new Date().toISOString(),
            },
          }, { merge: true });
        });
        console.log(`[Stripe Webhook] Updated Bass Repairs raised amount by +$${donatedAmountCAD} CAD`);
      } catch (err) {
        console.error('[Stripe Webhook] Failed to update Bass Repairs in Firestore:', err);
      }
    }

    // ── Dedication notification email ──────────────────────────────────────────
    if (metadata.notify_honouree === 'true' && metadata.honouree_email) {
      try {
        const { sendDedicationNotificationEmail } = await import('@/lib/email');
        await sendDedicationNotificationEmail({
          honoureeName: metadata.honouree_name || 'Honouree',
          honoureeEmail: metadata.honouree_email,
          donorName: metadata.donor_name || 'Anonymous',
          donorEmail: metadata.donor_email,
          amount: paymentIntent.amount / 100,
          date: metadata.donation_date || new Date().toLocaleDateString('en-CA'),
          dedicationType: metadata.dedication_type as any,
          dedicationMessage: metadata.dedication_message,
          giftName: metadata.gift_name || 'Instrument Outfit',
        });
      } catch (err) {
        console.error('[Stripe Webhook] Error triggering dedication notification email:', err);
      }
    }

    // ── Thank you email ────────────────────────────────────────────────────────
    if (metadata.donor_email && metadata.donor_email.includes('@')) {
      try {
        const { sendDonationThankYouEmail } = await import('@/lib/email');
        await sendDonationThankYouEmail({
          donorName: metadata.donor_name || 'Generous Donor',
          donorEmail: metadata.donor_email,
          amount: paymentIntent.amount / 100,
          date: metadata.donation_date || new Date().toLocaleDateString('en-CA'),
          projectName: metadata.project || metadata.gift_name || 'Upbeat! Program Support',
          frequency: metadata.frequency || 'one-time',
          hasTaxReceipt: metadata.wants_tax_receipt === 'true' || metadata.tax_receipt_requested?.toLowerCase() === 'true',
        });
      } catch (err) {
        console.error('[Stripe Webhook] Error sending donor thank you email:', err);
      }
    }

    // ── Log ALL donations to Firestore ─────────────────────────────────────────
    const isTaxReceiptWanted = metadata.wants_tax_receipt === 'true' || metadata.tax_receipt_requested?.toLowerCase() === 'true';
    const isMonthly = metadata.frequency === 'monthly';
    const donationAmount = paymentIntent.amount / 100;
    const assumedAnnualAmount = isMonthly ? donationAmount * 12 : donationAmount;

    const donorData = {
      donorName:    metadata.donor_name    || 'Anonymous',
      donorEmail:   metadata.donor_email   || '',
      donorPhone:   metadata.donor_phone   || '',
      donorAddress: metadata.donor_address || '',
      amount:              donationAmount,
      assumedAnnualAmount: assumedAnnualAmount,
      frequency:    metadata.frequency || 'one-time',
      donationDate: metadata.donation_date || new Date().toLocaleDateString('en-CA'),
      wantsTaxReceipt: isTaxReceiptWanted,
      projectName:  metadata.project || metadata.gift_name || 'General Donation',
      stripePaymentIntentId: paymentIntent.id,
      status: !isTaxReceiptWanted
        ? 'no-receipt'
        : isMonthly
        ? 'requires-verification'
        : 'pending',
      createdAt: serverTimestamp(),
    };

    let firestoreId: string | null = null;
    try {
      const docRef = await addDoc(collection(db, 'tax_receipts'), donorData);
      firestoreId = docRef.id;
      console.log(`[Stripe Webhook] Donation logged to Firestore: ${firestoreId} ($${donationAmount} from ${donorData.donorName})`);

      await addDoc(collection(db, 'tax_receipt_audit_logs'), {
        eventType: 'webhook_received',
        title: `Donation Received (${isMonthly ? 'Monthly' : 'One-Time'})`,
        description: `Received payment of $${donationAmount.toFixed(2)} from ${donorData.donorName}. wantsTaxReceipt=${isTaxReceiptWanted}.`,
        metadata: { donorEmail: donorData.donorEmail, amount: donationAmount, isMonthly, isTaxReceiptWanted, firestoreId },
        status: 'info',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Stripe Webhook] CRITICAL: Failed to write donation to Firestore:', err);
    }

    // If no tax receipt wanted, we're done
    if (!isTaxReceiptWanted) {
      return NextResponse.json({ received: true });
    }

    // ── Tax receipt generation (Apps Script) ───────────────────────────────────
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'tax-receipts'));
      const settings = settingsSnap.exists() ? (settingsSnap.data() as any) : {};

      // Monthly donations: log to sheet but hold receipt pending 12-month verification
      if (isMonthly) {
        if (settings.appsScriptWebAppUrl) {
          try {
            await fetch(settings.appsScriptWebAppUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                secret: settings.appsScriptSecret || '',
                action: 'log_only',
                donorName: donorData.donorName,
                donorEmail: donorData.donorEmail,
                donorAddress: donorData.donorAddress,
                amount: donationAmount.toFixed(2),
                assumedAnnualAmount: assumedAnnualAmount.toFixed(2),
                donationDate: donorData.donationDate,
                frequency: 'monthly',
                notes: `Monthly Recurring (Assumed 12-Month Annual Total: $${assumedAnnualAmount.toFixed(2)} CAD) — Requires Verification`,
              }),
            });
            console.log(`[Tax Receipt] Logged monthly donation for ${donorData.donorName} (Receipt held pending verification)`);
          } catch (monthlyErr) {
            console.error('[Tax Receipt] Error logging monthly donation to sheet:', monthlyErr);
          }
        }
        await addDoc(collection(db, 'tax_receipt_audit_logs'), {
          eventType: 'monthly_held',
          title: 'Monthly Recurring Donation Held for Verification',
          description: `Logged monthly donation for ${donorData.donorName} ($${assumedAnnualAmount.toFixed(2)} assumed annual). Receipt held pending 12-mo verification.`,
          metadata: { donorName: donorData.donorName, amount: donationAmount, assumedAnnual: assumedAnnualAmount },
          status: 'warning',
          createdAt: serverTimestamp(),
        });
        return NextResponse.json({ received: true });
      }

      // One-time: check auto-receipt toggle
      const isAutoReceiptsEnabled = settings.autoTaxReceipts !== false;
      if (!isAutoReceiptsEnabled) {
        console.log(`[Tax Receipt] Auto receipts disabled. Donation #${firestoreId} saved as pending for manual review.`);
        await addDoc(collection(db, 'tax_receipt_audit_logs'), {
          eventType: 'webhook_received',
          title: 'Automatic Tax Receipt Held',
          description: `Auto receipt generation is OFF. Saved donation from ${donorData.donorName} ($${donationAmount.toFixed(2)}) as pending for manual generation.`,
          metadata: { donorName: donorData.donorName, amount: donationAmount, firestoreId },
          status: 'info',
          createdAt: serverTimestamp(),
        });
        return NextResponse.json({ received: true });
      }

      if (!settings.appsScriptWebAppUrl) {
        console.warn('[Tax Receipt] Apps Script URL not configured. Skipping receipt generation.');
        if (firestoreId) {
          await updateDoc(doc(db, 'tax_receipts', firestoreId), {
            status: 'failed',
            errorMessage: 'Apps Script URL not configured in admin settings.',
          });
        }
        await addDoc(collection(db, 'tax_receipt_audit_logs'), {
          eventType: 'webhook_received',
          title: 'Tax Receipt Apps Script Not Configured',
          description: `Could not trigger receipt for ${donorData.donorName}: Apps Script Web App URL is blank.`,
          metadata: { donorName: donorData.donorName, amount: donationAmount },
          status: 'warning',
          createdAt: serverTimestamp(),
        });
      } else {
        const scriptResponse = await fetch(settings.appsScriptWebAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: settings.appsScriptSecret || '',
            donorName: donorData.donorName,
            donorEmail: donorData.donorEmail,
            donorAddress: donorData.donorAddress,
            amount: donationAmount.toFixed(2),
            donationDate: donorData.donationDate,
            frequency: donorData.frequency,
          }),
        });

        if (scriptResponse.ok) {
          const result = await scriptResponse.json();
          if (firestoreId) {
            await updateDoc(doc(db, 'tax_receipts', firestoreId), {
              status: 'emailed',
              receiptId: result.receiptId || '',
              driveUrl: result.receiptUrl || '',
            });
          }
          console.log(`[Tax Receipt] Receipt generated and emailed for ${donorData.donorName}`);
          await addDoc(collection(db, 'tax_receipt_audit_logs'), {
            eventType: 'webhook_received',
            title: 'Tax Receipt Generated & Emailed',
            description: `Successfully processed receipt #${result.receiptId || 'N/A'} for ${donorData.donorName} ($${donationAmount.toFixed(2)}).`,
            metadata: { receiptId: result.receiptId, driveUrl: result.receiptUrl, donorName: donorData.donorName },
            status: 'success',
            createdAt: serverTimestamp(),
          });
        } else {
          const errText = await scriptResponse.text();
          console.error('[Tax Receipt] Apps Script error:', errText);
          if (firestoreId) {
            await updateDoc(doc(db, 'tax_receipts', firestoreId), {
              status: 'failed',
              errorMessage: `Apps Script returned ${scriptResponse.status}: ${errText.slice(0, 200)}`,
            });
          }
          await addDoc(collection(db, 'tax_receipt_audit_logs'), {
            eventType: 'webhook_received',
            title: 'Apps Script Receipt Generation Failed',
            description: `Apps Script returned HTTP ${scriptResponse.status}: ${errText.slice(0, 150)}`,
            metadata: { status: scriptResponse.status, errText },
            status: 'error',
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch (err: any) {
      console.error('[Tax Receipt] Error in receipt generation flow:', err);
      if (firestoreId) {
        try {
          await updateDoc(doc(db, 'tax_receipts', firestoreId), {
            status: 'failed',
            errorMessage: err.message,
          });
        } catch (_) {}
      }
    }
  }

  return NextResponse.json({ received: true });
}
