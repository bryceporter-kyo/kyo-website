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
import { Loader2, CheckCircle2, ShieldCheck, Heart, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

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
          `Complete Donation of $${amount.toFixed(2)}`
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
  initialAddDedication?: boolean;
}

const DEDICATION_ADDON_PRICE = 10.99;

export default function CatalogueDonationModal({
  item,
  isOpen,
  onClose,
  onDonationSuccess,
  initialAddDedication = false,
}: CatalogueDonationModalProps) {
  // Wizard steps:
  // Step 1: Donor & Item Info (with dedication checkbox toggle)
  // Step 2: Dedication Details (only shown if dedication checked)
  // Step 3: Payment (Stripe checkout)
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  const [variableAmount, setVariableAmount] = useState<string>('50');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxReceiptRequested, setTaxReceiptRequested] = useState(false);
  const [donorNote, setDonorNote] = useState('');

  // Dedication add-on states
  const [hasDedication, setHasDedication] = useState(initialAddDedication);
  const [dedicationType, setDedicationType] = useState<'honour' | 'memory' | 'celebrate' | 'general'>('honour');
  const [honoureeName, setHonoureeName] = useState('');
  const [dedicationMessage, setDedicationMessage] = useState('');
  const [notifyHonouree, setNotifyHonouree] = useState(false);
  const [honoureeEmail, setHonoureeEmail] = useState('');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync initial dedication state when opening modal
  React.useEffect(() => {
    if (isOpen) {
      setHasDedication(initialAddDedication);
      setModalStep(1);
    }
  }, [isOpen, initialAddDedication]);

  if (!item) return null;

  const baseAmount = item.type === 'variable' ? parseFloat(variableAmount) || 0 : item.chargeAmount || 0;
  const totalAmount = hasDedication ? baseAmount + DEDICATION_ADDON_PRICE : baseAmount;
  const isTaxReceiptEligible = totalAmount > 20;

  // Validation before going to Step 2 or directly initializing payment
  const validateStep1 = () => {
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (item.type === 'variable') {
      const parsed = parseFloat(variableAmount);
      if (isNaN(parsed) || parsed < 10.01) {
        setErrorMessage('The minimum contribution for this gift is $10.01.');
        return false;
      }
    }

    if (taxReceiptRequested && isTaxReceiptEligible) {
      if (!address.trim()) {
        setErrorMessage('Mailing address is required by the CRA for tax receipts.');
        return false;
      }
      if (!phone.trim()) {
        setErrorMessage('Phone number is required by the CRA for tax receipts.');
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    setErrorMessage(null);
    if (!honoureeName.trim()) {
      setErrorMessage("Please enter the honouree or person's name for the dedication.");
      return false;
    }
    if (notifyHonouree && (!honoureeEmail.trim() || !honoureeEmail.includes('@'))) {
      setErrorMessage('Please provide a valid email address to notify the honouree.');
      return false;
    }
    return true;
  };

  const handleProceedFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    if (hasDedication) {
      // Advance to Dedication Details page
      setModalStep(2);
    } else {
      // Proceed directly to Stripe payment
      initializePaymentIntent();
    }
  };

  const handleProceedFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    initializePaymentIntent();
  };

  const initializePaymentIntent = async () => {
    setIsLoading(true);
    setErrorMessage(null);

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
          hasDedicationAddon: hasDedication,
          dedicationType: hasDedication ? dedicationType : undefined,
          honoureeName: hasDedication ? honoureeName.trim() : undefined,
          dedicationMessage: hasDedication ? dedicationMessage.trim() : undefined,
          notifyHonouree: hasDedication ? notifyHonouree : false,
          honoureeEmail: hasDedication && notifyHonouree ? honoureeEmail.trim() : undefined,
          donorNote: donorNote.trim() ? donorNote.trim() : undefined,
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
    setModalStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-primary" /> Upbeat! Holiday Gift
          </div>
          <DialogTitle className="text-2xl font-headline flex items-center justify-between flex-wrap gap-2">
            <span>{item.name}</span>
            <span className="text-lg font-bold text-primary">
              ${totalAmount.toFixed(2)}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {item.type === 'variable'
              ? 'Choose your contribution amount.'
              : `Base Donation: ${item.displayPrice}${hasDedication ? ` + $${DEDICATION_ADDON_PRICE.toFixed(2)} Dedication` : ''}`}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-600 mb-2">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold font-headline">Thank You for Your Generosity!</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Your gift of <strong>${confirmedAmount.toFixed(2)}</strong> for{' '}
              <strong>{item.name}</strong> will directly empower an Upbeat! musician in Peterborough.
            </p>
            {hasDedication && (
              <div className="p-3 bg-primary/10 text-primary-900 rounded-lg text-xs max-w-md mx-auto border border-primary/20">
                ✨ <strong>Dedication Plaque Confirmed:</strong> Inscribed for &quot;{honoureeName}&quot; ({dedicationType}).
              </div>
            )}
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
              <div>
                <span className="font-semibold">{item.name}</span>
                {hasDedication && (
                  <span className="block text-xs text-primary font-medium">
                    + Inscribed Dedication for {honoureeName}
                  </span>
                )}
              </div>
              <span className="font-bold text-primary text-base">${confirmedAmount.toFixed(2)}</span>
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
        ) : modalStep === 2 ? (
          /* ═══════════════════════════════════════════════════════════════════ */
          /* STEP 2: DEDICATION DETAILS                                         */
          /* ═══════════════════════════════════════════════════════════════════ */
          <form onSubmit={handleProceedFromStep2} className="space-y-5 pt-2">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="w-4 h-4" /> Dedication Plaque Details (+${DEDICATION_ADDON_PRICE.toFixed(2)})
              </div>
              <p className="text-xs text-muted-foreground">
                We will inscribe this dedication onto the physical instrument plaque to celebrate your support.
              </p>
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Dedication Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Dedication Type *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'honour', label: 'In Honour of' },
                  { value: 'memory', label: 'In Memory of' },
                  { value: 'celebrate', label: 'To Celebrate' },
                  { value: 'general', label: 'Dedicated by' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDedicationType(opt.value as any)}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      dedicationType === opt.value
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Honouree Name */}
            <div className="space-y-1">
              <Label htmlFor="honouree-name" className="text-xs font-bold uppercase text-muted-foreground">
                Honouree or Inscription Name *
              </Label>
              <Input
                id="honouree-name"
                value={honoureeName}
                onChange={(e) => setHonoureeName(e.target.value)}
                placeholder="e.g. Grandma Helen, Jane Smith, or The Porter Family"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Appears on the instrument plaque as: <em>{dedicationType === 'honour' ? 'In Honour of' : dedicationType === 'memory' ? 'In Memory of' : dedicationType === 'celebrate' ? 'To Celebrate' : 'Dedicated by'} {honoureeName || '[Name]'}</em>
              </p>
            </div>

            {/* Inscription Message */}
            <div className="space-y-1">
              <Label htmlFor="dedication-msg" className="text-xs font-bold uppercase text-muted-foreground">
                Dedication Message / Note (Optional)
              </Label>
              <Textarea
                id="dedication-msg"
                placeholder="Share a short message or sentiment for the young musician who receives this instrument..."
                value={dedicationMessage}
                onChange={(e) => setDedicationMessage(e.target.value)}
                rows={3}
                className="resize-none text-xs"
              />
            </div>

            {/* Notify Honouree Toggle */}
            <div className="p-3 bg-muted/40 rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-honouree"
                  checked={notifyHonouree}
                  onCheckedChange={(checked) => setNotifyHonouree(Boolean(checked))}
                />
                <label htmlFor="notify-honouree" className="text-xs font-medium cursor-pointer">
                  Send an email notification card to this person or their family
                </label>
              </div>

              {notifyHonouree && (
                <div className="pl-6 space-y-1">
                  <Label htmlFor="honouree-email" className="text-[11px] font-semibold text-muted-foreground">
                    Honouree&apos;s / Recipient&apos;s Email Address *
                  </Label>
                  <Input
                    id="honouree-email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={honoureeEmail}
                    onChange={(e) => setHonoureeEmail(e.target.value)}
                    className="text-xs h-8"
                    required
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalStep(1)}
                className="rounded-xl gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing Payment...
                  </>
                ) : (
                  <>
                    Proceed to Payment (${totalAmount.toFixed(2)}) <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════ */
          /* STEP 1: DONOR & ITEM DETAILS (WITH DEDICATION ADDON CHECKBOX)       */
          /* ═══════════════════════════════════════════════════════════════════ */
          <form onSubmit={handleProceedFromStep1} className="space-y-4 pt-2">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Variable Amount Field */}
            {item.type === 'variable' && (
              <div>
                <Label htmlFor="custom-amount" className="font-semibold text-sm">
                  Contribution Amount *
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
                  Minimum contribution: $10.01. Every dollar directly funds this initiative.
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

            {/* DEDICATION ADD-ON CHECKBOX (Adds $10.99 & unlocks Step 2) */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-300/60 rounded-xl space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="add-dedication"
                  checked={hasDedication}
                  onCheckedChange={(checked) => setHasDedication(Boolean(checked))}
                  className="mt-0.5 border-amber-500 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <div className="grid gap-0.5 leading-tight cursor-pointer" onClick={() => setHasDedication(!hasDedication)}>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Add an Inscribed Dedication Plaque (+${DEDICATION_ADDON_PRICE.toFixed(2)})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inscribe your name or honour a loved one with a custom plaque affixed to this instrument. You will be prompted for your dedication details on the next step.
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Donor Note */}
            <div>
              <Label htmlFor="donor-note" className="font-semibold text-sm">
                Add a Note or Message (Optional)
              </Label>
              <Textarea
                id="donor-note"
                placeholder="Share a message of support, encouragement, or instructions..."
                value={donorNote}
                onChange={(e) => setDonorNote(e.target.value)}
                className="mt-1 resize-none text-sm"
                rows={2}
              />
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
                      ? 'Eligible for cash donations over $20. CRA requires your full address and phone number.'
                      : 'Tax receipts are available for donations exceeding $20.'}
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

            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Payments processed securely via Stripe.</span>
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
              ) : hasDedication ? (
                <span className="flex items-center justify-center gap-2">
                  Continue to Dedication Details (${totalAmount.toFixed(2)}) <ArrowRight className="w-4 h-4" />
                </span>
              ) : (
                `Proceed to Payment ($${totalAmount.toFixed(2)})`
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
