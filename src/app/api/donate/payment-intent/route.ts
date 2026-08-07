import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
  apiVersion: '2025-01-27.acacia' as any
});

export async function POST(request: NextRequest) {
  try {
    const { amount, name, email, frequency } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid donation amount.' }, { status: 400 });
    }

    // Stripe expects amounts in cents
    const amountInCents = Math.round(amount * 100);

    // Create payment intent with metadata for tracking donations
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        donor_name: name || 'Anonymous',
        donor_email: email || 'anonymous@thekyo.ca',
        frequency: frequency || 'one-time',
        project: 'Kawartha Youth Orchestra Donation'
      },
      receipt_email: email || undefined,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('[Stripe PaymentIntent Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment.' },
      { status: 500 }
    );
  }
}
