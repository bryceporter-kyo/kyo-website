import { notFound, redirect } from "next/navigation";
import { RegistrationFormRenderer } from "@/components/shared/RegistrationFormRenderer";
import { FormProgram } from "@/lib/registration-form";
import { getRegistrationFormServer } from "@/lib/registration-form-service";

interface Props {
  params: Promise<{
    program_name: string;
  }>;
}

export function generateStaticParams() {
  return [
    { program_name: 'orchestras' },
    { program_name: 'upbeat' },
  ];
}

export default async function DynamicRegistrationPage(props: Props) {
  const unwrappedParams = await props.params;
  const program = unwrappedParams.program_name as FormProgram;

  // Validate that it's a known program. 
  // We can expand this list or make it dynamic if we change the core type later.
  if (program !== "orchestras" && program !== "upbeat") {
    notFound();
  }

  // Check if this program is set to redirect to a Google Form
  const formConfig = await getRegistrationFormServer(program);
  if (formConfig?.registrationType === 'google_form' && formConfig.googleFormUrl) {
    redirect(formConfig.googleFormUrl);
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <RegistrationFormRenderer program={program} />
      </div>
    </main>
  );
}
