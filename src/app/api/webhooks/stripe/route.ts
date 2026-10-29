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
        console.log(`[Stripe Webhook] Updated Bass Repairs raised amount by +$${donatedAmountCAD}`);
      } catch (err) {
        console.error('[Stripe Webhook] Failed to update Bass Repairs in Firestore:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
