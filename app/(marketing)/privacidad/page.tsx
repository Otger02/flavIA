import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { privacySections, LEGAL_DATE, APP_NAME } from "@/lib/legal/privacy";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Política de Privacidad — ${APP_NAME}`,
    description: "Cómo recopilamos, usamos y protegemos tus datos personales en FlavIA.",
  };
}



export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      subtitle="Cómo recopilamos, usamos y protegemos tu información personal. Marco legal: Ley 1581 de 2012 (Colombia)."
      sections={privacySections}
      lastUpdated={LEGAL_DATE}
    />
  );
}
