import NextImage from "next/image";
import { Image, Text, Stack } from "@mantine/core";

export function NotebookSection() {
  return (
    <Stack
      gap={"md"}
      align={"center"}
      justify={"flex-start"}
      style={{ flex: "1 1 45%", maxWidth: "330px" }}
    >
      <Image
        component={NextImage}
        radius="md"
        src={"/lp.webp"}
        alt="ノートブックとページ"
        width={330}
        height={330}
        style={{ width: "100%", height: "auto" }}
      />
      <Text size="md">
        こつこつは、日々の記録を簡単に行うことができるアプリです。健康管理、学習の進捗、日々の気づきを記録して、振り返ることができます。
      </Text>
    </Stack>
  );
}
