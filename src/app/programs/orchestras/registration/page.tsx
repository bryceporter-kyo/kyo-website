
import PageHeader from "@/components/shared/PageHeader";
import { RegistrationFormRenderer } from "@/components/shared/RegistrationFormRenderer";

export default function OrchestraRegistrationPage() {
  return (
    <main className="min-h-screen">
      <PageHeader
        title="Orchestra Registration"
        subtitle="Join the Kawartha Youth Orchestra for our upcoming season."
      />
      
      <div className="container mx-auto px-4 py-12">
        <RegistrationFormRenderer program="orchestras" />
      </div>
    </main>
  );
}
