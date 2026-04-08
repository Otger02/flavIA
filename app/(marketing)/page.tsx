import { TrackViewEvent } from "@/components/analytics/track-view-event";
import { CTA } from "@/components/marketing/CTA";
import { ChatDemo } from "@/components/marketing/ChatDemo";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Topics } from "@/components/marketing/Topics";
import { ValueProps } from "@/components/marketing/ValueProps";
import { ANALYTICS_EVENTS } from "@/lib/analytics/track";

export default function MarketingHomePage() {
  return (
    <section className="space-y-14 scroll-smooth lg:space-y-16">
      <TrackViewEvent event={ANALYTICS_EVENTS.homeViewed} properties={{ surface: "marketing_home" }} />
      <Hero />
      <ChatDemo />
      <Topics />
      <HowItWorks />
      <ValueProps />
      <CTA />
    </section>
  );
}