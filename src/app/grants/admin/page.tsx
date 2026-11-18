"use client";

import React, { useEffect, useState } from "react";
import { 
  Save, RefreshCw, Copy, Check, Sparkles, Activity, Play, 
  Settings as SettingsIcon, FileText, FolderOpen, Calendar, Shield,
  Layers, Plus, Trash2, GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  getGrantsSettings, saveGrantsSettings, logGrantAudit 
} from "@/lib/grants/grants-service";
import { GrantsSettings, GrantStageConfig } from "@/lib/grants/types";
import { generateGrantsAppsScriptCode } from "@/lib/grants/grantsAppsScriptTemplate";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function GrantsSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("connections");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [origin, setOrigin] = useState("");

  const [settings, setSettings] = useState<GrantsSettings | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getGrantsSettings();
      if (!data.appsScriptSecret) {
        const autoSecret = "sec_grants_" + Math.random().toString(36).substring(2, 12);
        data.appsScriptSecret = autoSecret;
      }
      setSettings(data);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error loading settings",
        description: "Failed to load grants settings from Firestore.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await saveGrantsSettings(settings);
      if (user) {
        await logGrantAudit({
          userId: user.uid,
          userEmail: user.email || "",
          action: "UPDATE_GRANTS_SETTINGS",
          summary: "Updated Grants Portal settings & Google connections.",
        });
      }
      toast({
        title: "Settings Saved",
        description: "Grants management configuration updated successfully.",
      });
    } catch (e: any) {
      toast({
        title: "Failed to save",
        description: e.message || "An error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof GrantsSettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const dynamicAppsScriptCode = generateGrantsAppsScriptCode({
    grantApplicationsFolderId: settings?.grantApplicationsFolderId,
    letterheadTemplateDocId: settings?.letterheadTemplateDocId,
    qaTemplateDocId: settings?.qaTemplateDocId,
    grantsCalendarId: settings?.grantsCalendarId,
    secret: settings?.appsScriptSecret,
    websiteUrl: origin,
  });

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(dynamicAppsScriptCode);
    setCopiedCode(true);
    toast({
      title: "Script Copied!",
      description: "Google Apps Script code copied to clipboard.",
    });
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!settings?.appsScriptWebAppUrl) {
      toast({
        title: "Missing Web App URL",
        description: "Please enter your deployed Apps Script Web App URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      const res = await fetch(settings.appsScriptWebAppUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "ping",
          secret: settings.appsScriptSecret,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Handshake failed.");
      }

      toast({
        title: "Google Connection Confirmed! 🎉",
        description: "Handshake verified with your KYO Grants Google Apps Script.",
      });
    } catch (err: any) {
      toast({
        title: "Connection Test Failed",
        description: err.message || "Could not reach Google Apps Script Web App. Ensure deployment access is set to 'Anyone'.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!settings) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold font-headline text-foreground">Grants Portal Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure Google Drive, Docs, Calendar automations and manage standardized pipeline lists.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Settings</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-xl">
          <TabsTrigger value="connections">Google Setup</TabsTrigger>
          <TabsTrigger value="script">Script Code</TabsTrigger>
          <TabsTrigger value="stages">Stages &amp; Workflow</TabsTrigger>
          <TabsTrigger value="lists">Managed Lists</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: GOOGLE CONNECTIONS & WEBHOOK */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="connections" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Google Workspace IDs</CardTitle>
              <CardDescription>
                Provide the Drive, Docs, and Calendar identifiers used for auto-provisioning folders, proposals, and deadlines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3.5 border rounded-xl bg-card">
                  <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                    <FolderOpen className="w-3.5 h-3.5 text-primary" /> Root &quot;Grant Applications&quot; Drive Folder ID
                  </Label>
                  <Input
                    value={settings.grantApplicationsFolderId || ""}
                    onChange={(e) => handleChange("grantApplicationsFolderId", e.target.value)}
                    placeholder="1a2b3c4d5e6f..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Inside this folder, the script creates annual folders (e.g. <code>2026/</code>) and funder subfolders automatically.
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 border rounded-xl bg-card">
                  <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                    <FileText className="w-3.5 h-3.5 text-primary" /> KYO Letterhead Template Doc ID
                  </Label>
                  <Input
                    value={settings.letterheadTemplateDocId || ""}
                    onChange={(e) => handleChange("letterheadTemplateDocId", e.target.value)}
                    placeholder="1BxiMVs0XRA5nFMd..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Copied as a blank starting document whenever a grant advances to <strong>Writing LOI</strong>.
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 border rounded-xl bg-card">
                  <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Q&amp;A Document Template Doc ID (Optional)
                  </Label>
                  <Input
                    value={settings.qaTemplateDocId || ""}
                    onChange={(e) => handleChange("qaTemplateDocId", e.target.value)}
                    placeholder="Optional template doc ID"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Custom look for question tables. If omitted, a clean standard table is generated automatically.
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 border rounded-xl bg-card">
                  <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> &quot;KYO Grants&quot; Shared Google Calendar ID
                  </Label>
                  <Input
                    value={settings.grantsCalendarId || ""}
                    onChange={(e) => handleChange("grantsCalendarId", e.target.value)}
                    placeholder="c_xxxxxxxxxx@group.calendar.google.com"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Every deadline, return-to date, renewal, payment, and reporting milestone posts to this calendar.
                  </p>
                </div>
              </div>

              {/* Shared Webhook Key */}
              <div className="p-3.5 border rounded-xl bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                    <Shield className="w-3.5 h-3.5 text-primary" /> Apps Script Security Secret
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const newSec = "sec_grants_" + Math.random().toString(36).substring(2, 12);
                      handleChange("appsScriptSecret", newSec);
                      toast({ title: "New Secret Generated", description: "Save settings to apply." });
                    }}
                  >
                    Generate New Secret
                  </Button>
                </div>
                <Input
                  value={settings.appsScriptSecret || ""}
                  onChange={(e) => handleChange("appsScriptSecret", e.target.value)}
                  className="font-mono text-xs bg-card max-w-md"
                />
              </div>

              {/* Web App URL & Handshake */}
              <div className="p-4 border rounded-xl bg-card space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">Deployed Apps Script Web App URL</Label>
                  <Input
                    value={settings.appsScriptWebAppUrl || ""}
                    onChange={(e) => handleChange("appsScriptWebAppUrl", e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Verify connection between this portal and your Google Apps Script backend.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isTesting || !settings.appsScriptWebAppUrl}
                    className="gap-2 shrink-0"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>Test Two-Way Handshake</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: APPS SCRIPT CODE */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="script" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Google Apps Script Code</CardTitle>
                <CardDescription>
                  Your configuration values and secret are already baked into this code. Copy and deploy it in Google Apps Script.
                </CardDescription>
              </div>
              <Button onClick={copyScriptToClipboard} size="sm" className="gap-2">
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? "Copied!" : "Copy Full Code"}</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/40 border rounded-xl text-xs space-y-1 text-muted-foreground">
                <div className="font-semibold text-foreground">Deployment Instructions:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Visit <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">script.google.com</a> and click <strong>New project</strong>.</li>
                  <li>Name the project &quot;KYO Grants Backend&quot;.</li>
                  <li>Delete any placeholder code in <code>Code.gs</code>, paste the copied code, and click <strong>Save</strong>.</li>
                  <li>Click <strong>Deploy &rarr; New deployment</strong>, select type <strong>Web app</strong>.</li>
                  <li>Set <em>Execute as</em>: <strong>Me</strong>; set <em>Who has access</em>: <strong>Anyone</strong>.</li>
                  <li>Click <strong>Deploy</strong>, authorize the permissions, and paste the Web App URL into the <em>Google Setup</em> tab.</li>
                </ol>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto max-h-[420px] font-mono text-xs">
                <pre>{dynamicAppsScriptCode}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: STAGES & WORKFLOW */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="stages" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Stages (16 Standard Stages)</CardTitle>
              <CardDescription>
                Stages dictate file-creation triggers, required validation fields, and folder renaming.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y border rounded-xl overflow-hidden">
                {settings.stages.map((stage, idx) => (
                  <div key={stage.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card hover:bg-muted/20">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs font-mono font-bold text-muted-foreground">#{idx + 1}</span>
                      <div>
                        <div className="font-bold text-sm text-foreground flex items-center gap-2">
                          <span>{stage.name}</span>
                          {stage.isTerminal && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">Terminal</Badge>
                          )}
                        </div>
                        {stage.folderStatusText && (
                          <div className="text-[11px] text-muted-foreground font-mono">
                            Folder Tag: &quot;{stage.folderStatusText}&quot;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {stage.createsFiles && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 text-[10px]">
                          ⚡ Auto-Creates Files
                        </Badge>
                      )}
                      {stage.requiredFields && stage.requiredFields.length > 0 && (
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-800 bg-amber-50">
                          Requires: {stage.requiredFields.join(", ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: MANAGED LISTS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="lists" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Standardized Dropdown Options</CardTitle>
              <CardDescription>
                Customize options for focus areas, funder classifications, document types, and leading articles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Focus Areas */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Funder Focus Areas (Multi-Select)</Label>
                <Input
                  value={settings.focusAreas.join(", ")}
                  onChange={(e) => handleChange("focusAreas", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  placeholder="Youth, Music, Arts Education, Community"
                />
                <p className="text-[11px] text-muted-foreground">Comma-separated list of focus area tags.</p>
              </div>

              {/* Funder Types */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Funder Classifications</Label>
                <Input
                  value={settings.funderTypes.join(", ")}
                  onChange={(e) => handleChange("funderTypes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  placeholder="Private foundation, Government, Corporate, Community foundation"
                />
              </div>

              {/* Leading Articles for Sorting */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Leading Articles for Sort-Names</Label>
                <Input
                  value={settings.leadingWords.join(", ")}
                  onChange={(e) => handleChange("leadingWords", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  placeholder="The, A, An, Le, La, Les, L'"
                />
                <p className="text-[11px] text-muted-foreground">
                  Words stripped from the start of funder names and placed in parentheses at the end (e.g. &quot;The Jackman Foundation&quot; &rarr; &quot;Jackman Foundation (The)&quot;).
                </p>
              </div>

              {/* Document Types */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Allowed Document Types</Label>
                <Input
                  value={settings.documentTypes.join(", ")}
                  onChange={(e) => handleChange("documentTypes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                />
                <p className="text-[11px] text-muted-foreground">Used as the middle identifier in file names (e.g. <code>[Funder]: [Type]: [Date]</code>).</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
