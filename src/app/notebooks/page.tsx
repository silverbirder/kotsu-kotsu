import {
  Breadcrumbs,
  Button,
  Container,
  Title,
  Table,
  TableThead,
  TableTbody,
  TableTr,
  TableTh,
  TableTd,
} from "@mantine/core";
import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import { DeleteNotebook } from "../_components/delete-notebook";

export default async function Page() {
  const notebooks = await api.notebook.getList();
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>ノートブック一覧</Title>
      <Button component={Link} href={pagesPath.notebooks.create.$url().path}>
        ノートブック作成
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
          {notebooks.map((notebook) => (
            <TableTr key={notebook.id}>
              <TableTd>
                <Button
                  component={Link}
                  href={
                    pagesPath.notebooks._notebookId(notebook.id).$url().path
                  }
                >
                  {notebook.title}
                </Button>
              </TableTd>
              <TableTd>{notebook.createdAt.toString()}</TableTd>
              <TableTd>
                <DeleteNotebook id={notebook.id} />
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Container>
  );
}

const breadcrumbs = [
  { title: "Top", href: pagesPath.$url().path },
  { title: "ノートブック一覧", href: pagesPath.notebooks.$url().path },
].map((item, index) => (
  <Link href={item.href} key={index}>
    {item.title}
  </Link>
));
