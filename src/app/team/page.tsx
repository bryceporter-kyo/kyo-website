
"use client";

import { useEffect, useState } from "react";
import InstructorCard from "@/components/shared/InstructorCard";
import PageHeader from "@/components/shared/PageHeader";
import { useImages } from "@/components/providers/ImageProvider";
import { fetchStaffFromFirebase, fetchBoardFromFirebase, StaffMember, BoardMember } from "@/lib/staff";
import { Skeleton } from "@/components/ui/skeleton";

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

    const instructors = staff.filter(s => s.image);

    return (
        <div>
            <PageHeader
                title="Our Team"
                subtitle="Meet the passionate individuals and leaders who make KYO a vibrant place for young musicians to grow. These individuals work tirelessly to inspire young musicians and enrich our community through music."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="space-y-16">
                    <div>
                        <h3 className="text-2xl font-headline font-bold mb-8 text-left">Teaching & Program Staff</h3>
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-96 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {instructors.map((instructor) => (
                                    <InstructorCard 
                                        key={instructor.id}
                                        name={instructor.name}
                                        title={instructor.title}
                                        bio={instructor.bio ?? ''}
                                        image={getImage(instructor.image || '')}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-2xl font-headline font-bold mb-8 text-left">Board of Directors</h3>
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-96 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                               {board.map((member) => (
                                    <InstructorCard 
                                        key={member.id}
                                        name={member.name}
                                        title={member.title}
                                        bio={member.bio ?? ''}
                                        image={getImage(member.image || '')}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
