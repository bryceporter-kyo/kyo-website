
import InstructorCard from "@/components/shared/InstructorCard";
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getBoard, getStaff } from "@/lib/staff";

export default function TeamPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-support');
    const staff = getStaff();
    const board = getBoard();
    const instructors = staff.filter(s => s.image)

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {instructors.map((instructor) => (
                                <InstructorCard 
                                    key={instructor.id}
                                    name={instructor.name}
                                    title={instructor.title}
                                    bio={instructor.bio ?? ''}
                                    image={PlaceHolderImages.find(p => p.id === instructor.image)}
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
                                    image={PlaceHolderImages.find(p => p.id === member.image)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
