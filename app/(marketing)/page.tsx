import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TrackViewEvent } from "@/components/analytics/track-view-event";
import { CTA } from "@/components/marketing/CTA";
import { ChatDemo } from "@/components/marketing/ChatDemo";
import { FlaviaQuote } from "@/components/marketing/FlaviaQuote";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Topics } from "@/components/marketing/Topics";
import { ValueProps } from "@/components/marketing/ValueProps";
import { WaveDivider } from "@/components/marketing/WaveDivider";
import { getUser } from "@/features/auth/server/get-user";
import { ANALYTICS_EVENTS } from "@/lib/analytics/track";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing");

  return {
    title: t("page.title"),
    description: t("page.description"),
    openGraph: {
      title: t("page.title"),
      description: t("page.description"),
      url: "https://flavia.app",
    },
  };
}

export default async function MarketingHomePage() {
  const user = await getUser();
  const isLoggedIn = !!user;

  return (
    <section className="scroll-smooth">
      <TrackViewEvent event={ANALYTICS_EVENTS.homeViewed} properties={{ surface: "marketing_home" }} />

      <Hero isLoggedIn={isLoggedIn} />

      <WaveDivider variant="cream-to-blush" />

      <FlaviaQuote />

      <WaveDivider variant="blush-to-cream" flip />

      <div className="space-y-14 lg:space-y-16">
        <ChatDemo isLoggedIn={isLoggedIn} />

        <WaveDivider variant="cream-to-blush" />

        <Topics isLoggedIn={isLoggedIn} />
        <HowItWorks />

        <WaveDivider variant="blush-to-cream" />

        <ValueProps />
      </div>

      <div className="mt-14 lg:mt-16">
        <CTA isLoggedIn={isLoggedIn} />
      </div>
    </section>
  );
}
