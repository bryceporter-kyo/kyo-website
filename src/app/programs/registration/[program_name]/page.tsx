import { notFound } from "next/navigation";
import { RegistrationFormRenderer } from "@/components/shared/RegistrationFormRenderer";
import { FormProgram } from "@/lib/registration-form";

interface Props {
  params: Promise<{
    program_name: string;
  }>;
}

export default async function DynamicRegistrationPage(props: Props) {
  const unwrappedParams = await props.params;
  const program = unwrappedParams.program_name as FormProgram;

  // Validate that it's a known program. 
  // We can expand this list or make it dynamic if we change the core type later.
  if (program !== "orchestras" && program !== "upbeat") {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <RegistrationFormRenderer program={program} />
      </div>
    </main>
  );
}
