import { DeletePage } from "@/app/_components/delete-page";
import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import {
  Breadcrumbs,
  Button,
  Container,
  Flex,
  TableScrollContainer,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Title,
} from "@mantine/core";
import dayjs from "dayjs";

type Props = {
  params: {
    notebookId: string;
  };
};
export default async function Page({ params: { notebookId } }: Props) {
  const breadcrumbs = [
    { title: "Top", href: pagesPath.$url().path },
    { title: "ノートブック一覧", href: pagesPath.notebooks.$url().path },
    {
      title: "ノートブック詳細",
      href: pagesPath.notebooks._notebookId(notebookId).$url().path,
    },
    {
      title: "ページ一覧",
      href: pagesPath.notebooks._notebookId(notebookId).pages.$url().path,
    },
  ].map((item, index) => (
    <Link href={item.href} key={index}>
      {item.title}
    </Link>
  ));
  const { notebook } = await api.notebook.getInfo({ id: Number(notebookId) });
  const pages = await api.page.getList({ notebookId: Number(notebookId) });
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>{notebook?.title} ページ一覧</Title>
      <Button
        component={Link}
        href={
          pagesPath.notebooks._notebookId(notebookId).pages.create.$url().path
        }
      >
        ページ作成
      </Button>
      <TableScrollContainer minWidth={500} type="native">
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <TableThead>
            <TableTr>
              <TableTh>作成日</TableTh>
              <TableTh>アクション</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {pages.map((page) => (
              <TableTr key={page.id}>
                <TableTd>
                  {dayjs(page.createdAt).format("YYYY年M月D日")}
                </TableTd>
                <TableTd>
                  <Flex gap="md">
                    <Button
                      component={Link}
                      href={
                        pagesPath.notebooks
                          ._notebookId(page.notebookId)
                          .pages._pageId(page.id)
                          .$url().path
                      }
                    >
                      詳細
                    </Button>
                    <Button
                      component={Link}
                      href={
                        pagesPath.notebooks
                          ._notebookId(page.notebookId)
                          .pages._pageId(page.id)
                          .edit.$url().path
                      }
                      color="green"
                    >
                      編集
                    </Button>
                    <DeletePage
                      id={page.id}
                      notebookId={page.notebookId}
                      text="削除"
                    />
                  </Flex>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableScrollContainer>
    </Container>
  );
}
