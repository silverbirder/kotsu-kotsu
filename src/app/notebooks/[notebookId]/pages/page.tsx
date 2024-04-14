import { DeletePage } from "@/app/_components/delete-page";
import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import {
  Breadcrumbs,
  Button,
  Container,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Title,
} from "@mantine/core";

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
  const pages = await api.page.getList({ notebookId: Number(notebookId) });
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>ノートブック {notebookId} ページ一覧</Title>
      <Button
        component={Link}
        href={
          pagesPath.notebooks._notebookId(notebookId).pages.create.$url().path
        }
      >
        ページ作成
      </Button>
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>タイトル</TableTh>
            <TableTh>作成日</TableTh>
            <TableTh>削除</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {pages.map((page) => (
            <TableTr key={page.id}>
              <TableTd>
                <Button
                  component={Link}
                  href={
                    pagesPath.notebooks
                      ._notebookId(page.notebookId)
                      .pages._pageId(page.id)
                      .$url().path
                  }
                >
                  {page.id}
                </Button>
              </TableTd>
              <TableTd>{page.createdAt.toString()}</TableTd>
              <TableTd>
                <DeletePage id={page.id} notebookId={page.notebookId} />
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Container>
  );
}
