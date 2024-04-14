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
import { pagesPath } from "@/lib/$path";

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
        collapsed: {
          desktop: true,
          mobile: !opened,
        },
      }}
      padding="md"
    >
      <AppShellHeader p={"sm"}>
        <Flex gap="md">
          <Burger opened={opened} hiddenFrom="sm" onClick={toggle} size="sm" />
          <a href={pagesPath.$url().path}>
            <Text
              fw={900}
              variant="gradient"
              gradient={{ from: "teal", to: "orange", deg: 90 }}
            >
              こつこつ
            </Text>
          </a>
        </Flex>
      </AppShellHeader>
      <AppShellNavbar p="md">
        <a href={pagesPath.notebooks.$url().path}>ノートブック一覧</a>
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
