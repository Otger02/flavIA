import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getLocale as getRequestLocale, getMessages, getTranslations } from "next-intl/server";
import { Fraunces, Inter } from "next/font/google";

import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { routing } from "@/i18n/routing";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navigation");
  return {
    title: {
      default: t("site.title_default"),
      template: t("site.title_template"),
    },
    description: t("site.description"),
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://flavia.app"),
    manifest: "/manifest.json",
    icons: {
      icon: "/favicon.svg",
    },
    other: {
      "theme-color": "#c4605a",
    },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: "Flavia",
      title: t("site.title_default"),
      description: t("site.description"),
      url: "https://flavia.app",
    },
    twitter: {
      card: "summary_large_image",
      title: t("site.title_default"),
      description: t("site.description"),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  const [resolvedParams, requestLocale, messages] = await Promise.all([
    params,
    getRequestLocale(),
    getMessages(),
  ]);
  const locale = hasLocale(routing.locales, resolvedParams?.locale)
    ? resolvedParams.locale
    : hasLocale(routing.locales, requestLocale)
      ? requestLocale
      : routing.defaultLocale;

  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen font-[family-name:var(--font-body)] text-stone-950 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PostHogProvider />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}