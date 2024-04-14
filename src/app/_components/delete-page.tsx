"use client";

import { api } from "@/trpc/react";
import { Button, Flex, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { pagesPath } from "@/lib/$path";

type Props = {
  id: number;
  notebookId: number;
};
export function DeletePage({ id, notebookId }: Props) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const deleteMutation = api.page.deleteOne.useMutation();
  return (
    <>
      <Button color="red" onClick={open}>
        ページ削除
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
                          message: "ページが削除したよ！",
                        });
                        router.push(
                          pagesPath.notebooks
                            ._notebookId(notebookId)
                            .pages.$url().path
                        );
                      } else {
                        notifications.show({
                          title: "削除失敗",
                          message: "ページを削除できなかったよ",
                          color: "red",
                        });
                      }
                    },
                    onError: () => {
                      notifications.show({
                        title: "削除失敗",
                        message: "ページを削除できなかったよ",
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
