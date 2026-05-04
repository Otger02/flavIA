import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

function getLocaleFromPathname(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "es";
}

function getLocalizedPathname(pathname: string, locale: string) {
  if (locale === "en") {
    return pathname === "/" ? "/en" : `/en${pathname}`;
  }

  return pathname;
}

function getSafeRedirectPathname(searchParams: URLSearchParams) {
  const redirectTo = searchParams.get("redirectTo");

  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const redirectTo = getSafeRedirectPathname(searchParams);
  const locale = getLocaleFromPathname(redirectTo || "/login");
  const loginPath = getLocalizedPathname("/login", locale);
  const dashboardPath = redirectTo || getLocalizedPathname("/dashboard", locale);

  const errorParam = searchParams.get("error_description");
  if (errorParam) {
    const errorSearchParams = new URLSearchParams({ error: errorParam });

    if (redirectTo) {
      errorSearchParams.set("redirectTo", redirectTo);
    }

    return NextResponse.redirect(`${origin}${loginPath}?${errorSearchParams.toString()}`);
  }

  const code = searchParams.get("code");
  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const isNewUser = data.user?.created_at
        ? Date.now() - new Date(data.user.created_at).getTime() < 2 * 60 * 1000
        : false;

      // Fire welcome email for new users
      if (data.user?.email && isNewUser) {
        void sendWelcomeEmail(data.user.email);
      }

      // New users go to onboarding; returning users or explicit redirectTo go to destination
      if (isNewUser && !redirectTo) {
        const onboardingPath = getLocalizedPathname("/onboarding", locale);
        return NextResponse.redirect(`${origin}${onboardingPath}`);
      }

      return NextResponse.redirect(`${origin}${dashboardPath}`);
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${loginPath}?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return NextResponse.redirect(`${origin}${loginPath}`);
}
