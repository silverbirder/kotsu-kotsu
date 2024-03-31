// Import styles of packages that you've installed.
import "@/styles/globals.css";
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppShellLayout } from "@/app/_components/app-shell-layout";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "こつこつ",
  description: "こつこつ記録するだけ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
            <AppShellLayout>{children}</AppShellLayout>
          </MantineProvider>
        </TRPCReactProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
