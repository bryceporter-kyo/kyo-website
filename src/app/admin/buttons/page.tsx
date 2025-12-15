
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { 
    fetchButtonsFromFirebase, 
    updateButtonVisibilityInFirebase, 
    updateButtonLinkInFirebase,
    saveButtonToFirebase,
    ButtonConfig,
    LinkInfo
} from "@/lib/buttons";
import { fetchLinksFromFirebase, internalPages, getInternalPageById, updateLinkInFirebase } from "@/lib/links";
import type { ExternalLink } from "@/lib/links";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ButtonsAdminPage() {
    const { toast } = useToast();
    const [buttons, setButtons] = React.useState<ButtonConfig[]>([]);
    const [allLinks, setAllLinks] = React.useState<ExternalLink[]>([]);
    const [editingButton, setEditingButton] = React.useState<ButtonConfig | null>(null);
    const [linkType, setLinkType] = React.useState<'internal' | 'external'>('external');
    const [linkValue, setLinkValue] = React.useState<string>('');
    const [linkUrl, setLinkUrl] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Load buttons and links from Firebase
    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [buttonsData, linksData] = await Promise.all([
                    fetchButtonsFromFirebase(),
                    fetchLinksFromFirebase()
                ]);
                setButtons(buttonsData);
                setAllLinks(linksData);
            } catch (error) {
                console.error('Error loading data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load data from database.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [toast]);

    const getLinkDisplay = (button: ButtonConfig) => {
        if (button.link.type === 'internal') {
            const page = getInternalPageById(button.link.value);
            return {
                url: page?.id || '#',
                text: page?.name ? `Internal: ${page.name}` : 'Internal: Not Found'
            };
        }
        const link = allLinks.find(l => l.id === button.link.value);
        return {
            url: link?.url || '#',
            text: link?.url || 'External: Link not found'
        };
    };

    const handleVisibilityChange = async (buttonId: string, isVisible: boolean) => {
        setIsSaving(true);
        try {
            // First try to update, if fails (doc doesn't exist), save the full button
            const button = buttons.find(b => b.id === buttonId);
            if (button) {
                try {
                    await updateButtonVisibilityInFirebase(buttonId, isVisible);
                } catch {
                    // Document doesn't exist, save the full button
                    await saveButtonToFirebase({ ...button, visible: isVisible });
                }
            }
            
            const updatedButtons = buttons.map(button => 
                button.id === buttonId ? { ...button, visible: isVisible } : button
            );
            setButtons(updatedButtons);
            toast({
                title: "Button Visibility Updated",
                description: `The button is now ${isVisible ? 'visible' : 'hidden'}.`,
            });
        } catch (error) {
            console.error('Error updating visibility:', error);
            toast({
                title: "Error",
                description: "Failed to update button visibility.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = (button: ButtonConfig) => {
        setEditingButton(button);
        setLinkType(button.link.type);
        setLinkValue(button.link.value);
        if (button.link.type === 'external') {
            const link = allLinks.find(l => l.id === button.link.value);
            setLinkUrl(link?.url || '');
        } else {
            setLinkUrl('');
        }
    };

    const handleLinkValueChange = (value: string) => {
        setLinkValue(value);
        if (linkType === 'external') {
            const link = allLinks.find(l => l.id === value);
            setLinkUrl(link?.url || '');
        }
    };

    const handleSaveChanges = async () => {
        if (!editingButton) return;

        setIsSaving(true);
        try {
            // If external link and URL changed, update the link definition
            if (linkType === 'external' && linkValue) {
                const originalLink = allLinks.find(l => l.id === linkValue);
                if (originalLink && originalLink.url !== linkUrl) {
                    await updateLinkInFirebase(linkValue, { url: linkUrl });
                    
                    // Update local links state
                    setAllLinks(allLinks.map(l => 
                        l.id === linkValue ? { ...l, url: linkUrl } : l
                    ));
                    
                    toast({
                        title: "Link Updated",
                        description: "The external link URL has been updated.",
                    });
                }
            }

            const newLink: LinkInfo = { type: linkType, value: linkValue };
            
            // First try to update, if fails, save the full button
            const button = buttons.find(b => b.id === editingButton.id);
            if (button) {
                try {
                    await updateButtonLinkInFirebase(editingButton.id, newLink);
                } catch {
                    // Document doesn't exist, save the full button
                    await saveButtonToFirebase({ ...button, link: newLink });
                }
            }

            const updatedButtons = buttons.map(b =>
                b.id === editingButton.id
                    ? { ...b, link: newLink }
                    : b
            );
            setButtons(updatedButtons);
            setEditingButton(null);
            toast({
                title: "Button Updated!",
                description: "The button link has been saved to the database.",
            });
        } catch (error) {
            console.error('Error updating button:', error);
            toast({
                title: "Error",
                description: "Failed to update button. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="container mx-auto py-12">Loading...</div>;
    }
    
    return (
        <div className="container mx-auto py-12">
            <div className="mb-8">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Manage Site Buttons</CardTitle>
                    <CardDescription>
                        This page lists the primary call-to-action buttons across the website. Use the toggle to control their visibility on the site. Use the edit button to change where they link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Location</TableHead>
                                <TableHead>Button Text</TableHead>
                                <TableHead>Current URL</TableHead>
                                <TableHead className="w-[180px]">Visibility</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {buttons.map((button) => {
                                const linkDisplay = getLinkDisplay(button);
                                return (
                                <TableRow key={button.id} id={button.id}>
                                    <TableCell className="font-medium">{button.location}</TableCell>
                                    <TableCell>{button.text}</TableCell>
                                    <TableCell>
                                        <a href={linkDisplay.url} target={button.link.type === 'external' ? '_blank' : '_self'} rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 break-all">
                                            {linkDisplay.text}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                         <div className="flex items-center gap-2">
                                            <Switch
                                                id={`visibility-${button.id}`}
                                                checked={button.visible}
                                                onCheckedChange={(checked) => handleVisibilityChange(button.id, checked)}
                                                aria-label={`Toggle visibility for ${button.text}`}
                                            />
                                            <Badge variant={button.visible ? 'default' : 'secondary'}>
                                                {button.visible ? 'Visible' : 'Hidden'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleEditClick(button)}>
                                            <Edit className="mr-2 h-4 w-4"/>
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!editingButton} onOpenChange={(isOpen) => !isOpen && setEditingButton(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Button Link</DialogTitle>
                        <DialogDescription>
                            Change the destination for the "{editingButton?.text}" button.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="link-type">Link Type</Label>
                            <Select value={linkType} onValueChange={(value: 'internal' | 'external') => setLinkType(value)}>
                                <SelectTrigger id="link-type">
                                    <SelectValue placeholder="Select link type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="internal">On-Website Page</SelectItem>
                                    <SelectItem value="external">External Link</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="link-value">Destination</Label>
                            {linkType === 'internal' ? (
                                <Select value={linkValue} onValueChange={setLinkValue}>
                                    <SelectTrigger id="link-value">
                                        <SelectValue placeholder="Select a page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {internalPages.map(page => (
                                            <SelectItem key={page.id} value={page.id}>{page.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="space-y-4">
                                    <Select value={linkValue} onValueChange={handleLinkValueChange}>
                                         <SelectTrigger id="link-value">
                                            <SelectValue placeholder="Select an external link" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allLinks.map(link => (
                                                <SelectItem key={link.id} value={link.id}>{link.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    
                                    {linkValue && (
                                        <div className="space-y-2">
                                            <Label htmlFor="link-url">Link URL</Label>
                                            <Input 
                                                id="link-url" 
                                                value={linkUrl} 
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                                placeholder="https://example.com"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Note: Changing this URL will update it for all buttons using this link.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingButton(null)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
