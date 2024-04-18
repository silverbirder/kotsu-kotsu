"use client";

import { api } from "@/trpc/react";
import {
  Box,
  TextInput,
  Checkbox,
  Group,
  Button,
  NumberInput,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { pagesPath } from "@/lib/$path";

type Entry =
  | {
      label: string;
      id: number;
      valueType: "array";
      value?: string[];
      pageEntryId?: number;
      options: {
        value: string;
        label: string;
      }[];
    }
  | {
      label: string;
      id: number;
      valueType: "string";
      value?: string | null;
      pageEntryId?: number;
    }
  | {
      label: string;
      id: number;
      valueType: "boolean";
      value?: boolean | null;
      pageEntryId?: number;
    }
  | {
      label: string;
      id: number;
      valueType: "number";
      value?: number | null;
      pageEntryId?: number;
    };

type Props = {
  entries: Entry[];
  notebookId: number;
  pageId?: number;
  createdAt?: Date;
};

export function PageForm({ entries, notebookId, pageId, createdAt }: Props) {
  const router = useRouter();
  const initialValues = useMemo(() => {
    const entriesValue: Record<string, string | number | boolean | string[]> =
      {};
    entries.forEach(({ id, value, valueType }) => {
      switch (valueType) {
        case "string":
          entriesValue[id] = value! ?? "";
          break;
        case "number":
          entriesValue[id] = value! ?? 0;
          break;
        case "boolean":
          entriesValue[id] = value! ?? false;
          break;
        case "array":
          const _prevValues = entriesValue[id] as string[];
          const prevValues = _prevValues ? _prevValues : [];
          const values = value ? value : [];
          entriesValue[id] = [...prevValues, ...values] as string[];
          break;
        default:
          break;
      }
    });
    const initialValues = {
      createdAt: createdAt ?? new Date(),
      entries: entriesValue,
    };
    return initialValues;
  }, [entries, createdAt]);

  const form = useForm({
    initialValues,
  });
  const create = api.page.create.useMutation();
  const update = api.page.update.useMutation();
  const handleSubmit = useCallback(
    (values: typeof form.values) => {
      const createdAt = values.createdAt;
      const data = entries
        .map((entry) => {
          const value = values.entries[entry.id];
          if (entry.valueType === "array") {
            return (value as string[]).map((v) => {
              return {
                notebookEntryId: Number(entry.id),
                numberValue: Number(v),
                pageEntryId: entry.pageEntryId ?? 0,
                valueType: entry.valueType,
              };
            });
          } else {
            return [
              {
                notebookEntryId: Number(entry.id),
                pageEntryId: entry.pageEntryId ?? 0,
                stringValue:
                  entry.valueType === "string" ? (value as string) : undefined,
                numberValue:
                  entry.valueType === "number" ? Number(value) : undefined,
                booleanValue:
                  entry.valueType === "boolean" ? Boolean(value) : undefined,
                valueType: entry.valueType,
              },
            ];
          }
        })
        .flat();
      const isUpdate = !!pageId;
      if (isUpdate) {
        update.mutate(
          {
            notebookId,
            pageId,
            entries: data,
            createdAt,
          },
          {
            onSuccess: (data) => {
              if (data.status === 200) {
                notifications.show({
                  title: "更新完了",
                  message: "ページを更新したよ！",
                });
                router.push(
                  pagesPath.notebooks
                    ._notebookId(notebookId)
                    .pages._pageId(pageId ?? 0)
                    .$url().path
                );
              } else {
                notifications.show({
                  title: "更新失敗",
                  message: "ページを更新できなかったよ",
                  color: "red",
                });
              }
            },
            onError: () => {
              notifications.show({
                title: "更新失敗",
                message: "ページを更新できなかったよ",
                color: "red",
              });
            },
          }
        );
      } else {
        create.mutate(
          {
            notebookId,
            entries: data,
            createdAt,
          },
          {
            onSuccess: (data) => {
              notifications.show({
                title: "作成完了",
                message: "ページが作成したよ！",
              });
              router.push(
                pagesPath.notebooks
                  ._notebookId(notebookId)
                  .pages._pageId(data.pageId ?? 0)
                  .$url().path
              );
            },
            onError: () => {
              notifications.show({
                title: "作成失敗",
                message: "ページに作成できなかったよ",
                color: "red",
              });
            },
          }
        );
      }
    },
    [entries, create, update, form, notebookId, router, pageId]
  );
  return (
    <Box maw={340}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {entries.map((entry) => {
          if (entry.valueType === "string") {
            return (
              <TextInput
                key={entry.id}
                label={entry.label}
                {...form.getInputProps(`entries.${entry.id}`, {
                  type: "input",
                })}
              />
            );
          } else if (entry.valueType === "number") {
            return (
              <NumberInput
                key={entry.id}
                label={entry.label}
                {...form.getInputProps(`entries.${entry.id}`, {
                  type: "input",
                })}
              />
            );
          } else if (entry.valueType === "boolean") {
            return (
              <Checkbox
                key={entry.id}
                label={entry.label}
                {...form.getInputProps(`entries.${entry.id}`, {
                  type: "checkbox",
                })}
              />
            );
          } else {
            return (
              <MultiSelect
                key={entry.id}
                label={entry.label}
                data={entry.options}
                searchable
                {...form.getInputProps(`entries.${entry.id}`, {
                  type: "input",
                })}
              />
            );
          }
        })}
        <DateTimePicker
          label="作成日"
          valueFormat="YYYY年M月D日 h時m分"
          {...form.getInputProps("createdAt")}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">保存</Button>
        </Group>
      </form>
    </Box>
  );
}
