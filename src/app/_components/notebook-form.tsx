"use client";

import { api } from "@/trpc/react";
import { TextInput, Flex, Select, Button, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { pagesPath } from "@/lib/$path";
import { useForm } from "@mantine/form";
import { useCallback } from "react";
import { IconCirclePlus, IconCircleMinus } from "@tabler/icons-react";

type Item = {
  label: string;
  valueType: "string" | "number" | "boolean" | "array";
  array: string[];
};

const initItem = {
  label: "",
  valueType: "string" as const,
  array: [""],
};

export function NotebookForm() {
  const form = useForm<{ title: string; items: Item[] }>({
    initialValues: {
      title: "",
      items: [initItem],
    },
  });
  const selectOptions = [
    {
      value: "number",
      label: "数値",
    },
    {
      value: "string",
      label: "文字",
    },
    {
      value: "boolean",
      label: "はい・いいえ",
    },
    {
      value: "array",
      label: "複数値",
    },
  ];
  const create = api.notebook.create.useMutation();
  const router = useRouter();

  const handleSubmit = useCallback(() => {
    const formValues = form.values;
    create.mutate(
      {
        title: formValues.title,
        entries: formValues.items,
      },
      {
        onSuccess: (data) => {
          notifications.show({
            title: "作成完了",
            message: "ノートブックが作成したよ！",
          });
          router.push(
            pagesPath.notebooks._notebookId(data.notebookId ?? 0).$url().path
          );
        },
        onError: () => {
          notifications.show({
            title: "作成失敗",
            message: "ノートブックに作成できなかったよ",
            color: "red",
          });
        },
      }
    );
  }, [form, create, router]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack align="flex-start" gap="lg">
        <TextInput label="タイトル" {...form.getInputProps("title")} />
        <Flex
          direction={"column"}
          gap="sm"
          align="flex-start"
          justify="flex-start"
        >
          {form.values.items.map((item, itemIndex) => (
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={"sm"}
              key={itemIndex}
              align="flex-start"
              justify="flex-start"
            >
              <Flex gap={"sm"} mt={24}>
                <Button
                  leftSection={<IconCirclePlus size={14} />}
                  onClick={() => form.insertListItem("items", initItem)}
                >
                  追加
                </Button>
                <Button
                  leftSection={<IconCircleMinus size={14} />}
                  onClick={() => form.removeListItem("items", itemIndex)}
                  color="red"
                  disabled={form.values.items.length === 1}
                >
                  削除
                </Button>
              </Flex>
              <TextInput
                label="ラベル名"
                {...form.getInputProps(`items.${itemIndex}.label`)}
              />
              <Select
                label="種類"
                data={selectOptions}
                {...form.getInputProps(`items.${itemIndex}.valueType`)}
              />
              {item.valueType === "array" && (
                <Flex direction={"column"}>
                  {item.array.map((_, aryIndex) => (
                    <Flex
                      direction={"row"}
                      gap={"sm"}
                      key={aryIndex}
                      align="flex-start"
                      justify="flex-start"
                    >
                      <TextInput
                        label="選択肢の名前"
                        {...form.getInputProps(
                          `items.${itemIndex}.array.${aryIndex}`
                        )}
                      />
                      <Flex gap={"sm"} mt={24}>
                        <Button
                          onClick={() =>
                            form.insertListItem(`items.${itemIndex}.array`, "")
                          }
                          leftSection={<IconCirclePlus size={14} />}
                        >
                          追加
                        </Button>
                        <Button
                          onClick={() =>
                            form.removeListItem(
                              `items.${itemIndex}.array`,
                              aryIndex
                            )
                          }
                          leftSection={<IconCircleMinus size={14} />}
                          disabled={
                            form.values.items[itemIndex]?.array.length === 1
                          }
                          color="red"
                        >
                          削除
                        </Button>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              )}
            </Flex>
          ))}
        </Flex>
        <Button type="submit" mt="lg">
          保存
        </Button>
      </Stack>
    </form>
  );
}
