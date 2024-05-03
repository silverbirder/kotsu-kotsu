import {
  Button,
  Container,
  Title,
  Table,
  TableScrollContainer,
  TableThead,
  TableTbody,
  TableTr,
  TableTh,
  TableTd,
  Flex,
  Stack,
} from "@mantine/core";
import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import { DeleteNotebook } from "@/app/_components/delete-notebook";
import dayjs from "dayjs";
import { Breadcrumbs } from "@/app/_components/breadcrumbs";

export default async function Page() {
  const notebooks = await api.notebook.getList();
  return (
    <Container>
      <Stack align="flex-start">
        <Breadcrumbs
          items={[
            { title: "Top", href: pagesPath.$url().path },
            {
              title: "ノートブック一覧",
              href: pagesPath.notebooks.$url().path,
            },
          ]}
        />
        <Title order={1}>ノートブック一覧</Title>
        <Button component={Link} href={pagesPath.notebooks.create.$url().path}>
          ノートブック作成
        </Button>
        <TableScrollContainer minWidth={500} type="native">
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <TableThead>
              <TableTr>
                <TableTh>タイトル</TableTh>
                <TableTh>アクション</TableTh>
                <TableTh>作成日</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {notebooks.map((notebook) => (
                <TableTr key={notebook.id}>
                  <TableTd>{notebook.title}</TableTd>
                  <TableTd>
                    <Flex gap="md">
                      <Button
                        component={Link}
                        href={
                          pagesPath.notebooks._notebookId(notebook.id).$url()
                            .path
                        }
                      >
                        詳細
                      </Button>
                      <Button
                        component={Link}
                        href={
                          pagesPath.notebooks
                            ._notebookId(notebook.id)
                            .edit.$url().path
                        }
                      >
                        編集
                      </Button>
                      <DeleteNotebook id={notebook.id} text="削除" />
                    </Flex>
                  </TableTd>
                  <TableTd>
                    {dayjs(notebook.createdAt).format("YYYY年M月D日")}
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </TableScrollContainer>
      </Stack>
    </Container>
  );
}
