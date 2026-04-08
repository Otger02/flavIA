import { TrackViewEvent } from "@/components/analytics/track-view-event";
import { CTA } from "@/components/marketing/CTA";
import { ChatDemo } from "@/components/marketing/ChatDemo";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Topics } from "@/components/marketing/Topics";
import { ValueProps } from "@/components/marketing/ValueProps";
import { getUser } from "@/features/auth/server/get-user";
import { ANALYTICS_EVENTS } from "@/lib/analytics/track";

export default async function MarketingHomePage() {
  const user = await getUser();
  const isLoggedIn = !!user;

  return (
    <section className="space-y-14 scroll-smooth lg:space-y-16">
      <TrackViewEvent event={ANALYTICS_EVENTS.homeViewed} properties={{ surface: "marketing_home" }} />
      <Hero isLoggedIn={isLoggedIn} />
      <ChatDemo />
      <Topics />
      <HowItWorks />
      <ValueProps />
      <CTA isLoggedIn={isLoggedIn} />
    </section>
  );
}