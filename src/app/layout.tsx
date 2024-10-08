// Import styles of packages that you've installed.
import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import type { Metadata } from "next";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppShellLayout } from "@/app/_components/app-shell-layout";
import { env } from "@/env";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "こつこつ",
  description: "こつこつ記録するだけ",
  robots: {
    index: true,
  },
  metadataBase: new URL(env.BASE_URL),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <ColorSchemeScript />
        <link
          rel="apple-touch-icon"
          type="image/png"
          href="/apple-touch-icon-180x180.png"
        ></link>
        <link rel="icon" type="image/png" href="/icon-192x192.png"></link>
      </head>
      <body className={inter.className}>
        <TRPCReactProvider>
          <MantineProvider>
            <ModalsProvider>
              <Notifications />
              <AppShellLayout>{children}</AppShellLayout>
            </ModalsProvider>
          </MantineProvider>
        </TRPCReactProvider>
        <SpeedInsights />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
      <Analytics />
    </html>
  );
}
