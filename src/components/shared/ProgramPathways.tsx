
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, GraduationCap, School, Star } from "lucide-react";

const pathways = [
    {
        title: "Beginner Lessons & JKYO",
        level: "RCM Grades 1-2",
        description: "Starting their journey with foundational skills in group lessons or our Junior Orchestra.",
        icon: GraduationCap,
    },
    {
        title: "Intermediate KYO (IKYO)",
        level: "RCM Grades 3-5",
        description: "Developing ensemble skills with a full orchestra, playing classical and popular music.",
        icon: School,
    },
    {
        title: "Senior KYO (SKYO)",
        level: "RCM Grade 6+",
        description: "Performing advanced repertoire in our premier ensemble with professional-level training.",
        icon: Star,
    }
]

export default function ProgramPathways() {
    return (
        <section className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-bold">A Pathway for Growth</h2>
                <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                    Our programs provide a clear and structured progression for musicians, from their very first notes to advanced performance.
                </p>
            </div>
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-0">
                {pathways.map((path, index) => (
                     <div key={path.title} className="flex flex-col md:flex-row items-center w-full">
                        <Card className="text-center flex flex-col flex-grow w-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                            <CardHeader className="items-center">
                                <div className="bg-primary text-primary-foreground p-4 rounded-full">
                                    <path.icon className="h-8 w-8" />
                                </div>
                                <CardTitle className="font-headline text-2xl pt-4">{path.title}</CardTitle>
                                <CardDescription className="font-bold">{path.level}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground">{path.description}</p>
                            </CardContent>
                        </Card>
                        {index < pathways.length - 1 && (
                            <ArrowRight className="w-12 h-12 text-primary/30 mx-4 my-4 md:my-0 shrink-0 transform rotate-90 md:rotate-0" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
