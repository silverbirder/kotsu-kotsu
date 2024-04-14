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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { pagesPath } from "@/lib/$path";

type Props = {
  formValues: {
    label: string;
    id: number;
    valueType: "string" | "number" | "boolean" | "array";
    selectbox: {
      value: string;
      label: string;
    }[];
  }[];
  notebookId: number;
};
export function PageForm({ formValues, notebookId }: Props) {
  const router = useRouter();
  const convertFormValuesToInitialValues = (
    formValues: Props["formValues"]
  ) => {
    const initialValues: Record<
      string,
      string | number | boolean | string[] | Date
    > = {};

    formValues.forEach(({ id, valueType }) => {
      switch (valueType) {
        case "string":
          initialValues[id] = "";
          break;
        case "number":
          initialValues[id] = 0;
          break;
        case "boolean":
          initialValues[id] = false;
          break;
        case "array":
          initialValues[id] = [] as string[];
          break;
        default:
          break;
      }
    });
    return initialValues;
  };
  const [createdAt, setCreatedAt] = useState(new Date());
  const form = useForm({
    initialValues: {
      ...convertFormValuesToInitialValues(formValues),
    },
  });
  const create = api.page.create.useMutation();
  return (
    <Box maw={340} mx="auto">
      <form
        onSubmit={form.onSubmit((values) => {
          const data = formValues
            .map((formValue) => {
              const value = values[formValue.id];
              if (formValue.valueType === "array") {
                return (value as string[]).map((v) => {
                  return {
                    notebookEntryId: Number(formValue.id),
                    numberValue: Number(v),
                  };
                });
              } else {
                return [
                  {
                    notebookEntryId: Number(formValue.id),
                    stringValue:
                      formValue.valueType === "string"
                        ? (value as string)
                        : undefined,
                    numberValue:
                      formValue.valueType === "number"
                        ? Number(value)
                        : undefined,
                    booleanValue:
                      formValue.valueType === "boolean"
                        ? Boolean(value)
                        : undefined,
                  },
                ];
              }
            })
            .flat();
          create.mutate(
            { notebookId, entries: data, createdAt },
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
        })}
      >
        {formValues.map((formValue) => {
          if (formValue.valueType === "string") {
            return (
              <TextInput
                key={formValue.id}
                label={formValue.label}
                {...form.getInputProps(`${formValue.id}`, { type: "input" })}
              />
            );
          } else if (formValue.valueType === "number") {
            return (
              <NumberInput
                key={formValue.id}
                label={formValue.label}
                {...form.getInputProps(`${formValue.id}`, { type: "input" })}
              />
            );
          } else if (formValue.valueType === "boolean") {
            return (
              <Checkbox
                key={formValue.id}
                label={formValue.label}
                {...form.getInputProps(`${formValue.id}`, { type: "checkbox" })}
              />
            );
          } else if (formValue.valueType === "array") {
            return (
              <MultiSelect
                key={formValue.id}
                label={formValue.label}
                data={formValue.selectbox}
                searchable
                {...form.getInputProps(`${formValue.id}`, { type: "input" })}
              />
            );
          }
          return <></>;
        })}
        <DateTimePicker
          label="Pick date and time"
          placeholder="Pick date and time"
          value={createdAt}
          onChange={(value) => {
            if (!value) return;
            setCreatedAt(value);
          }}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}
