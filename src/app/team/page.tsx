
"use client";

import { useEffect, useState } from "react";
import InstructorCard from "@/components/shared/InstructorCard";
import PageHeader from "@/components/shared/PageHeader";
import { useImages } from "@/components/providers/ImageProvider";
import { fetchStaffFromFirebase, fetchBoardFromFirebase, StaffMember, BoardMember, sortTeamMembers } from "@/lib/staff";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TeamPage() {
    const { getImage } = useImages();
    const headerImage = getImage('page-header-support');
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [board, setBoard] = useState<BoardMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTeam = async () => {
            try {
                const [staffData, boardData] = await Promise.all([
                    fetchStaffFromFirebase(),
                    fetchBoardFromFirebase()
                ]);
                setStaff(staffData);
                setBoard(boardData);
            } catch (error) {
                console.error('Error loading team:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTeam();
    }, []);

    const instructors = sortTeamMembers(staff);
    const sortedBoard = sortTeamMembers(board);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <div className="relative overflow-hidden bg-background">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>
            <PageHeader
                title="Our Team"
                subtitle="Meet the passionate individuals and leaders who make KYO a vibrant place for young musicians to grow. These individuals work tirelessly to inspire young musicians and enrich our community through music."
                image={headerImage}
            />
            <section className="container mx-auto py-20 px-4">
                <div className="space-y-24">
                    {/* Staff Section */}
                    <div>
                        <div className="flex items-center gap-4 mb-10 border-b border-primary/10 pb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-headline font-bold">Teaching & Program Staff</h2>
                                <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-bold mt-1 opacity-70">The Heart of our Education</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-[450px] w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                            >
                                {instructors.map((instructor) => (
                                    <motion.div key={instructor.id} variants={itemVariants}>
                                        <InstructorCard 
                                            name={instructor.name}
                                            title={instructor.title}
                                            bio={instructor.bio ?? ''}
                                            image={getImage(instructor.image || '')}
                                            links={instructor.links}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                    {/* Board Section */}
                    <div>
                        <div className="flex items-center gap-4 mb-10 border-b border-primary/10 pb-4">
                            <div className="p-3 bg-secondary/10 rounded-xl text-secondary-foreground shadow-sm">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-headline font-bold">Board of Directors</h2>
                                <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-bold mt-1 opacity-70">Strategic Vision & Governance</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-[450px] w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                            >
                               {sortedBoard.map((member) => (
                                    <motion.div key={member.id} variants={itemVariants}>
                                        <InstructorCard 
                                            name={member.name}
                                            title={member.title}
                                            bio={member.bio ?? ''}
                                            image={getImage(member.image || '')}
                                            links={member.links}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Join the Team CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 p-16 rounded-[2.5rem] bg-[#0a3d2c] text-white text-center relative overflow-hidden group shadow-2xl border border-white/10"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] z-0" />
                    <div className="relative z-10">
                        <h3 className="text-4xl md:text-5xl font-headline font-bold mb-6">Want to Join Our Mission?</h3>
                        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                            We're always looking for passionate educators and leaders to help us inspire the next generation of musicians.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button asChild size="lg" className="bg-white text-[#0a3d2c] hover:bg-forest-50 px-10 py-8 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all duration-300">
                                <Link href="mailto:Contactus@thekyo.ca">Get in Touch</Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
