import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any, // using any to bypass type errors for unknown version string if needed, or let stripe default
});

export async function POST(req: Request) {
  try {
    const { amount, metadata } = await req.json();

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount provided' }, { status: 400 });
    }

    // Add 3% transaction fee to the base deposit amount
    const totalAmount = amount * 1.03;

    // Stripe expects amount in cents
    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata || {},
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating PaymentIntent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
