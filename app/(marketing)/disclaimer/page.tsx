import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { disclaimerSections, LEGAL_DATE, APP_NAME } from "@/lib/legal/disclaimer";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Aviso Médico y Legal — ${APP_NAME}`,
    description: "FlavIA no ofrece terapia ni atención médica. Lee este aviso importante antes de usar el servicio.",
  };
}

export const dynamic = "force-dynamic";

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Aviso Médico y Legal"
      subtitle="FlavIA es un servicio de orientación e información, no de atención médica o psicológica. Este aviso es importante."
      sections={disclaimerSections}
      lastUpdated={LEGAL_DATE}
    />
  );
}
