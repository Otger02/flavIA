import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUser } from "@/features/auth/server/get-user";
import { getLocale } from "@/lib/locale";

function getLocalizedPathname(pathname: string, locale: string) {
  if (locale === "en") {
    return pathname === "/" ? "/en" : `/en${pathname}`;
  }

  return pathname;
}

function getLocaleFromPathname(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : null;
}

// Use this helper from protected server layouts, pages and actions.
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    const requestHeaders = await headers();
    const requestPath = requestHeaders.get("x-pathname") || "/dashboard";
    const locale = getLocaleFromPathname(requestPath) ?? await getLocale();
    const loginPath = getLocalizedPathname("/login", locale);
    const searchParams = new URLSearchParams({
      redirectTo: requestPath,
    });

    redirect(`${loginPath}?${searchParams.toString()}`);
  }

  return user;
}