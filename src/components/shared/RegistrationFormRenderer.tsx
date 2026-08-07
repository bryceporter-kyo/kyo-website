"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RegistrationFormConfig, FormQuestion, FormProgram } from "@/lib/registration-form";
import { getRegistrationForm } from "@/lib/registration-form-service";
import { saveRegistrationSubmission, saveRegistrationDraft, getRegistrationDraft } from "@/lib/registration-submission-service";
import { uploadImage } from "@/lib/image-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, ArrowRight, AlertCircle, ArrowLeft, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface RegistrationFormRendererProps {
  program: FormProgram;
}

interface FormSection {
  id: string;
  headerQuestion: FormQuestion | null; // null if it's the implicit first section
  questions: FormQuestion[];
}

export function RegistrationFormRenderer({ program }: RegistrationFormRendererProps) {
  const [config, setConfig] = useState<RegistrationFormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const fetchedConfig = await getRegistrationForm(program);
        setConfig(fetchedConfig);

        if (fetchedConfig && fetchedConfig.isOpen) {
          const paymentQuestion = fetchedConfig.questions.find(q => q.type === 'payment');
          if (paymentQuestion && paymentQuestion.paymentAmount) {
            const res = await fetch('/api/create-payment-intent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: paymentQuestion.paymentAmount })
            });
            const data = await res.json();
            if (data.clientSecret) {
              setClientSecret(data.clientSecret);
            }
          }
        }
      } catch (err) {
        console.error("Error loading form:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [program]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading registration form...</p>
      </div>
    );
  }

  if (!config || (!config.isOpen)) {
    return (
      <Card className="max-w-2xl mx-auto border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline text-2xl">Registration Closed</CardTitle>
          <CardDescription className="text-base mt-2">
            {config?.closedMessage || "This registration form is not currently accepting submissions."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button asChild variant="outline">
            <a href="/">Return Home</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasPayment = config.questions.some(q => q.type === 'payment');

  if (hasPayment && !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing secure checkout...</p>
      </div>
    );
  }

  const stripeOptions = clientSecret ? { clientSecret } : undefined;

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <InnerFormRenderer program={program} config={config} />
    </Elements>
  );
}

// ============================================================================

function InnerFormRenderer({ program, config }: { program: FormProgram, config: RegistrationFormConfig }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const [sessionUid, setSessionUid] = useState<string>("");
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);

  const stripe = useStripe();
  const elements = useElements();
  const { user: adminUser } = useAuth();
  const isAdmin = !!adminUser;

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<Record<string, any>>({
    mode: "onTouched",
    defaultValues: {},
  });
  
  const formValues = watch();

  useEffect(() => {
    const initializeDraft = async () => {
      const sessionKey = `kyo_reg_session_${program}`;
      let uid = sessionStorage.getItem(sessionKey);
      if (!uid) {
        uid = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(sessionKey, uid);
      }
      setSessionUid(uid);

      const draft = await getRegistrationDraft(uid);
      
      const defaults: Record<string, any> = {};
      config.questions.forEach(q => {
        if (q.type !== 'section_header' && q.type !== 'payment') {
          if (draft && draft.answers && draft.answers[q.id] !== undefined) {
            defaults[q.id] = draft.answers[q.id];
          } else {
            defaults[q.id] = q.type === 'multiple_choice' ? [] : "";
          }
        }
      });
      reset(defaults);
    };
    initializeDraft();
  }, [program, config, reset]);

  const evaluateCondition = (q: FormQuestion) => {
    if (!q.showIf) return true;
    const { dependsOnId, equalsValue } = q.showIf;
    if (!dependsOnId || !equalsValue) return true;
    
    const val = formValues[dependsOnId];
    if (Array.isArray(val)) {
      return val.includes(equalsValue);
    }
    return String(val) === String(equalsValue);
  };

  const visibleSections = useMemo(() => {
    const sections: FormSection[] = [];
    let currentSection: FormSection = { id: "section_0", headerQuestion: null, questions: [] };
    
    config.questions.forEach((q) => {
      if (q.type === 'section_header') {
        if (currentSection.questions.length > 0 || currentSection.headerQuestion) {
           sections.push(currentSection);
        }
        currentSection = { id: q.id, headerQuestion: q, questions: [] };
      } else {
        if (evaluateCondition(q)) {
          currentSection.questions.push(q);
        }
      }
    });
    
    if (currentSection.questions.length > 0 || currentSection.headerQuestion) {
      sections.push(currentSection);
    }

    return sections.filter(sec => {
       if (sec.headerQuestion && !evaluateCondition(sec.headerQuestion)) {
         return false;
       }
       return true;
    });
  }, [config, formValues]);

  const handleAdminSkip = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentSectionIdx(idx => idx + 1);
      setIsSubmitting(false);
      if (sectionRef.current) {
        const y = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 300);
  };

  const handleNext = async () => {
    const currentSec = visibleSections[currentSectionIdx];
    if (!currentSec) return;

    // We do NOT validate payment element natively via react-hook-form here because 
    // stripe handles its own validation. But we must validate other fields.
    const fieldsToValidate = currentSec.questions.filter(q => q.type !== 'payment').map(q => q.id);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setIsSubmitting(true);
      try {
        await saveRegistrationDraft(sessionUid, {
           program,
           formId: config.id,
           formTitle: config.title,
           answers: formValues,
        });
        setCurrentSectionIdx(prev => prev + 1);
        
        if (sectionRef.current) {
          const y = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } catch (err) {
        console.error("Error saving draft:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setCurrentSectionIdx(prev => Math.max(0, prev - 1));
    if (sectionRef.current) {
      const y = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const onSubmitFinal = async (data: any) => {
    const currentSec = visibleSections[currentSectionIdx];
    const fieldsToValidate = currentSec.questions.filter(q => q.type !== 'payment').map(q => q.id);
    const isValid = await trigger(fieldsToValidate);
    
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const finalAnswers = { ...data };
      
      for (const q of config.questions) {
        if (q.type === 'file_upload' && data[q.id] instanceof FileList) {
          const file = data[q.id][0];
          if (file) {
            const url = await uploadImage(file, `submission_${program}_${Date.now()}`);
            finalAnswers[q.id] = url;
          }
        }
      }

      const paymentQuestion = config.questions.find(q => q.type === 'payment');
      if (paymentQuestion && evaluateCondition(paymentQuestion)) {
        if (!stripe || !elements) {
          throw new Error("Stripe has not loaded correctly.");
        }
        
        // Confirm the payment
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

        if (error) {
          alert(error.message || "An error occurred with the payment.");
          setIsSubmitting(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          finalAnswers[paymentQuestion.id] = paymentIntent.id; // Save confirmation ID
        } else {
          throw new Error("Payment was not successful.");
        }
      }

      const response = await fetch('/api/registrations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program,
          answers: finalAnswers,
          uid: sessionUid
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit registration");
      }

      sessionStorage.removeItem(`kyo_reg_session_${program}`);
      setIsSubmitted(true);
      
      if (config.submissionPage?.redirectUrl) {
        const delay = config.submissionPage.redirectDelaySeconds ?? 5;
        setCountdown(delay);
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              router.push(config.submissionPage!.redirectUrl!);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-green-100 shadow-xl overflow-hidden">
          <div className="h-2 bg-green-500" />
          <CardHeader className="text-center pt-10">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="font-headline text-3xl text-green-900">
              {config.submissionPage?.title || "Thank You!"}
            </CardTitle>
            <CardDescription className="text-lg mt-4 text-green-800/80 leading-relaxed max-w-md mx-auto">
              {config.submissionPage?.message || "Your registration has been successfully received."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-12 pt-6">
            {config.submissionPage?.redirectUrl && countdown !== null && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting you in <span className="font-bold text-primary">{countdown}</span> seconds...
                </p>
                <Button asChild variant="outline" className="gap-2">
                  <a href={config.submissionPage.redirectUrl}>
                    Click here if not redirected <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
            {!config.submissionPage?.redirectUrl && (
              <Button asChild variant="default" size="lg" className="px-10">
                <a href="/">Back to Homepage</a>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const currentSection = visibleSections[currentSectionIdx];
  const isLastSection = currentSectionIdx === visibleSections.length - 1;

  const renderField = (q: FormQuestion) => {
    const error = errors[q.id] as any;

    if (q.type === 'payment') {
      return (
        <div key={q.id} className="space-y-3 bg-muted/10 p-6 rounded-xl border border-primary/10">
          <div>
            <Label className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="[&>p]:inline-block [&>p]:m-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.label || "Payment Deposit"}</ReactMarkdown>
              </span>
              {q.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {q.helpText && (
              <div className="text-sm text-muted-foreground mt-1 prose prose-sm prose-a:text-primary max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.helpText}</ReactMarkdown>
              </div>
            )}
          </div>
          <div className="pt-2">
             <PaymentElement options={{ layout: 'tabs' }} />
          </div>
        </div>
      );
    }

    return (
      <div key={q.id} className="space-y-3">
        <div>
          <Label className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="[&>p]:inline-block [&>p]:m-0">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" /> }}
              >
                {q.label}
              </ReactMarkdown>
            </span>
            {q.required && <span className="text-destructive ml-0.5">*</span>}
            {q.tooltip && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-muted-foreground hover:text-primary transition-colors shrink-0 inline-flex">
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px] text-xs">
                    {q.tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          {q.helpText && (
            <div className="text-sm text-muted-foreground mt-1 prose prose-sm prose-a:text-primary max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}
              >
                {q.helpText}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <Controller
          name={q.id}
          control={control}
          rules={{ 
            required: q.required ? "This field is required" : false,
            ...(q.minLength !== undefined && { minLength: { value: q.minLength, message: `Minimum length is ${q.minLength}` } }),
            ...(q.maxLength !== undefined && { maxLength: { value: q.maxLength, message: `Maximum length is ${q.maxLength}` } }),
            ...(q.min !== undefined && { min: { value: q.min, message: `Minimum value is ${q.min}` } }),
            ...(q.max !== undefined && { max: { value: q.max, message: `Maximum value is ${q.max}` } }),
          }}
          render={({ field }) => {
            switch (q.type) {
              case 'short_text':
              case 'email':
              case 'phone':
              case 'number':
              case 'date':
              case 'time':
                const inputType = q.type === 'email' ? 'email' : 
                                 q.type === 'number' ? 'number' : 
                                 q.type === 'date' ? 'date' : 
                                 q.type === 'time' ? 'time' : 'text';
                return (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type={inputType}
                    min={q.type === 'date' ? q.minDate : q.type === 'number' ? q.min : undefined}
                    max={q.type === 'date' ? q.maxDate : q.type === 'number' ? q.max : undefined}
                    placeholder={q.placeholder}
                    className={cn("bg-background text-base", error && "border-destructive")}
                  />
                );
              case 'long_text':
                return (
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder={q.placeholder}
                    className={cn("bg-background min-h-[120px] text-base", error && "border-destructive")}
                  />
                );
              case 'dropdown':
                return (
                  <div className="flex flex-col space-y-2 mt-2">
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className={cn("bg-background", error && "border-destructive")}>
                        <SelectValue placeholder={q.placeholder || "Select an option"} />
                      </SelectTrigger>
                      <SelectContent>
                        {q.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.value && q.optionDescriptions?.[field.value] && (
                      <div className="bg-primary/5 p-4 rounded-lg mt-2 text-sm prose prose-sm max-w-none prose-a:text-primary">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.optionDescriptions[field.value]}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                );
              case 'single_choice':
                return (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    className="flex flex-col space-y-2 mt-2"
                  >
                    {q.options?.map((opt) => (
                      <div key={opt} className="flex flex-col bg-muted/30 p-3 rounded-lg border border-transparent hover:border-primary/20 transition-colors">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                          <Label htmlFor={`${q.id}-${opt}`} className="flex-1 cursor-pointer font-medium">
                            {opt}
                          </Label>
                        </div>
                        {field.value === opt && q.optionDescriptions?.[opt] && (
                          <div className="mt-3 ml-7 bg-primary/5 p-4 rounded-lg text-sm prose prose-sm max-w-none prose-a:text-primary">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.optionDescriptions[opt]}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                );
              case 'multiple_choice':
                return (
                  <div className="flex flex-col space-y-2 mt-2">
                    {q.options?.map((opt) => {
                      const isChecked = Array.isArray(field.value) && field.value.includes(opt);
                      return (
                        <div key={opt} className="flex flex-col bg-muted/30 p-3 rounded-lg border border-transparent hover:border-primary/20 transition-colors">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`${q.id}-${opt}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current = Array.isArray(field.value) ? field.value : [];
                                if (checked) {
                                  field.onChange([...current, opt]);
                                } else {
                                  field.onChange(current.filter((v: string) => v !== opt));
                                }
                              }}
                            />
                            <Label htmlFor={`${q.id}-${opt}`} className="flex-1 cursor-pointer font-medium leading-tight pt-0.5">
                              {opt}
                            </Label>
                          </div>
                          {isChecked && q.optionDescriptions?.[opt] && (
                            <div className="mt-3 ml-7 bg-primary/5 p-4 rounded-lg text-sm prose prose-sm max-w-none prose-a:text-primary">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.optionDescriptions[opt]}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              case 'true_false':
                return (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    className="flex space-x-6 mt-2"
                  >
                    {["yes", "no"].map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                        <Label htmlFor={`${q.id}-${opt}`} className="cursor-pointer capitalize font-medium">
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                );
              case 'file_upload':
                return (
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept={q.acceptedFileTypes}
                      onChange={(e) => field.onChange(e.target.files)}
                      className={cn("bg-background", error && "border-destructive")}
                    />
                    {q.maxFileSizeMb && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Max file size: {q.maxFileSizeMb}MB
                      </p>
                    )}
                  </div>
                );
              default:
                return (
                   <Input {...field} value={field.value ?? ""} className={cn("bg-background", error && "border-destructive")} />
                );
            }
          }}
        />
        {error && <p className="text-sm text-destructive mt-1 font-medium">{error.message as string}</p>}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto space-y-8 pb-24">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold font-headline tracking-tight">{config.title}</h1>
        {config.description && (
          <div className="text-lg text-muted-foreground max-w-2xl mx-auto prose prose-a:text-primary hover:prose-a:text-primary/80">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
              }}
            >
              {config.description}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {visibleSections.length > 1 && (
        <div className="flex items-center gap-2 mb-8 sticky top-[100px] z-50 bg-background/80 backdrop-blur-md py-4 rounded-b-xl border-b border-primary/5 shadow-sm">
          {visibleSections.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-2 flex-1 rounded-full transition-colors duration-500",
                i <= currentSectionIdx ? "bg-primary" : "bg-primary/10"
              )}
            />
          ))}
        </div>
      )}

      {currentSection && (
         <motion.div
           key={currentSection.id}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
         >
           <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-primary/5">
             {currentSection.headerQuestion && (
               <CardHeader className="bg-primary/5 border-b border-primary/5 pb-8 rounded-t-xl">
                 <CardTitle className="font-headline text-2xl text-primary">{currentSection.headerQuestion.label}</CardTitle>
                 {currentSection.headerQuestion.description && (
                   <CardDescription className="text-base mt-2 prose prose-sm prose-a:text-primary">
                     <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                        }}
                      >
                       {currentSection.headerQuestion.description}
                     </ReactMarkdown>
                   </CardDescription>
                 )}
               </CardHeader>
             )}
             
             <CardContent className={cn("space-y-8", currentSection.headerQuestion ? "pt-8" : "pt-8")}>
                {currentSection.questions.map(renderField)}
             </CardContent>
           </Card>
         </motion.div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handleBack} 
          disabled={currentSectionIdx === 0 || isSubmitting}
          className="w-32"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        {isLastSection ? (
          <Button 
            size="lg" 
            onClick={handleSubmit(onSubmitFinal)} 
            disabled={isSubmitting}
            className="w-40 font-bold"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit"}
          </Button>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
            {isAdmin && (
              <Button 
                type="button"
                variant="outline"
                size="lg"
                onClick={handleAdminSkip}
                disabled={isSubmitting}
                className="font-bold border-primary text-primary"
              >
                Skip (Admin)
              </Button>
            )}
            <Button 
              size="lg" 
              onClick={handleNext} 
              disabled={isSubmitting}
              className="w-40 font-bold group"
            >
              {isSubmitting ? (
                 <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                 <>Next <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
