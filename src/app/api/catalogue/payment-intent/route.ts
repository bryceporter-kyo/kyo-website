import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCatalogueItem } from '@/lib/catalogue-items';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
  apiVersion: '2025-01-27.acacia' as any
});

interface CataloguePaymentRequestBody {
  itemId: string;
  donorAmount?: number;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  taxReceiptRequested?: boolean;
  dedicationText?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CataloguePaymentRequestBody = await request.json();
    const { itemId, donorAmount, name, email, address, phone, taxReceiptRequested, dedicationText } = body;

    // 1. Validate catalogue item exists in trusted registry
    const item = getCatalogueItem(itemId);
    if (!item) {
      return NextResponse.json({ error: 'Selected catalogue item was not found.' }, { status: 404 });
    }

    // 2. Validate donor basic info
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // 3. Determine and strictly validate charge amount server-side
    let finalAmountCAD: number;

    if (item.type === 'variable') {
      const parsedAmount = Number(donorAmount);
      if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
        return NextResponse.json({ error: 'Invalid contribution amount.' }, { status: 400 });
      }
      if (parsedAmount < 10.01) {
        return NextResponse.json({ error: 'Minimum contribution amount is $10.01 CAD.' }, { status: 400 });
      }
      if (parsedAmount > 100000) {
        return NextResponse.json({ error: 'Contribution amount exceeds the allowed maximum.' }, { status: 400 });
      }
      finalAmountCAD = parsedAmount;
    } else {
      // Fixed, addon, or bundle item: server IGNORES any browser amount and uses authoritative chargeAmount
      if (!item.chargeAmount) {
        return NextResponse.json({ error: 'Charge amount for this item is not configured.' }, { status: 500 });
      }
      finalAmountCAD = item.chargeAmount;
    }

    // 4. Tax receipt validation according to CRA rules:
    // "All donations are tax receiptable if they are cash donations beyond $20 in value
    // and if people provide their full name, email, address, and phone number as required by the CRA."
    const isTaxReceiptEligible = finalAmountCAD > 20;
    const requestedTaxReceipt = Boolean(taxReceiptRequested && isTaxReceiptEligible);

    if (requestedTaxReceipt) {
      if (!address || !address.trim()) {
        return NextResponse.json(
          { error: 'A mailing address is required by the CRA to issue an official tax receipt.' },
          { status: 400 }
        );
      }
      if (!phone || !phone.trim()) {
        return NextResponse.json(
          { error: 'A phone number is required by the CRA to issue an official tax receipt.' },
          { status: 400 }
        );
      }
    }

    // 5. Convert CAD dollars to cents for Stripe
    const amountInCents = Math.round(finalAmountCAD * 100);

    // 6. Build comprehensive Stripe metadata
    const metadata: Record<string, string> = {
      campaign: 'upbeat-holiday-2026',
      catalogue_item_id: item.id,
      gift_name: item.name,
      gift_category: item.category,
      donor_name: name.trim(),
      donor_email: email.trim(),
      tax_receipt_requested: requestedTaxReceipt ? 'True' : 'False',
      is_tax_receipt_eligible: isTaxReceiptEligible ? 'True' : 'False',
    };

    if (address && address.trim()) {
      metadata.donor_address = address.trim().slice(0, 500);
    }
    if (phone && phone.trim()) {
      metadata.donor_phone = phone.trim().slice(0, 50);
    }
    if (item.hasDedicationInscription && dedicationText && dedicationText.trim()) {
      metadata.dedication_text = dedicationText.trim().slice(0, 500);
    }

    // 7. Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      receipt_email: email.trim() || undefined,
      description: `Upbeat! Gift Catalogue: ${item.name}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: finalAmountCAD,
      itemName: item.name,
      taxReceiptRequested: requestedTaxReceipt,
    });
  } catch (error: any) {
    console.error('[Catalogue Stripe PaymentIntent Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment for catalogue gift.' },
      { status: 500 }
    );
  }
}
