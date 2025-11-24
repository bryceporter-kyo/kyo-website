
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import buttonData from "@/lib/buttons.json";
import { links as allLinks } from "@/lib/links";
import type { ExternalLink } from "@/lib/links";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type ButtonInfo = {
    id: string;
    location: string;
    text: string;
    linkId: string;
    visible: boolean;
};

const initialButtons: ButtonInfo[] = buttonData.buttons;

export default function ButtonsAdminPage() {
    const { toast } = useToast();
    const [buttons, setButtons] = React.useState<ButtonInfo[]>(initialButtons);
    
    const getLinkForButton = (linkId: string): ExternalLink | undefined => {
        return allLinks.find(link => link.id === linkId);
    }

    const handleVisibilityChange = (buttonId: string, isVisible: boolean) => {
        const updatedButtons = buttons.map(button => 
            button.id === buttonId ? { ...button, visible: isVisible } : button
        );
        setButtons(updatedButtons);
        toast({
            title: "Button Visibility Updated",
            description: `The button is now ${isVisible ? 'visible' : 'hidden'}.`,
        });
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
                        This page lists the primary call-to-action buttons across the website. Use the toggle to control their visibility on the site. The links for these buttons are managed in the "External Links" section.
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
                                <TableHead className="text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {buttons.map((button) => {
                                const link = getLinkForButton(button.linkId);
                                return (
                                <TableRow key={button.id} id={button.id}>
                                    <TableCell className="font-medium">{button.location}</TableCell>
                                    <TableCell>{button.text}</TableCell>
                                    <TableCell>
                                        {link ? (
                                             <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 break-all">
                                                {link.url}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">Link not found</span>
                                        )}
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
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/links#${button.linkId}`}>
                                                <Edit className="mr-2 h-4 w-4"/>
                                                Edit Link
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
