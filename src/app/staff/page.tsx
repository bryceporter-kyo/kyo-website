import InstructorCard from "@/components/shared/InstructorCard";
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const instructors = [
    {
        name: 'Kenji Tanaka',
        title: 'Artistic Director & Conductor, Symphony Orchestra',
        bio: 'Maestro Tanaka brings over 20 years of international conducting experience. His dynamic leadership and passion for music inspire students to reach new artistic heights. He is a graduate of the Juilliard School.',
        image: PlaceHolderImages.find(p => p.id === 'instructor-1')
    },
    {
        name: 'Maria Rossi',
        title: 'Conductor, Concert Orchestra',
        bio: 'An accomplished violinist and educator, Maria Rossi is dedicated to developing the ensemble skills of intermediate musicians. Her energetic rehearsals create a positive and engaging learning environment.',
        image: PlaceHolderImages.find(p => p.id === 'instructor-2')
    },
    {
        name: 'David Chen',
        title: 'Upbeat! Program Director & Piano Instructor',
        bio: 'David Chen is a specialist in early childhood music education and offers piano lessons for all ages. His innovative approach combines movement, games, and storytelling to introduce young children to the fundamentals of music.',
        image: PlaceHolderImages.find(p => p.id === 'instructor-3')
    },
];

const boardMembers = [
    { name: 'Eleanor Vance', title: 'Board Chair' },
    { name: 'Samuel Jones', title: 'Vice Chair' },
    { name: 'Olivia Martinez', title: 'Treasurer' },
    { name: 'Benjamin Carter', title: 'Secretary' },
]

export default function StaffPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-support');

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
                        <InstructorCard key={instructor.name} {...instructor} />
                    ))}
                </div>

                <h3 className="text-2xl font-headline font-bold text-center mb-8">Board of Directors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {boardMembers.map(member => (
                        <div key={member.name} className="text-center">
                            <h4 className="font-bold text-lg">{member.name}</h4>
                            <p className="text-muted-foreground">{member.title}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
