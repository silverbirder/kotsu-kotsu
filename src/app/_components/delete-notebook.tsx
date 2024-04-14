"use client";

import { api } from "@/trpc/react";
import { Button, Flex, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { pagesPath } from "@/lib/$path";

type Props = {
  id: number;
};
export function DeleteNotebook({ id }: Props) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const deleteMutation = api.notebook.deleteOne.useMutation();
  return (
    <>
      <Button color="red" onClick={open}>
        ノートブック削除
      </Button>
      <Modal opened={opened} onClose={close} title="削除確認">
        <Flex gap={"md"} direction={"column"}>
          <Text>本当に削除しますか？</Text>
          <Flex gap={"md"}>
            <Button
              color="red"
              onClick={() => {
                close();
                deleteMutation.mutate(
                  { id },
                  {
                    onSuccess: (data) => {
                      if (data.status === 200) {
                        notifications.show({
                          title: "削除成功",
                          message: "ノートブックが削除したよ！",
                        });
                        router.push(pagesPath.notebooks.$url().path);
                      } else {
                        notifications.show({
                          title: "削除失敗",
                          message: "ノートブックを削除できなかったよ",
                          color: "red",
                        });
                      }
                    },
                    onError: () => {
                      notifications.show({
                        title: "削除失敗",
                        message: "ノートブックを削除できなかったよ",
                        color: "red",
                      });
                    },
                  }
                );
              }}
            >
              削除する
            </Button>
            <Button onClick={close}>削除しない</Button>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
}
