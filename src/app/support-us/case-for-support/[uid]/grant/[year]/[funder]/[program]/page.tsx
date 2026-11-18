import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchAllGrants } from "@/lib/grants/grants-service";
import PublicGrantCaseForSupportPage, { metadata as parentMetadata } from "../page";

interface Props {
  params: Promise<{
    uid: string;
    year: string;
    funder: string;
    program: string;
  }>;
}

export const metadata: Metadata = parentMetadata;

export default async function DisambiguatedPublicGrantPage(props: Props) {
  return <PublicGrantCaseForSupportPage {...props} />;
}
