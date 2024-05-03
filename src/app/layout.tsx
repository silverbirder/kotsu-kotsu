// Import styles of packages that you've installed.
import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppShellLayout } from "@/app/_components/app-shell-layout";
import { env } from "@/env";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "こつこつ",
  description: "こつこつ記録するだけ",
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
    </html>
  );
}
