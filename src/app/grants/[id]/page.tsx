import { redirect } from "next/navigation";

export default async function GrantIdRootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/grants/${id}/overview`);
}
