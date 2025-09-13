import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import InstructorCard from '@/components/shared/InstructorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check } from 'lucide-react';

const instructors = [
    {
        name: 'Kenji Tanaka',
        title: 'Advanced Strings & Conducting',
        bio: 'In addition to his conducting duties, Maestro Tanaka offers advanced private instruction for violin and viola students aiming for a professional career, as well as introductory conducting lessons.',
        image: PlaceHolderImages.find(p => p.id === 'instructor-1')
      },
      {
        name: 'Maria Rossi',
        title: 'Violin & Viola',
        bio: 'With a focus on strong technical foundation and musical expression, Maria Rossi works with students of all levels, from beginners to advanced players preparing for auditions.',
        image: PlaceHolderImages.find(p => p.id === 'instructor-2')
      },
      {
        name: 'David Chen',
        title: 'Piano & Music Theory',
        bio: 'David Chen offers piano lessons for all ages and specializes in making music theory engaging and understandable for all students, providing a crucial supplement to their practical studies.',
        image: PlaceHolderImages.find(p => p.id === 'instructor-3')
      }
];

const instruments = [
  'Violin', 'Viola', 'Cello', 'Double Bass', 'Piano', 'Flute', 'Clarinet', 'Trumpet', 'Percussion'
]

export default function LessonsPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-lessons');

  return (
    <div>
      <PageHeader
        title="Lessons Program"
        subtitle="Individual and group instruction to hone your skills."
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <h2 className="text-3xl font-headline font-bold">About the Program</h2>
            <p className="text-muted-foreground text-lg">
              Our Lessons Program offers personalized instruction from our faculty of experienced and dedicated teaching artists. We provide both individual and small group lessons, allowing for a tailored approach to meet each student's unique goals and learning style. Whether you are a complete beginner or an advanced musician, our instructors are here to guide you on your musical journey.
            </p>
            <p className="text-muted-foreground text-lg">
              Private lessons offer one-on-one attention and a curriculum designed specifically for the student, while group lessons provide a collaborative and social learning environment. We believe that a strong foundation in technique and musicianship is key to a lifetime of musical enjoyment and achievement.
            </p>

            <h2 className="text-3xl font-headline font-bold mt-12">Meet the Instructors</h2>
            <div className="space-y-8">
              {instructors.map((instructor) => (
                <InstructorCard key={instructor.name} {...instructor} />
              ))}
            </div>
          </div>
          
          <div className="md:col-span-1 space-y-8">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Instruments Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                    {instruments.map(inst => (
                        <li key={inst} className="flex items-center gap-2 text-muted-foreground">
                            <Check className="w-5 h-5 text-accent"/>
                            <span>{inst}</span>
                        </li>
                    ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Start Your Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Ready to take the next step? Register today to be matched with an instructor and schedule your first lesson.</p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link href="/register">Register for Lessons</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
