"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GrantSchemaType, grantSchema, PROGRAM_OPTIONS } from '@/lib/case-for-support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Loader2, Save, File, X, Info } from 'lucide-react';
import { CsvManagerDialog } from '@/components/shared/CsvManagerDialog';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { uploadDocument, uploadImage, deleteDocumentByUrl } from '@/lib/document-service';
import { Checkbox } from '@/components/ui/checkbox';

interface GrantEditorFormProps {
  initialValues?: Partial<GrantSchemaType>;
  onSubmit: (values: GrantSchemaType) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function GrantEditorForm({ initialValues, onSubmit, onCancel, isSubmitting }: GrantEditorFormProps) {
  const { toast } = useToast();
  
  const form = useForm<GrantSchemaType>({
    resolver: zodResolver(grantSchema),
    defaultValues: {
      organizationName: initialValues?.organizationName || '',
      programOfSupport: initialValues?.programOfSupport || 'Orchestras',
      funderName: initialValues?.funderName || '',
      grantName: initialValues?.grantName || '',
      amountRequested: initialValues?.amountRequested || 0,
      primaryProgram: initialValues?.primaryProgram || 'Orchestras',
      grantCycleYear: initialValues?.grantCycleYear || new Date().getFullYear().toString(),
      submissionDate: initialValues?.submissionDate || new Date().toISOString().split('T')[0],
      published: initialValues?.published ?? false,
      
      fundingType: initialValues?.fundingType || null,
      numberOfYears: initialValues?.numberOfYears || null,
      matchRequired: initialValues?.matchRequired ?? false,
      matchAmount: initialValues?.matchAmount || '',
      applicationDeadline: initialValues?.applicationDeadline || '',
      
      customLetterBody: initialValues?.customLetterBody || [],
      valuesAlignment: initialValues?.valuesAlignment || '',
      reportingPlan: initialValues?.reportingPlan || '',
      recognitionPlan: initialValues?.recognitionPlan || '',
      
      pastSupport: initialValues?.pastSupport || [],
      budgetBreakdown: initialValues?.budgetBreakdown || [],
      timeline: initialValues?.timeline || [],
      grantQA: initialValues?.grantQA || [],
      
      driveFolderUrl: initialValues?.driveFolderUrl || '',
      caseForSupportPdfUrl: initialValues?.caseForSupportPdfUrl || '',
      grantApplicationPdfUrl: initialValues?.grantApplicationPdfUrl || '',
      
      contactName: initialValues?.contactName || '',
      contactEmail: initialValues?.contactEmail || '',
      signerName: initialValues?.signerName || '',
      signerTitle: initialValues?.signerTitle || '',
      
      metaTitle: initialValues?.metaTitle || '',
      metaDescription: initialValues?.metaDescription || '',
      internalNotes: initialValues?.internalNotes || '',
    }
  });

  // Dynamic Arrays
  const budgetArray = useFieldArray({ control: form.control, name: 'budgetBreakdown' });
  const qaArray = useFieldArray({ control: form.control, name: 'grantQA' });
  const timelineArray = useFieldArray({ control: form.control, name: 'timeline' });
  const pastSupportArray = useFieldArray({ control: form.control, name: 'pastSupport' });
  const letterBodyArray = useFieldArray({ control: form.control, name: 'customLetterBody' as never });

  const [uploadingPdf1, setUploadingPdf1] = useState(false);
  const [uploadingPdf2, setUploadingPdf2] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'caseForSupportPdfUrl' | 'grantApplicationPdfUrl', setUploading: (v: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadDocument(file, `grant_${Date.now()}`);
      form.setValue(fieldName, url, { shouldDirty: true });
      toast({ title: "PDF Uploaded successfully!" });
    } catch (error) {
      toast({ title: "Upload failed", description: String(error), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'headerImageUrl', setUploading: (v: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, `grant_header_${Date.now()}`);
      form.setValue(fieldName, url, { shouldDirty: true });
      toast({ title: "Image Uploaded successfully!" });
    } catch (error) {
      toast({ title: "Upload failed", description: String(error), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleBudgetCsvUpload = (parsedData: any[], mode: 'append' | 'overwrite') => {
    const newItems = [];
    for (const row of parsedData) {
      const item = row['item'] || row['Item'] || row['description'];
      const amount = row['amount'] || row['Amount'] || row['cost'];
      const category = row['category'] || row['Category'] || '';
      const subcategory = row['subcategory'] || row['Subcategory'] || '';
      if (item && amount) {
        newItems.push({ item, amount: String(amount), category, subcategory });
      }
    }
    
    if (mode === 'overwrite') {
      budgetArray.replace(newItems);
    } else {
      budgetArray.append(newItems);
    }
    toast({ title: `Imported ${newItems.length} budget items from CSV.` });
  };

  const handleTimelineCsvUpload = (parsedData: any[], mode: 'append' | 'overwrite') => {
    const newItems = [];
    for (const row of parsedData) {
      const milestone = row['milestone'] || row['Milestone'] || row['name'];
      const date = row['date'] || row['Date'];
      const description = row['description'] || row['Description'] || '';
      if (milestone && date) {
        newItems.push({ milestone, date, description });
      }
    }
    
    if (mode === 'overwrite') {
      timelineArray.replace(newItems);
    } else {
      timelineArray.append(newItems);
    }
    toast({ title: `Imported ${newItems.length} timeline milestones from CSV.` });
  };

  const handleQaCsvUpload = (parsedData: any[], mode: 'append' | 'overwrite') => {
    const newItems = [];
    for (const row of parsedData) {
      const question = row['question'] || row['Question'] || row['q'];
      const answer = row['answer'] || row['Answer'] || row['a'];
      if (question && answer) {
        newItems.push({ question, answer });
      }
    }
    
    if (mode === 'overwrite') {
      qaArray.replace(newItems);
    } else {
      qaArray.append(newItems);
    }
    toast({ title: `Imported ${newItems.length} Q&A pairs from CSV.` });
  };

  const handleFormSubmit = async (values: GrantSchemaType) => {
    try {
      // Auto-calculate redundancies
      values.organizationName = "Kawartha Youth Orchestra";
      values.programOfSupport = values.primaryProgram;
      
      // Auto-calculate year from submission date
      if (values.submissionDate) {
        values.grantCycleYear = values.submissionDate.split('-')[0];
      }

      await onSubmit(values);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit, (errors) => {
        console.error("Validation Errors:", errors);
        toast({ title: "Validation Error", description: "Please check all required fields.", variant: "destructive" });
      })} className="space-y-6">
        
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 h-auto p-1">
            <TabsTrigger value="basics" className="py-3">Basic Details</TabsTrigger>
            <TabsTrigger value="narrative" className="py-3">Narrative</TabsTrigger>
            <TabsTrigger value="arrays" className="py-3">Structured Data</TabsTrigger>
            <TabsTrigger value="docs" className="py-3">Documents & SEO</TabsTrigger>
          </TabsList>

          {/* TAB 1: Basics */}
          <TabsContent value="basics">
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle>Core Grant Information</CardTitle>
                <CardDescription>Essential details for the case for support profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <FormField control={form.control} name="funderName" render={({ field }) => (
                    <FormItem><FormLabel>Funder Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="grantName" render={({ field }) => (
                    <FormItem><FormLabel>Grant Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="amountRequested" render={({ field }) => (
                    <FormItem><FormLabel>Amount Requested ($ CAD) *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="primaryProgram" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Program *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PROGRAM_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="submissionDate" render={({ field }) => (
                    <FormItem><FormLabel>Submission Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="fundingType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funding Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="one-time">One-time</SelectItem>
                          <SelectItem value="multi-year">Multi-year</SelectItem>
                          <SelectItem value="matching">Matching</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="numberOfYears" render={({ field }) => (
                    <FormItem><FormLabel>Number of Years (if multi-year)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Narrative */}
          <TabsContent value="narrative">
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle>Narrative & Signatures</CardTitle>
                <CardDescription>Custom letter paragraphs and alignment statements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Custom Letter Array */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Custom Letter Body (Paragraphs)</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => letterBodyArray.append('')}>
                      <Plus className="w-4 h-4 mr-2" /> Add Paragraph
                    </Button>
                  </div>
                  <FormDescription>If left empty, a default template is used.</FormDescription>
                  {letterBodyArray.fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`customLetterBody.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl><Textarea className="min-h-[100px]" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => letterBodyArray.remove(index)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormField control={form.control} name="valuesAlignment" render={({ field }) => (
                  <FormItem><FormLabel>Values Alignment (Why KYO Aligns With Funder)</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="reportingPlan" render={({ field }) => (
                  <FormItem><FormLabel>Reporting Plan</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="recognitionPlan" render={({ field }) => (
                  <FormItem><FormLabel>Recognition Plan</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <FormField control={form.control} name="signerName" render={({ field }) => (
                    <FormItem><FormLabel>Signer Name (Override)</FormLabel><FormControl><Input placeholder="e.g. Jane Doe" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="signerTitle" render={({ field }) => (
                    <FormItem><FormLabel>Signer Title (Override)</FormLabel><FormControl><Input placeholder="e.g. Executive Director" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="contactName" render={({ field }) => (
                    <FormItem><FormLabel>Contact Name (Override)</FormLabel><FormControl><Input placeholder="e.g. Jane Doe" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="contactEmail" render={({ field }) => (
                    <FormItem><FormLabel>Contact Email (Override)</FormLabel><FormControl><Input placeholder="e.g. grants@thekyo.ca" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Structured Data Arrays */}
          <TabsContent value="arrays" className="space-y-6">
            
            {/* BUDGET */}
            <Card className="rounded-[2rem]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Budget Breakdown</CardTitle>
                  <CardDescription>Itemized budget requests.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <CsvManagerDialog
                    title="Manage Budget CSV"
                    description="Import or export budget line items."
                    templateHeaders={['Category', 'Subcategory', 'Item', 'Amount']}
                    templateSampleRow={['Program Costs', 'Instruments', 'Violin Strings', '500']}
                    instructionText="Budget CSV Instructions:
- Provide 1 row per budget item.
- Columns required: 'Item', 'Amount'.
- Optional Columns: 'Category', 'Subcategory'.
- Amount should just be numbers (no $ signs).
- Markdown styling is NOT supported here."
                    existingData={form.watch('budgetBreakdown') || []}
                    onUpload={handleBudgetCsvUpload}
                    triggerButtonText="Import/Export CSV"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => budgetArray.append({ item: '', amount: '' })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetArray.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl">
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <FormField control={form.control} name={`budgetBreakdown.${index}.category`} render={({ field }) => (
                          <FormItem className="flex-1"><FormControl><Input placeholder="Category (Optional)" {...field} value={field.value || ''} className="bg-white" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`budgetBreakdown.${index}.subcategory`} render={({ field }) => (
                          <FormItem className="flex-1"><FormControl><Input placeholder="Subcategory (Optional)" {...field} value={field.value || ''} className="bg-white" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="flex gap-4">
                        <FormField control={form.control} name={`budgetBreakdown.${index}.item`} render={({ field }) => (
                          <FormItem className="flex-1"><FormControl><Input placeholder="Item Description *" {...field} className="bg-white" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`budgetBreakdown.${index}.amount`} render={({ field }) => (
                          <FormItem className="w-48"><FormControl><Input placeholder="$ Amount *" {...field} className="bg-white" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => budgetArray.remove(index)} className="text-destructive mt-1">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* QA */}
            <Card className="rounded-[2rem]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Grant Q&A</CardTitle>
                  <CardDescription>Inline application questions and answers.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <CsvManagerDialog
                    title="Manage Grant Q&A CSV"
                    description="Import or export Q&A pairs for this grant."
                    templateHeaders={['Question', 'Answer']}
                    templateSampleRow={['How many students?', 'We serve over 150 students...']}
                    instructionText="Grant Q&A CSV Instructions:
- Provide 1 row per Question/Answer pair.
- Columns required: 'Question', 'Answer'.
- Markdown STYLING IS SUPPORTED for the 'Answer' column!
  - You can use *italics*, **bold**, [links](https://thekyo.org).
  - To do line breaks in CSV, make sure the answer cell is wrapped in quotes if it spans multiple lines.
- No markdown in the Question column."
                    existingData={form.watch('grantQA') || []}
                    onUpload={handleQaCsvUpload}
                    triggerButtonText="Import/Export CSV"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => qaArray.append({ question: '', answer: '' })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Q&A
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {qaArray.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl">
                    <div className="flex-1 space-y-4">
                      <FormField control={form.control} name={`grantQA.${index}.question`} render={({ field }) => (
                        <FormItem><FormControl><Input placeholder="Question" {...field} className="font-semibold bg-white" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`grantQA.${index}.answer`} render={({ field }) => (
                        <FormItem>
                          <FormControl><Textarea placeholder="Answer" className="min-h-[100px] bg-white" {...field} /></FormControl>
                          <div className="flex justify-between items-center text-xs text-slate-400 mt-1 px-1">
                            <span>Markdown Supported</span>
                            <span>{field.value?.length || 0} characters | {field.value?.split(/\s+/).filter(w => w.length > 0).length || 0} words</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => qaArray.remove(index)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* TIMELINE */}
            <Card className="rounded-[2rem]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Timeline</CardTitle>
                </div>
                <div className="flex gap-2">
                  <CsvManagerDialog
                    title="Manage Timeline CSV"
                    description="Import or export project milestones."
                    templateHeaders={['Milestone', 'Date', 'Description']}
                    templateSampleRow={['Program Launch', '2026-09-01', 'First day of fall semester.']}
                    instructionText="Timeline CSV Instructions:
- Provide 1 row per milestone.
- Required Columns: 'Milestone', 'Date'.
- Optional Columns: 'Description'.
- Date should be in YYYY-MM-DD format (e.g. 2026-09-01).
- Markdown styling is NOT supported here."
                    existingData={form.watch('timeline') || []}
                    onUpload={handleTimelineCsvUpload}
                    triggerButtonText="Import/Export CSV"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => timelineArray.append({ milestone: '', date: '', description: '' })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Milestone
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {timelineArray.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl">
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <FormField control={form.control} name={`timeline.${index}.milestone`} render={({ field }) => (
                          <FormItem className="flex-1"><FormControl><Input placeholder="Milestone Name" {...field} className="bg-white" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`timeline.${index}.date`} render={({ field }) => (
                          <FormItem className="w-48"><FormControl><Input type="date" {...field} className="bg-white" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name={`timeline.${index}.description`} render={({ field }) => (
                        <FormItem><FormControl><Input placeholder="Description (Optional)" {...field} value={field.value || ''} className="bg-white" /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => timelineArray.remove(index)} className="text-destructive mt-1">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* PAST SUPPORT */}
            <Card className="rounded-[2rem]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Past Support History</CardTitle>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => pastSupportArray.append({ year: '', amount: '', note: '' })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Record
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {pastSupportArray.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start">
                    <FormField control={form.control} name={`pastSupport.${index}.year`} render={({ field }) => (
                      <FormItem className="w-32"><FormControl><Input placeholder="Year" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`pastSupport.${index}.amount`} render={({ field }) => (
                      <FormItem className="w-40"><FormControl><Input placeholder="$ Amount" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`pastSupport.${index}.note`} render={({ field }) => (
                      <FormItem className="flex-1"><FormControl><Input placeholder="Note (optional)" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => pastSupportArray.remove(index)} className="text-destructive mt-1">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

          </TabsContent>

          {/* TAB 4: Documents & SEO */}
          <TabsContent value="docs">
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle>Documents, Links & SEO</CardTitle>
                <CardDescription>Attach external links and search engine overrides.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <FormField control={form.control} name="headerImageUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Image (Optional)</FormLabel>
                      <FormControl>
                        {field.value ? (
                          <div className="flex flex-col gap-2 p-3 border rounded-xl bg-slate-50">
                            <img src={field.value} alt="Header Preview" className="w-full h-32 object-cover rounded-lg" />
                            <Button type="button" variant="outline" size="sm" onClick={() => form.setValue('headerImageUrl', null, { shouldDirty: true })}>
                              Remove Image
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'headerImageUrl', setUploadingImage)} disabled={uploadingImage} className="pt-2" />
                            {uploadingImage && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="driveFolderUrl" render={({ field }) => (
                    <FormItem><FormLabel>Drive Folder URL</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="caseForSupportPdfUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case for Support PDF</FormLabel>
                      <FormControl>
                        {field.value ? (
                          <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                            <div className="flex items-center gap-2 truncate">
                              <File className="w-4 h-4 text-primary shrink-0" />
                              <a href={field.value} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">
                                {field.value.split('?')[0].split('/').pop() || 'View PDF'}
                              </a>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => form.setValue('caseForSupportPdfUrl', null, { shouldDirty: true })}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, 'caseForSupportPdfUrl', setUploadingPdf1)} disabled={uploadingPdf1} className="pt-2" />
                            {uploadingPdf1 && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="grantApplicationPdfUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grant Application PDF</FormLabel>
                      <FormControl>
                        {field.value ? (
                          <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                            <div className="flex items-center gap-2 truncate">
                              <File className="w-4 h-4 text-primary shrink-0" />
                              <a href={field.value} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">
                                {field.value.split('?')[0].split('/').pop() || 'View PDF'}
                              </a>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => form.setValue('grantApplicationPdfUrl', null, { shouldDirty: true })}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, 'grantApplicationPdfUrl', setUploadingPdf2)} disabled={uploadingPdf2} className="pt-2" />
                            {uploadingPdf2 && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="internalNotes" render={({ field }) => (
                    <FormItem><FormLabel>Internal Notes (Not Public)</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <FormField control={form.control} name="noIndex" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm bg-slate-50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          NoIndex
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger type="button"><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent className="max-w-[250px]"><p>Recommended. Prevents Google from showing this private grant page in search results.</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="noFollow" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm bg-slate-50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          NoFollow
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger type="button"><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent className="max-w-[250px]"><p>Discouraged. Tells Google not to follow any links on this page. Usually unnecessary unless linking to spam.</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex justify-end gap-4 shadow-lg rounded-t-3xl z-10">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-8" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl px-8" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Grant Profile
          </Button>
        </div>

      </form>
    </Form>
  );
}
