"use client";

import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart, Loader2, DollarSign, CheckCircle2, Shield, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// Initialize Stripe on client side
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  amount: number;
  name: string;
  email: string;
  onSuccess: () => void;
}

function CheckoutForm({ amount, name, email, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'An error occurred.');
      setIsProcessing(false);
      return;
    }

    // Confirm payment directly with Stripe Elements using clientSecret
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/support-us/donate?status=success`,
        payment_method_data: {
          billing_details: {
            name: name,
            email: email,
          }
        }
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment confirmation failed.');
      setIsProcessing(false);
    } else {
      setIsProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full rounded-xl py-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
        ) : (
          `Complete secure payment of $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function StripeDonationForm({ 
  onStateChange 
}: { 
  onStateChange?: (frequency: 'one-time' | 'monthly', activePresetIndex: number, amount: number) => void 
}) {
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [activePresetIndex, setActivePresetIndex] = useState<number>(1); // Default to 2nd preset index
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const presets = frequency === 'monthly' ? [10, 25, 50, 100] : [25, 50, 100, 250];

  // Store latest callback in a ref to avoid infinite re-render loops
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  // Notify parent on state changes
  useEffect(() => {
    if (onStateChangeRef.current) {
      onStateChangeRef.current(frequency, activePresetIndex, amount);
    }
  }, [frequency, activePresetIndex, amount]);

  // Adjust preset selection amount index or custom amount when frequency toggles
  const handleFrequencyChange = (newFreq: 'one-time' | 'monthly') => {
    setFrequency(newFreq);
    setClientSecret(null); // Clear active secret to force session re-init

    const targetPresets = newFreq === 'monthly' ? [10, 25, 50, 100] : [25, 50, 100, 250];
    if (activePresetIndex !== -1) {
      setAmount(targetPresets[activePresetIndex]);
    }
  };

  const handlePresetSelect = (index: number) => {
    setActivePresetIndex(index);
    setAmount(presets[index]);
    setCustomAmount('');
    setClientSecret(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    setActivePresetIndex(-1);
    setClientSecret(null);
    
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
  };

  const handleInitializePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a donation amount greater than 0.');
      return;
    }
    if (!name.trim() || !email.trim()) {
      alert('Please provide your name and email address for tax receipt records.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/donate/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          name,
          email,
          frequency,
        }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        alert(data.error || 'Failed to initialize payment fields.');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="rounded-[2.5rem] border-primary/10 shadow-2xl overflow-hidden bg-white max-w-xl mx-auto p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-headline text-3xl font-bold text-slate-900">Thank You for Your Support!</h3>
        <p className="text-slate-500 leading-relaxed font-light">
          Your donation of <span className="font-bold text-primary">${amount.toFixed(2)}</span> has been securely processed. A tax receipt for this contribution will be emailed to <span className="font-semibold text-slate-800">{email}</span>.
        </p>
        <Button onClick={() => {
          setIsSuccess(false);
          setClientSecret(null);
          setName('');
          setEmail('');
          setCustomAmount('');
          setAmount(50);
        }} className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-white font-bold">
          Make Another Donation
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2.5rem] border-primary/10 shadow-2xl overflow-hidden bg-white max-w-xl mx-auto">
      <div className="bg-primary p-8 text-center text-white relative">
        <Heart className="w-12 h-12 mx-auto mb-3 opacity-95 animate-pulse" />
        <CardTitle className="text-2xl font-headline font-bold">Secure Online Donation</CardTitle>
        <p className="text-white/80 text-sm mt-1">100% secure encrypted payment via Stripe</p>
      </div>
      <CardContent className="p-8">
        {!clientSecret ? (
          <form onSubmit={handleInitializePayment} className="space-y-6">
            
            {/* Payment Frequency Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleFrequencyChange('one-time')}
                className={cn(
                  "py-2.5 rounded-lg text-xs font-bold transition-all",
                  frequency === 'one-time'
                    ? "bg-white shadow text-primary"
                    : "text-muted-foreground hover:text-slate-800"
                )}
              >
                One-Time Gift
              </button>
              <button
                type="button"
                onClick={() => handleFrequencyChange('monthly')}
                className={cn(
                  "py-2.5 rounded-lg text-xs font-bold transition-all",
                  frequency === 'monthly'
                    ? "bg-white shadow text-primary"
                    : "text-muted-foreground hover:text-slate-800"
                )}
              >
                Monthly Support
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <Label className="text-slate-600 font-bold uppercase tracking-wider text-xs">
                Select {frequency === 'monthly' ? 'Monthly' : 'One-Time'} Amount (CAD)
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(index)}
                    className={cn(
                      "py-3 border-2 rounded-xl text-sm font-bold transition-colors duration-150",
                      activePresetIndex === index
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                        : "bg-white border-slate-200 text-slate-600 hover:border-primary/45 hover:text-primary"
                    )}
                  >
                    ${preset}{frequency === 'monthly' ? '/mo' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2">
              <Label className="text-slate-600 font-bold uppercase tracking-wider text-xs">
                Or Enter Custom {frequency === 'monthly' ? 'Monthly' : 'One-Time'} Amount
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <Input
                  type="number"
                  placeholder="Other amount"
                  className="pl-10 py-6 text-base font-medium rounded-xl border-slate-200"
                  value={customAmount}
                  onChange={handleCustomChange}
                  min="5"
                />
              </div>
              <p className="text-[10px] text-slate-400">Minimum donation of $5.00 required.</p>
            </div>

            {/* Donor Information */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="donor-name" className="text-slate-600 font-bold uppercase tracking-wider text-xs">Full Name</Label>
                <Input
                  id="donor-name"
                  type="text"
                  placeholder="Jane Doe"
                  className="py-5 rounded-xl border-slate-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="donor-email" className="text-slate-600 font-bold uppercase tracking-wider text-xs">Email Address</Label>
                <Input
                  id="donor-email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  className="py-5 rounded-xl border-slate-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-[10px] text-slate-400">Your tax receipt will be sent to this email address.</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-6 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg"
              disabled={isLoading || amount <= 0}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing...</>
              ) : (
                `Proceed to ${frequency === 'monthly' ? 'monthly recurring' : 'one-time'} payment of $${amount.toFixed(2)}${frequency === 'monthly' ? '/mo' : ''}`
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-slate-400 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure 256-bit SSL encrypted connection
            </div>
          </form>
        ) : (
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0f5132', // KYO Forest Green primary color
                }
              }
            }}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Donation Total</div>
                  <div className="text-xl font-bold text-slate-800">${amount.toFixed(2)} CAD ({frequency === 'monthly' ? 'Monthly' : 'One-time'})</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setClientSecret(null)}
                  className="text-xs font-bold text-primary hover:text-primary/80 hover:bg-transparent"
                >
                  Change Amount
                </Button>
              </div>
              <CheckoutForm 
                amount={amount} 
                name={name} 
                email={email} 
                onSuccess={() => setIsSuccess(true)} 
              />
            </div>
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}
