"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

type Props = {
  children: React.ReactNode;
};

export function AppShellLayout({ children }: Props) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShellHeader>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <div>Logo</div>
      </AppShellHeader>
      <AppShellNavbar p="md">Navbar</AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
