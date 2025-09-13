import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import InstructorCard from '@/components/shared/InstructorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  }
];

export default function OrchestrasPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-orchestras');

  return (
    <div>
      <PageHeader
        title="Orchestras"
        subtitle="Our flagship programs for dedicated young musicians."
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <h2 className="text-3xl font-headline font-bold">About the Program</h2>
            <p className="text-muted-foreground text-lg">
              The KYO Hub Orchestras provide a comprehensive and inspiring ensemble experience for young musicians. We offer multiple orchestra levels to cater to varying ages and skill sets, ensuring a challenging and rewarding environment for every student. Through weekly rehearsals and regular performances, students develop their technical skills, musicality, and ability to collaborate within a large ensemble.
            </p>
            <p className="text-muted-foreground text-lg">
              Our repertoire is carefully selected to be both educational and engaging, spanning from classical masterworks to contemporary compositions. Students gain invaluable performance experience in professional venues, building confidence and stage presence.
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
                <CardTitle className="font-headline text-2xl">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg">Symphony Orchestra</h4>
                  <p className="text-muted-foreground">Saturdays, 9:00 AM - 12:00 PM</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Concert Orchestra</h4>
                  <p className="text-muted-foreground">Saturdays, 1:00 PM - 3:30 PM</p>
                </div>
                 <div>
                  <h4 className="font-bold text-lg">Location</h4>
                  <p className="text-muted-foreground">Harmony Hall, Main Auditorium</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Ready to Join?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Auditions are required for our orchestra programs. Find out more and sign up to audition today!</p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link href="/register">Register for Auditions</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
