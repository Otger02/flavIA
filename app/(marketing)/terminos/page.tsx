import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { termsSections, LEGAL_DATE, APP_NAME } from "@/lib/legal/terms";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Términos de Uso — ${APP_NAME}`,
    description: "Condiciones de uso del servicio FlavIA. Lee nuestros términos antes de usar la plataforma.",
  };
}



export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos de Uso"
      subtitle="Condiciones que rigen el uso de la plataforma FlavIA. Al acceder al servicio aceptas estas condiciones."
      sections={termsSections}
      lastUpdated={LEGAL_DATE}
    />
  );
}
