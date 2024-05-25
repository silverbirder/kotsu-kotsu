"use client";

import { api } from "@/trpc/react";
import {
  TextInput,
  Flex,
  Select,
  Button,
  Stack,
  Text,
  ActionIcon,
  Fieldset,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { pagesPath } from "@/lib/$path";
import { useForm } from "@mantine/form";
import { useCallback } from "react";
import { IconCirclePlus, IconCircleMinus } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

type Item = {
  notebookEntryId?: number;
  label: string;
  valueType: "string" | "number" | "boolean" | "array";
  array: { value: string; notebookEntryValueArrayId?: number }[];
};

const initItem = {
  label: "",
  valueType: "string" as const,
  array: [{ value: "" }],
};

type Props = {
  initialValues?: {
    title: string;
    items: Item[];
  };
  notebookId?: number;
  hiddenSubmit?: boolean;
};
export function NotebookForm({
  initialValues,
  notebookId,
  hiddenSubmit,
}: Props) {
  const form = useForm<{ title: string; items: Item[] }>({
    initialValues: initialValues ?? {
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
      label: "カテゴリ",
    },
  ];
  const create = api.notebook.create.useMutation();
  const update = api.notebook.update.useMutation();
  const router = useRouter();

  const handleSubmit = useCallback(() => {
    const formValues = form.values;
    const isUpdate = !!notebookId;
    if (isUpdate) {
      update.mutate(
        {
          notebookId: notebookId,
          title: formValues.title,
          entries: formValues.items,
        },
        {
          onSuccess: (data) => {
            if (data.status === 200) {
              notifications.show({
                title: "更新完了",
                message: "ノートブックが更新したよ！",
              });
              router.push(
                pagesPath.notebooks._notebookId(notebookId).$url().path
              );
            } else {
              notifications.show({
                title: "更新失敗",
                message: "ノートブックに作成できなかったよ",
                color: "red",
              });
            }
          },
          onError: () => {
            notifications.show({
              title: "更新失敗",
              message: "ノートブックに作成できなかったよ",
              color: "red",
            });
          },
        }
      );
    } else {
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
    }
  }, [form, create, update, router, notebookId]);

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
            <Fieldset key={itemIndex} legend="項目" style={{ width: "100%" }}>
              <Flex gap={"sm"}>
                <ActionIcon
                  h={35}
                  w={35}
                  variant="filled"
                  aria-label="add-entry"
                  onClick={() => form.insertListItem("items", initItem)}
                >
                  <IconCirclePlus size={14} />
                </ActionIcon>
                <ActionIcon
                  h={35}
                  w={35}
                  variant="filled"
                  aria-label="delete-entry"
                  onClick={() => {
                    if (form.values.items[itemIndex]?.notebookEntryId) {
                      modals.openConfirmModal({
                        title: "削除確認",
                        labels: { confirm: "削除する", cancel: "削除しない" },
                        children: (
                          <Flex gap={"md"} direction={"column"}>
                            <Text>
                              削除する項目を使用しているデータは失われます。よろしいですか？
                            </Text>
                          </Flex>
                        ),
                        onConfirm: () =>
                          form.removeListItem("items", itemIndex),
                        confirmProps: { color: "red" },
                      });
                    } else {
                      form.removeListItem("items", itemIndex);
                    }
                  }}
                  color="red"
                  disabled={form.values.items.length === 1}
                >
                  <IconCircleMinus size={14} />
                </ActionIcon>
              </Flex>
              <Flex
                direction={{ base: "column", md: "row" }}
                gap={"sm"}
                align="flex-start"
                justify="flex-start"
                wrap={"wrap"}
                mt={4}
              >
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
                          label="カテゴリ名"
                          {...form.getInputProps(
                            `items.${itemIndex}.array.${aryIndex}.value`
                          )}
                        />
                        <Flex gap={"sm"} mt={24}>
                          <ActionIcon
                            h={35}
                            w={35}
                            variant="filled"
                            aria-label="add-item"
                            onClick={() =>
                              form.insertListItem(`items.${itemIndex}.array`, {
                                value: "",
                              })
                            }
                          >
                            <IconCirclePlus size={14} />
                          </ActionIcon>
                          <ActionIcon
                            h={35}
                            w={35}
                            variant="filled"
                            aria-label="delete-item"
                            onClick={() => {
                              if (
                                form.values.items[itemIndex]?.array[aryIndex]
                                  ?.notebookEntryValueArrayId
                              ) {
                                modals.openConfirmModal({
                                  title: "削除確認",
                                  labels: {
                                    confirm: "削除する",
                                    cancel: "削除しない",
                                  },
                                  children: (
                                    <Flex gap={"md"} direction={"column"}>
                                      <Text>
                                        削除する項目を使用しているデータは失われます。よろしいですか？
                                      </Text>
                                    </Flex>
                                  ),
                                  onConfirm: () =>
                                    form.removeListItem(
                                      `items.${itemIndex}.array`,
                                      aryIndex
                                    ),
                                  confirmProps: { color: "red" },
                                });
                              } else {
                                form.removeListItem(
                                  `items.${itemIndex}.array`,
                                  aryIndex
                                );
                              }
                            }}
                            disabled={
                              form.values.items[itemIndex]?.array.length === 1
                            }
                            color="red"
                          >
                            <IconCircleMinus size={14} />
                          </ActionIcon>
                        </Flex>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Flex>
            </Fieldset>
          ))}
        </Flex>
        {!hiddenSubmit && (
          <Button type="submit" mt="lg">
            保存
          </Button>
        )}
      </Stack>
    </form>
  );
}
