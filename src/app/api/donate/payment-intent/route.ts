import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
  apiVersion: '2025-01-27.acacia' as any
});

export async function POST(request: NextRequest) {
  try {
    const { amount, name, email, frequency, wantsTaxReceipt, phone, address } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid donation amount.' }, { status: 400 });
    }

    const amountInCents = Math.round(amount * 100);
    const donationDate = new Date().toLocaleDateString('en-CA', { 
      month: '2-digit', day: '2-digit', year: 'numeric' 
    }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1/$2/$3'); // MM/DD/YYYY

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'cad',
      automatic_payment_methods: { enabled: true },
      metadata: {
        donor_name: name || 'Anonymous',
        donor_email: email || 'anonymous@thekyo.ca',
        donor_phone: wantsTaxReceipt ? (phone || '') : '',
        donor_address: wantsTaxReceipt ? (address || '') : '',
        wants_tax_receipt: wantsTaxReceipt ? 'true' : 'false',
        frequency: frequency || 'one-time',
        donation_date: donationDate,
        project: 'Kawartha Youth Orchestra Donation',
      },
      receipt_email: email || undefined,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('[Stripe PaymentIntent Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment.' },
      { status: 500 }
    );
  }
}
