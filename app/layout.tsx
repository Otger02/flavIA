import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import { PostHogProvider } from "@/components/analytics/posthog-provider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Flavia",
  description: "Acompañamiento íntimo con Flavia Dos Santos. Conversaciones que transforman tu vida sexual y emocional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen font-[family-name:var(--font-body)] text-stone-950 antialiased">
        <PostHogProvider />
        {children}
      </body>
    </html>
  );
}