"use client";

import { api } from "@/trpc/react";
import { TextInput, Flex, Select, Button } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { pagesPath } from "@/lib/$path";

export function NotebookForm() {
  const initItem = {
    label: "",
    valueType: "string" as const,
    array: [""],
  };
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<
    {
      label: string;
      valueType: "number" | "string" | "boolean" | "array";
      array: string[];
    }[]
  >([initItem]);
  const create = api.notebook.create.useMutation();
  const router = useRouter();
  return (
    <Flex direction={"column"} gap={"md"}>
      <TextInput onChange={(e) => setTitle(e.target.value)} />
      <Flex direction={"column"} gap="sm">
        {items.map((item, index) => {
          return (
            <Flex direction={"row"} gap={"sm"} key={index}>
              <Button
                onClick={() => {
                  setItems([...items, initItem]);
                }}
              >
                下に追加
              </Button>
              <TextInput
                onChange={(e) => {
                  const newItems = [...items];
                  const newItem = { ...item };
                  newItem.label = e.target.value;
                  newItems[index] = newItem;
                  setItems(newItems);
                }}
              />
              <Select
                data={[
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
                ]}
                onChange={(value) => {
                  if (value === null) return;
                  const newItems = [...items];
                  const newItem = { ...item };
                  newItem.valueType = value as
                    | "number"
                    | "string"
                    | "boolean"
                    | "array";
                  newItems[index] = newItem;
                  setItems(newItems);
                }}
              />
              {item.valueType === "array" && (
                <Flex direction={"column"} gap={"sm"}>
                  {item.array.map((_, aryIndex) => {
                    return (
                      <Flex direction={"row"} gap={"sm"} key={aryIndex}>
                        <TextInput
                          onChange={(e) => {
                            const newItems = [...items];
                            const newItem = { ...item };
                            const newArray = [...item.array];
                            newArray[aryIndex] = e.target.value;
                            newItem.array = newArray;
                            newItems[index] = newItem;
                            setItems(newItems);
                          }}
                        />
                        <Button
                          onClick={() => {
                            const newItems = [...items];
                            const newItem = { ...item };
                            const newArray = [...newItem.array, ""];
                            newItem.array = newArray;
                            newItems[index] = newItem;
                            setItems(newItems);
                          }}
                        >
                          下に追加
                        </Button>
                      </Flex>
                    );
                  })}
                </Flex>
              )}
            </Flex>
          );
        })}
      </Flex>
      <Button
        onClick={async () => {
          create.mutate(
            {
              title: title,
              entries: items,
            },
            {
              onSuccess: (data) => {
                notifications.show({
                  title: "作成完了",
                  message: "ノートブックが作成したよ！",
                });
                router.push(
                  pagesPath.notebooks._notebookId(data.notebookId ?? 0).$url()
                    .path
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
        }}
      >
        保存
      </Button>
    </Flex>
  );
}
