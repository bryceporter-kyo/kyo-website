
import ContactCard from "@/components/shared/ContactCard";
import PageHeader from "@/components/shared/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";


export default function ContactPage() {
    const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-support');
    
    return (
        <div>
            <PageHeader
                title="Contact Us"
                subtitle="We'd love to hear from you."
                image={headerImage}
            />
            <section className="container mx-auto">
                <ContactCard />
            </section>
        </div>
    )
}
