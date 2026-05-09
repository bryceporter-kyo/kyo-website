
import InstructorCard from "@/components/shared/InstructorCard";
import PageHeader from "@/components/shared/PageHeader";
import { getImagesFromFirestore } from "@/lib/image-service-server";
import { getBoard, getStaff } from "@/lib/staff";

export default async function StaffPage() {
    const images = await getImagesFromFirestore();
    const getImage = (id: string) => images.find(img => img.id === id);
    const headerImage = getImage('page-header-support');
    const staff = getStaff();
    const board = getBoard();
    const instructors = staff.filter(s => s.image)

    return (
        <div>
            <PageHeader
                title="Staff & Program Board"
                subtitle="The dedicated individuals behind our mission."
                image={headerImage}
            />
            <section className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold">Our Team</h2>
                    <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl mt-4">
                        Meet the passionate educators and leaders who make KYO Hub a vibrant place for young musicians to grow.
                    </p>
                </div>
                <div className="space-y-16">
                    <div>
                        <h3 className="text-2xl font-headline font-bold mb-8 text-left">Teaching & Program Staff</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {instructors.map((instructor) => (
                                <InstructorCard 
                                    key={instructor.id}
                                    name={instructor.name}
                                    title={instructor.title}
                                    bio={instructor.bio ?? ''}
                                    image={getImage(instructor.image || '')}
                                    links={instructor.links}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-headline font-bold mb-8 text-left">Board of Directors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {board.map((member) => (
                                <InstructorCard 
                                    key={member.id}
                                    name={member.name}
                                    title={member.title}
                                    bio={member.bio ?? ''}
                                    image={getImage(member.image || '')}
                                    links={member.links}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

    