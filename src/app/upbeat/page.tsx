import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import InstructorCard from '@/components/shared/InstructorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const instructor = {
  name: 'David Chen',
  title: 'Upbeat! Program Director',
  bio: 'David Chen is a specialist in early childhood music education with a talent for making music fun and accessible. His innovative approach combines movement, games, and storytelling to introduce young children to the fundamentals of music.',
  image: PlaceHolderImages.find(p => p.id === 'instructor-3')
};

export default function UpbeatPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-upbeat');

  return (
    <div>
      <PageHeader
        title="Upbeat!"
        subtitle="An inclusive and fun introduction to orchestral music."
        image={headerImage}
      />

      <section className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <h2 className="text-3xl font-headline font-bold">About the Program</h2>
            <p className="text-muted-foreground text-lg">
              Upbeat! is our exciting program designed for younger students (ages 6-9) with little to no prior musical experience. It serves as a fun and engaging entry point into the world of orchestral music. Through interactive musical games, singing, and hands-on experience with various instruments, children discover the joy of making music together.
            </p>
            <p className="text-muted-foreground text-lg">
              The curriculum focuses on developing foundational musical skills such as rhythm, pitch, and listening. Upbeat! provides a pressure-free environment for children to explore their creativity and build a strong foundation for future musical studies, whether in our orchestras or lessons program.
            </p>

            <h2 className="text-3xl font-headline font-bold mt-12">Meet the Instructor</h2>
            <InstructorCard {...instructor} />
          </div>
          
          <div className="md:col-span-1 space-y-8">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg">Session 1 (Ages 6-7)</h4>
                  <p className="text-muted-foreground">Tuesdays, 4:00 PM - 5:00 PM</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Session 2 (Ages 8-9)</h4>
                  <p className="text-muted-foreground">Thursdays, 4:00 PM - 5:00 PM</p>
                </div>
                 <div>
                  <h4 className="font-bold text-lg">Location</h4>
                  <p className="text-muted-foreground">Harmony Hall, Studio B</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Start the Journey!</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No audition required! Spaces are limited, so enroll your child today to begin their musical adventure.</p>
                <Button asChild variant="secondary" className="mt-4 w-full">
                  <Link href="/register">Enroll in Upbeat!</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
