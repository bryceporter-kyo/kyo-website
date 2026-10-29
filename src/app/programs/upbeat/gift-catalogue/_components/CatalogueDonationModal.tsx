"use client";

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CatalogueItem } from '@/lib/catalogue-items';
import { Loader2, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  amount: number;
  name: string;
  email: string;
  onSuccess: () => void;
}

function StripePaymentElementForm({ amount, name, email, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'An error occurred.');
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/programs/upbeat/gift-catalogue?status=success`,
        payment_method_data: {
          billing_details: {
            name: name,
            email: email,
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment confirmation failed. Please check your card details.');
      setIsProcessing(false);
    } else {
      setIsProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <PaymentElement />
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing Donation...
          </>
        ) : (
          `Complete Donation of $${amount.toFixed(2)} CAD`
        )}
      </Button>
    </form>
  );
}

interface CatalogueDonationModalProps {
  item: CatalogueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDonationSuccess?: (item: CatalogueItem, amount: number) => void;
}

export default function CatalogueDonationModal({
  item,
  isOpen,
  onClose,
  onDonationSuccess,
}: CatalogueDonationModalProps) {
  const [variableAmount, setVariableAmount] = useState<string>('50');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxReceiptRequested, setTaxReceiptRequested] = useState(false);
  const [dedicationText, setDedicationText] = useState('');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!item) return null;

  const currentAmount = item.type === 'variable' ? parseFloat(variableAmount) || 0 : item.chargeAmount || 0;
  const isTaxReceiptEligible = currentAmount > 20;

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (item.type === 'variable') {
      const parsed = parseFloat(variableAmount);
      if (isNaN(parsed) || parsed < 10.01) {
        setErrorMessage('The minimum contribution for this gift is $10.01 CAD.');
        return;
      }
    }

    if (taxReceiptRequested && isTaxReceiptEligible) {
      if (!address.trim()) {
        setErrorMessage('Mailing address is required by the CRA for tax receipts.');
        return;
      }
      if (!phone.trim()) {
        setErrorMessage('Phone number is required by the CRA for tax receipts.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/catalogue/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          donorAmount: item.type === 'variable' ? parseFloat(variableAmount) : undefined,
          name: name.trim(),
          email: email.trim(),
          address: address.trim(),
          phone: phone.trim(),
          taxReceiptRequested: taxReceiptRequested && isTaxReceiptEligible,
          dedicationText: item.hasDedicationInscription ? dedicationText.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      setClientSecret(data.clientSecret);
      setConfirmedAmount(data.amount);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    if (onDonationSuccess && item) {
      onDonationSuccess(item, confirmedAmount);
    }
  };

  const handleClose = () => {
    setClientSecret(null);
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-primary" /> Upbeat! Holiday Gift
          </div>
          <DialogTitle className="text-2xl font-headline">{item.name}</DialogTitle>
          <DialogDescription className="text-sm">
            {item.type === 'variable'
              ? 'Choose your contribution amount in Canadian Dollars (CAD).'
              : `Donation: ${item.displayPrice} CAD (includes 3% transaction fee)`}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-600 mb-2">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold font-headline">Thank You for Your Generosity!</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Your gift of <strong>${confirmedAmount.toFixed(2)} CAD</strong> for{' '}
              <strong>{item.name}</strong> will directly empower an Upbeat! musician in Peterborough.
            </p>
            {taxReceiptRequested && isTaxReceiptEligible && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs max-w-md mx-auto border border-emerald-200">
                Official CRA tax receipt requested. KYO will issue your official tax receipt to {email} following CRA guidelines.
              </div>
            )}
            <div className="pt-4">
              <Button onClick={handleClose} className="rounded-xl px-8">
                Close & Return to Catalogue
              </Button>
            </div>
          </div>
        ) : clientSecret ? (
          <div className="space-y-4">
            <div className="p-3 bg-muted/60 rounded-lg text-sm flex justify-between items-center">
              <span>Gift: <strong>{item.name}</strong></span>
              <span className="font-bold text-primary">${confirmedAmount.toFixed(2)} CAD</span>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: 'stripe' },
              }}
            >
              <StripePaymentElementForm
                amount={confirmedAmount}
                name={name}
                email={email}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClientSecret(null)}
              className="w-full text-xs text-muted-foreground"
            >
              ← Edit details or contribution amount
            </Button>
          </div>
        ) : (
          <form onSubmit={handleStartPayment} className="space-y-4 pt-2">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Variable Amount Field */}
            {item.type === 'variable' && (
              <div>
                <Label htmlFor="custom-amount" className="font-semibold text-sm">
                  Contribution Amount (CAD) *
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                    $
                  </span>
                  <Input
                    id="custom-amount"
                    type="number"
                    min="10.01"
                    step="0.01"
                    className="pl-7 text-lg font-bold"
                    value={variableAmount}
                    onChange={(e) => setVariableAmount(e.target.value)}
                    placeholder="50.00"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum contribution: $10.01 CAD. Every dollar directly funds this initiative.
                </p>
              </div>
            )}

            {/* Dedication Text Area */}
            {item.hasDedicationInscription && (
              <div>
                <Label htmlFor="dedication-text" className="font-semibold text-sm">
                  Dedication Inscription *
                </Label>
                <Textarea
                  id="dedication-text"
                  placeholder="In honour of... / Celebrated by... / In memory of..."
                  value={dedicationText}
                  onChange={(e) => setDedicationText(e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We will inscribe this dedication onto the instrument plaque.
                </p>
              </div>
            )}

            {/* Donor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donor-name" className="text-xs font-semibold uppercase text-muted-foreground">
                  Full Name *
                </Label>
                <Input
                  id="donor-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="donor-email" className="text-xs font-semibold uppercase text-muted-foreground">
                  Email Address *
                </Label>
                <Input
                  id="donor-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* CRA Tax Receipt Section */}
            <div className="pt-2 border-t">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="tax-receipt"
                  checked={taxReceiptRequested}
                  onCheckedChange={(checked) => setTaxReceiptRequested(Boolean(checked))}
                  disabled={!isTaxReceiptEligible}
                />
                <div className="grid gap-1 leading-none">
                  <label
                    htmlFor="tax-receipt"
                    className={`text-sm font-medium leading-none ${
                      !isTaxReceiptEligible ? 'opacity-50' : 'cursor-pointer'
                    }`}
                  >
                    I would like an official charitable tax receipt
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {isTaxReceiptEligible
                      ? 'Eligible for cash donations over $20 CAD. CRA requires your full address and phone number.'
                      : 'Tax receipts are available for donations exceeding $20.00 CAD.'}
                  </p>
                </div>
              </div>

              {taxReceiptRequested && isTaxReceiptEligible && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                  <div>
                    <Label htmlFor="donor-address" className="text-xs font-semibold uppercase text-muted-foreground">
                      Mailing Address (CRA required) *
                    </Label>
                    <Input
                      id="donor-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, Peterborough, ON"
                      className="mt-1 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-phone" className="text-xs font-semibold uppercase text-muted-foreground">
                      Phone Number (CRA required) *
                    </Label>
                    <Input
                      id="donor-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(705) 555-0123"
                      className="mt-1 text-xs"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Payments processed securely via Stripe. CAD currency.</span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing Payment...
                </>
              ) : (
                `Proceed to Payment (${item.type === 'variable' ? `$${(parseFloat(variableAmount) || 0).toFixed(2)}` : item.displayPrice} CAD)`
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
