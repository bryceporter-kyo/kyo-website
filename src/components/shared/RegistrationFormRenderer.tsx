
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RegistrationFormConfig, FormQuestion, FormProgram } from "@/lib/registration-form";
import { getRegistrationForm } from "@/lib/registration-form-service";
import { saveRegistrationSubmission } from "@/lib/registration-submission-service";
import { uploadImage } from "@/lib/image-service"; // Reusing this for now, we can specialize later if needed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, ArrowRight, ExternalLink, Paperclip, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RegistrationFormRendererProps {
  program: FormProgram;
}

export function RegistrationFormRenderer({ program }: RegistrationFormRendererProps) {
  const router = useRouter();
  const [config, setConfig] = useState<RegistrationFormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // ── 1. Fetch Config ─────────────────────────────────────────────────────────
  useEffect(() => {
    getRegistrationForm(program)
      .then(setConfig)
      .finally(() => setIsLoading(false));
  }, [program]);

  // ── 2. Schema Generation ───────────────────────────────────────────────────
  // We build a dynamic Zod schema based on the question config
  const formSchema = config ? z.object(
    config.questions.reduce((acc, q) => {
      if (q.type === 'section_header') return acc;

      let field: z.ZodTypeAny;

      switch (q.type) {
        case 'email':
          field = z.string().email("Invalid email address");
          break;
        case 'number':
        case 'rating':
          field = z.coerce.number();
          if (q.min !== undefined) field = (field as z.ZodNumber).min(q.min);
          if (q.max !== undefined) field = (field as z.ZodNumber).max(q.max);
          break;
        case 'multiple_choice':
          field = z.array(z.string());
          if (q.required) field = (field as z.ZodArray<any>).min(1, "Please select at least one option");
          break;
        case 'true_false':
          field = z.enum(["yes", "no"]);
          break;
        default:
          field = z.string();
      }

      if (!q.required && q.type !== 'multiple_choice') {
        field = field.optional().or(z.literal(""));
      } else if (q.required && q.type !== 'multiple_choice' && q.type !== 'true_false') {
        field = (field as z.ZodString).min(1, "This field is required");
      }

      acc[q.id] = field;
      return acc;
    }, {} as any)
  ) : z.object({});

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: config?.questions.reduce((acc, q) => {
      if (q.type === 'section_header') return acc;
      acc[q.id] = q.type === 'multiple_choice' ? [] : "";
      return acc;
    }, {} as any) || {},
  });

  // ── 3. Handle Submission ───────────────────────────────────────────────────
  const onSubmit = async (data: any) => {
    if (!config) return;
    setIsSubmitting(true);
    try {
      // 1. Handle File Uploads first if any
      const finalAnswers = { ...data };
      for (const q of config.questions) {
        if (q.type === 'file_upload' && data[q.id] instanceof FileList) {
          const file = data[q.id][0];
          if (file) {
            // Upload to a specialized path for submissions
            const url = await uploadImage(file, `submission_${program}_${Date.now()}`);
            finalAnswers[q.id] = url;
          }
        }
      }

      // 2. Submit to the Server API (handles Firestore + Webhooks)
      const response = await fetch('/api/registrations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program,
          answers: finalAnswers,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Submission failed");
      }

      setIsSubmitted(true);
      
      // 3. Handle Redirect Countdown
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
      alert("Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 4. Renderers ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading registration form...</p>
      </div>
    );
  }

  if (!config || (!config.isOpen && !isSubmitted)) {
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24">
      {/* ── Form Header ── */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold font-headline tracking-tight">{config.title}</h1>
        {config.description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {config.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {config.questions.map((q, idx) => {
          if (q.type === 'section_header') {
            return (
              <div key={q.id} className={cn("pt-8 pb-2 space-y-2", idx === 0 && "pt-0")}>
                <h2 className="text-2xl font-bold font-headline">{q.label}</h2>
                {q.helpText && (
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.helpText}</ReactMarkdown>
                  </div>
                )}
                <Separator className="mt-4" />
              </div>
            );
          }

          return (
            <div key={q.id} className="space-y-4 group">
              <div className="space-y-1.5">
                <Label 
                  htmlFor={q.id} 
                  className={cn(
                    "text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    errors[q.id] && "text-destructive"
                  )}
                >
                  {q.label}
                  {q.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {/* Help Text (Markdown) */}
                {q.helpText && (
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.helpText}</ReactMarkdown>
                  </div>
                )}

                {/* Attached Image */}
                {q.imageUrl && (
                  <div className="my-3 rounded-lg overflow-hidden border bg-muted shadow-sm max-w-md">
                    <img src={q.imageUrl} alt={q.label} className="w-full h-auto object-contain max-h-[300px]" />
                  </div>
                )}

                {/* Attached Links */}
                {q.links && q.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-2">
                    {q.links.map((link, i) => (
                      <Button key={i} asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          {link.label || "Link"}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Input Controls ── */}
              <div className="mt-2">
                <Controller
                  name={q.id}
                  control={control}
                  render={({ field }) => {
                    switch (q.type) {
                      case 'long_text':
                        return (
                          <Textarea 
                            {...field} 
                            id={q.id} 
                            placeholder={q.placeholder} 
                            className="min-h-[120px] focus-visible:ring-primary shadow-sm"
                          />
                        );
                      
                      case 'dropdown':
                        return (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id={q.id} className="focus:ring-primary shadow-sm">
                              <SelectValue placeholder={q.placeholder || "Select an option..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {q.options?.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );

                      case 'single_choice':
                        return (
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-2 pt-1">
                            {q.options?.map(opt => (
                              <div key={opt} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-md border border-transparent hover:border-primary/20 transition-all cursor-pointer" onClick={() => field.onChange(opt)}>
                                <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                                <Label htmlFor={`${q.id}-${opt}`} className="font-normal cursor-pointer flex-1">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        );

                      case 'multiple_choice':
                        return (
                          <div className="flex flex-col gap-2 pt-1">
                            {q.options?.map(opt => (
                              <div key={opt} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-md border border-transparent hover:border-primary/20 transition-all">
                                <Checkbox 
                                  id={`${q.id}-${opt}`}
                                  checked={(field.value as string[])?.includes(opt)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value as string[] || [];
                                    const next = checked 
                                      ? [...current, opt]
                                      : current.filter(val => val !== opt);
                                    field.onChange(next);
                                  }}
                                />
                                <Label htmlFor={`${q.id}-${opt}`} className="font-normal cursor-pointer flex-1">{opt}</Label>
                              </div>
                            ))}
                          </div>
                        );

                      case 'true_false':
                        return (
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-1">
                            <div className="flex items-center space-x-2 bg-muted/30 px-6 py-3 rounded-md border border-transparent hover:border-primary/20 transition-all cursor-pointer" onClick={() => field.onChange("yes")}>
                              <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                              <Label htmlFor={`${q.id}-yes`} className="font-medium cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-muted/30 px-6 py-3 rounded-md border border-transparent hover:border-primary/20 transition-all cursor-pointer" onClick={() => field.onChange("no")}>
                              <RadioGroupItem value="no" id={`${q.id}-no`} />
                              <Label htmlFor={`${q.id}-no`} className="font-medium cursor-pointer">No</Label>
                            </div>
                          </RadioGroup>
                        );

                      case 'file_upload':
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => document.getElementById(`${q.id}-file`)?.click()}
                                className="gap-2 border-dashed"
                              >
                                <Paperclip className="h-4 w-4" />
                                {field.value instanceof FileList && field.value[0] 
                                  ? field.value[0].name 
                                  : "Attach file"}
                              </Button>
                              <input 
                                type="file" 
                                id={`${q.id}-file`}
                                className="hidden"
                                onChange={(e) => field.onChange(e.target.files)}
                                accept={q.acceptedFileTypes}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {q.acceptedFileTypes ? `Supported: ${q.acceptedFileTypes}` : "All file types supported."}
                              {q.maxFileSizeMb ? ` Max size: ${q.maxFileSizeMb}MB` : ""}
                            </p>
                          </div>
                        );

                      default:
                        return (
                          <Input 
                            {...field} 
                            id={q.id} 
                            type={q.type === 'number' || q.type === 'rating' ? 'number' : q.type === 'date' ? 'date' : 'text'}
                            placeholder={q.placeholder} 
                            className="focus-visible:ring-primary shadow-sm"
                          />
                        );
                    }
                  }}
                />
              </div>

              {/* ── Error Message ── */}
              {errors[q.id] && (
                <p className="text-sm font-medium text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors[q.id]?.message as string}
                </p>
              )}
            </div>
          );
        })}

        <div className="pt-10">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg font-headline shadow-lg group relative overflow-hidden"
            disabled={isSubmitting}
          >
            <span className={cn("flex items-center gap-2", isSubmitting && "opacity-0")}>
              Submit Registration <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Submitting...</span>
              </div>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            By submitting this form, you agree to our privacy policy and terms of use.
          </p>
        </div>
      </form>
    </div>
  );
}
