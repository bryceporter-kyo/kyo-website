
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import buttonData from "@/lib/buttons.json";
import { links as allLinks, internalPages, getLinkById, getInternalPageById } from "@/lib/links";
import type { ExternalLink } from "@/lib/links";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type LinkInfo = {
    type: 'internal' | 'external';
    value: string;
};

type ButtonInfo = {
    id: string;
    location: string;
    text: string;
    link: LinkInfo;
    visible: boolean;
};

const initialButtons: ButtonInfo[] = buttonData.buttons;

export default function ButtonsAdminPage() {
    const { toast } = useToast();
    const [buttons, setButtons] = React.useState<ButtonInfo[]>(initialButtons);
    const [editingButton, setEditingButton] = React.useState<ButtonInfo | null>(null);
    const [linkType, setLinkType] = React.useState<'internal' | 'external'>('external');
    const [linkValue, setLinkValue] = React.useState<string>('');

    const getLinkDisplay = (button: ButtonInfo) => {
        if (button.link.type === 'internal') {
            const page = getInternalPageById(button.link.value);
            return {
                url: page?.id || '#',
                text: page?.name ? `Internal: ${page.name}` : 'Internal: Not Found'
            };
        }
        const link = getLinkById(button.link.value);
        return {
            url: link?.url || '#',
            text: link?.url || 'External: Link not found'
        };
    };

    const handleVisibilityChange = (buttonId: string, isVisible: boolean) => {
        const updatedButtons = buttons.map(button => 
            button.id === buttonId ? { ...button, visible: isVisible } : button
        );
        setButtons(updatedButtons);
        toast({
            title: "Button Visibility Updated",
            description: `The button is now ${isVisible ? 'visible' : 'hidden'}.`,
        });
    };

    const handleEditClick = (button: ButtonInfo) => {
        setEditingButton(button);
        setLinkType(button.link.type);
        setLinkValue(button.link.value);
    };

    const handleSaveChanges = () => {
        if (!editingButton) return;

        const updatedButtons = buttons.map(b =>
            b.id === editingButton.id
                ? { ...b, link: { type: linkType, value: linkValue } }
                : b
        );
        setButtons(updatedButtons);
        setEditingButton(null);
        toast({
            title: "Button Updated!",
            description: "The button link has been saved successfully.",
        });
    };
    
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
                                <Select value={linkValue} onValueChange={setLinkValue}>
                                     <SelectTrigger id="link-value">
                                        <SelectValue placeholder="Select an external link" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allLinks.map(link => (
                                            <SelectItem key={link.id} value={link.id}>{link.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingButton(null)}>Cancel</Button>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
