import { Metadata } from "next";
import { GrantsAuthGate } from "@/components/grants/GrantsAuthGate";
import { GrantsNav } from "@/components/grants/GrantsNav";

export const metadata: Metadata = {
  title: "KYO Grants Management Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GrantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GrantsAuthGate>
      <div className="min-h-screen bg-background">
        <GrantsNav />
        <main className="container mx-auto px-4 pb-16">
          {children}
        </main>
      </div>
    </GrantsAuthGate>
  );
}
