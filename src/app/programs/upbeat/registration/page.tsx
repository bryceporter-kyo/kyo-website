
import PageHeader from "@/components/shared/PageHeader";
import { RegistrationFormRenderer } from "@/components/shared/RegistrationFormRenderer";

export default function UpBeatRegistrationPage() {
  return (
    <main className="min-h-screen">
      <PageHeader
        title="UpBeat Registration"
        subtitle="Sign up for our inclusive UpBeat musical program."
      />
      
      <div className="container mx-auto px-4 py-12">
        <RegistrationFormRenderer program="upbeat" />
      </div>
    </main>
  );
}
