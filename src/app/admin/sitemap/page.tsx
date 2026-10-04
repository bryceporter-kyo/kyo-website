"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, GitCommitHorizontal, Loader2, Save, FileEdit, Copy, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchPageMetadata, savePageMetadata, type PageMetadata } from "@/lib/metadata";
import { fetchAllGrants, getGrantUrlPath } from "@/lib/case-for-support";

type SitemapNode = {
  path: string;
  title: string;
  children?: SitemapNode[];
};

export default function SitemapAdminPage() {
  const { toast } = useToast();
  const [selectedNode, setSelectedNode] = useState<SitemapNode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [metadata, setMetadata] = useState<Partial<PageMetadata>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedAscii, setCopiedAscii] = useState(false);
  const [grantNodes, setGrantNodes] = useState<SitemapNode[]>([]);

  useEffect(() => {
    fetchAllGrants()
      .then((grants) => {
        const published = grants.filter((g) => g.published);
        setGrantNodes(
          published.map((g) => ({
            path: getGrantUrlPath(g),
            title: `${g.funderName} (${g.grantCycleYear})`,
          }))
        );
      })
      .catch((err) => {
        console.error("Error loading grants for sitemap:", err);
      });
  }, []);

  const siteStructure = useMemo<SitemapNode[]>(
    () => [
      {
        path: "/",
        title: "Home",
        children: [
          { path: "/about", title: "About Us" },
          { path: "/team", title: "Our Team & Directors" },
          { path: "/staff", title: "Staff & Faculty" },
          {
            path: "/programs/orchestras",
            title: "The Orchestras",
            children: [
              { path: "/programs/registration/orchestras", title: "Orchestra Registration" },
            ],
          },
          {
            path: "/programs/upbeat",
            title: "Upbeat!",
            children: [
              { path: "/programs/registration/upbeat", title: "Upbeat! Registration" },
            ],
          },
          { path: "/programs/lessons", title: "Instrumental Lessons" },
          { path: "/programs/calendar", title: "Events Calendar" },
          { path: "/support-us/ways-to-give", title: "Support Us" },
          { path: "/support-us/donate", title: "Donate" },
          { path: "/support-us/volunteer", title: "Volunteer" },
          {
            path: "/support-us/case-for-support",
            title: "Case for Support",
            children: grantNodes,
          },
          { path: "/contact", title: "Contact" },
          { path: "/internal", title: "Internal Resources" },
          {
            path: "/legal",
            title: "Legal & Policies",
            children: [
              { path: "/legal/privacy-policy", title: "Privacy & Cookie Policy" },
              { path: "/legal/terms-of-use", title: "Terms of Use" },
              { path: "/legal/terms-and-conditions", title: "Terms and Conditions" },
              { path: "/legal/accessibility-policy", title: "Accessibility Policy" },
              { path: "/legal/hiring-policy", title: "Hiring Policy" },
              { path: "/legal/information-accuracy-policy", title: "Information Accuracy Policy" },
              { path: "/legal/protection-of-children-and-vulnerable-persons-policy", title: "Protection of Children Policy" },
            ],
          },
        ],
      },
    ],
    [grantNodes]
  );

  // Load metadata when a node is clicked
  const handleNodeClick = async (node: SitemapNode) => {
    setSelectedNode(node);
    setIsDialogOpen(true);
    setIsLoading(true);

    try {
      const data = await fetchPageMetadata(node.path);
      if (data) {
        setMetadata(data);
      } else {
        // Defaults if no metadata exists yet
        setMetadata({
          title: node.title,
          description: "",
          index: true,
          follow: true,
          ogDescription: "",
          aiSummary: "",
          keywords: "",
        });
      }
    } catch (error) {
      console.error("Error loading metadata", error);
      toast({ title: "Error", description: "Failed to load metadata.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!selectedNode) return;

    setIsSaving(true);
    try {
      await savePageMetadata(selectedNode.path, {
        title: metadata.title || selectedNode.title,
        description: metadata.description || "",
        index: metadata.index ?? true,
        follow: metadata.follow ?? true,
        ogDescription: metadata.ogDescription || metadata.description || "",
        aiSummary: metadata.aiSummary || "",
        keywords: metadata.keywords || "",
      });
      toast({ title: "Metadata Saved", description: `Updated SEO & AI settings for ${selectedNode.path}` });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving metadata", error);
      toast({ title: "Error", description: "Failed to save metadata.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Visual Tree Rendering ---
  const renderVisualNode = (node: SitemapNode, level = 0) => {
    return (
      <div key={node.path} className={`ml-${level * 6} my-2`}>
        <div className="flex items-center gap-2">
          {level > 0 && <GitCommitHorizontal className="h-4 w-4 text-muted-foreground opacity-50" />}
          <Button
            variant="outline"
            className="h-10 px-4 justify-start w-full sm:w-auto min-w-[200px] hover:border-primary group bg-card"
            onClick={() => handleNodeClick(node)}
          >
            <div className="flex flex-col items-start w-full">
              <span className="font-semibold text-sm truncate w-full text-left">{node.title}</span>
              <span className="text-[10px] text-muted-foreground font-mono truncate w-full text-left">{node.path}</span>
            </div>
            <FileEdit className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
          </Button>
        </div>

        {node.children && node.children.length > 0 && (
          <div className={`ml-3 pl-3 border-l-2 border-border/50`}>
            {node.children.map((child) => renderVisualNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // --- ASCII Tree Generation ---
  const generateAsciiTree = (nodes: SitemapNode[], prefix = ""): string => {
    let result = "";
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      const connector = isLast ? "└── " : "├── ";

      result += `${prefix}${connector}${node.title} (${node.path})\n`;

      if (node.children && node.children.length > 0) {
        const childPrefix = prefix + (isLast ? "    " : "│   ");
        result += generateAsciiTree(node.children, childPrefix);
      }
    });
    return result;
  };

  const asciiSitemap = siteStructure[0]
    ? `${siteStructure[0].title} (${siteStructure[0].path})\n` + generateAsciiTree(siteStructure[0].children || [], "")
    : "";

  const handleCopyAscii = () => {
    navigator.clipboard.writeText(asciiSitemap);
    setCopiedAscii(true);
    setTimeout(() => setCopiedAscii(false), 2000);
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="mb-8 flex justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </Button>
      </div>

      <Card className="mb-8 border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 border-b pb-6">
          <CardTitle className="font-headline text-3xl text-primary">Sitemap, SEO & AI Crawlers</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage site structure, page metadata, search indexing, OpenGraph descriptions, and long-form AI crawler summaries.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="mb-6 h-12 w-full max-w-md mx-auto grid grid-cols-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="visual" className="rounded-lg h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">Visual Tree</TabsTrigger>
              <TabsTrigger value="ascii" className="rounded-lg h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">ASCII Format</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="p-4 bg-muted/20 rounded-xl border">
              <p className="text-sm text-muted-foreground mb-6 flex items-center">
                <FileEdit className="mr-2 h-4 w-4" />
                Click on any page block to edit its specific SEO metadata, keywords, and AI summaries.
              </p>
              <div className="pl-2">
                {siteStructure.map((node) => renderVisualNode(node))}
              </div>
            </TabsContent>

            <TabsContent value="ascii" className="p-4">
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={handleCopyAscii}>
                  {copiedAscii ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copiedAscii ? "Copied!" : "Copy to Clipboard"}
                </Button>
              </div>
              <pre className="p-6 bg-slate-950 text-slate-50 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed border shadow-inner">
                {asciiSitemap}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Metadata Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Page SEO & AI Metadata</DialogTitle>
            <DialogDescription className="font-mono text-xs mt-1 text-primary">
              {selectedNode?.path}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meta Title</Label>
                <Input
                  id="title"
                  value={metadata.title || ""}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="e.g. About Us | Kawartha Youth Orchestra"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Meta Description (Standard Search Snippet)</Label>
                <Textarea
                  id="description"
                  value={metadata.description || ""}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  placeholder="A concise summary (120–160 chars) for Google and search results..."
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">Social Sharing Description (OpenGraph / Twitter)</Label>
                <Textarea
                  id="ogDescription"
                  value={metadata.ogDescription || ""}
                  onChange={(e) => setMetadata({ ...metadata, ogDescription: e.target.value })}
                  placeholder="Optional custom description when shared on Facebook, Twitter, LinkedIn..."
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={metadata.keywords || ""}
                  onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                  placeholder="youth orchestra, music education, Peterborough, violin lessons"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated keywords for search engine indexing.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <Label htmlFor="aiSummary">AI Crawler & LLM Summary</Label>
                </div>
                <Textarea
                  id="aiSummary"
                  value={metadata.aiSummary || ""}
                  onChange={(e) => setMetadata({ ...metadata, aiSummary: e.target.value })}
                  placeholder="A detailed paragraph (150–500 words) describing the mission, offerings, audience, and key details of this page for AI search engines like Perplexity, ChatGPT, and Gemini..."
                  className="h-36"
                />
                <p className="text-xs text-muted-foreground">
                  This text is embedded in crawlable semantic markup to help AI search engines understand the complete context of this page.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                  <div className="space-y-0.5">
                    <Label>Index</Label>
                    <p className="text-[10px] text-muted-foreground">Allow search engines to index.</p>
                  </div>
                  <Switch
                    checked={metadata.index ?? true}
                    onCheckedChange={(checked) => setMetadata({ ...metadata, index: checked })}
                  />
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                  <div className="space-y-0.5">
                    <Label>Follow</Label>
                    <p className="text-[10px] text-muted-foreground">Allow following links.</p>
                  </div>
                  <Switch
                    checked={metadata.follow ?? true}
                    onCheckedChange={(checked) => setMetadata({ ...metadata, follow: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveMetadata} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Metadata
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
