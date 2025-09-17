import InstructorCard from "@/components/shared/InstructorCard";
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getBoard, getStaff } from "@/lib/staff";

export default function StaffPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-support');
    const staff = getStaff();
    const board = getBoard();
    const instructors = staff.filter(s => s.image)

    return (
        <div>
            <PageHeader
                title="Staff & Board"
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
                <h3 className="text-2xl font-headline font-bold mb-8">Artistic Staff</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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

                <h3 className="text-2xl font-headline font-bold text-center mb-8">Board of Directors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {board.map(member => (
                        <div key={member.id} className="text-center">
                            <h4 className="font-bold text-lg">{member.name}</h4>
                            <p className="text-muted-foreground">{member.title}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
