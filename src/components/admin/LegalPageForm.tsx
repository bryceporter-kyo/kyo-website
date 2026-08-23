"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateSlug, type LegalPage } from "@/lib/legal-pages";
import { useRouter } from "next/navigation";

export const legalPageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
  headerImageId: z.string().optional(),
  index: z.boolean(),
  follow: z.boolean(),
  showInFooter: z.boolean(),
  ageMetadata: z.string().optional(),
});

interface LegalPageFormProps {
  initialData?: LegalPage | null;
  onSubmit: (data: z.infer<typeof legalPageSchema>) => Promise<void>;
  isSaving: boolean;
}

export default function LegalPageForm({ initialData, onSubmit, isSaving }: LegalPageFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof legalPageSchema>>({
    resolver: zodResolver(legalPageSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      headerImageId: initialData?.headerImageId || "page-header-terms",
      index: initialData?.index ?? true,
      follow: initialData?.follow ?? true,
      showInFooter: initialData?.showInFooter ?? false,
      ageMetadata: initialData?.ageMetadata || "",
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!initialData) {
      form.setValue("slug", generateSlug(title));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Page Title</FormLabel>
                <FormControl>
                    <Input 
                    placeholder="e.g. Refund Policy" 
                    {...field} 
                    onChange={(e) => {
                        field.onChange(e);
                        handleTitleChange(e);
                    }}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Slug (Internal URL)</FormLabel>
                <FormControl>
                    <Input placeholder="refund_policy" {...field} />
                </FormControl>
                <FormDescription>
                    The URL will be /legal/{field.value || "slug"}
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="headerImageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header Image ID</FormLabel>
              <FormControl>
                <Input placeholder="page-header-terms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-border/50">
          <FormField
            control={form.control}
            name="index"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Index (SEO)</FormLabel>
                  <FormDescription className="text-[10px]">Allow search engines to index this page.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="follow"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Follow (SEO)</FormLabel>
                  <FormDescription className="text-[10px]">Allow search engines to follow links.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showInFooter"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Show in Footer</FormLabel>
                  <FormDescription className="text-[10px]">Link this page in the site footer.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ageMetadata"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Age Metadata</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 13+" className="h-9 text-xs" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Content (Markdown Supported)</FormLabel>
              </div>
              <FormControl>
                <Tabs defaultValue="write" className="w-full">
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="mt-2">
                    <Textarea 
                      placeholder="Write your policy here using Markdown..." 
                      className="min-h-[500px] font-mono text-sm leading-relaxed"
                      {...field} 
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-2">
                    <div className="min-h-[500px] p-4 border rounded-md bg-muted/20 prose prose-slate max-w-none dark:prose-invert prose-headings:font-headline prose-sm overflow-auto">
                      {field.value ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {field.value}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </FormControl>
              <FormDescription>
                Supports GFM Tables & lists.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/legal')} className="w-full md:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
            {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
                <><FileText className="mr-2 h-4 w-4" /> {initialData ? "Update Legal Page" : "Create Legal Page"}</>
            )}
            </Button>
        </div>
      </form>
    </Form>
  );
}
