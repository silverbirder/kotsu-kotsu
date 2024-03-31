"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Flex,
  Text,
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
        <Flex gap="md">
          <Burger opened={opened} hiddenFrom="sm" onClick={toggle} size="sm" />
          <Text
            fw={900}
            variant="gradient"
            gradient={{ from: "teal", to: "orange", deg: 90 }}
          >
            Kotsu Kotsu
          </Text>
        </Flex>
      </AppShellHeader>
      <AppShellNavbar p="md">Navbar</AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
