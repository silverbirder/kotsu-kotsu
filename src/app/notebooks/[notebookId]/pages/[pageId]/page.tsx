import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import {
  Breadcrumbs,
  Container,
  Title,
  Text,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

type Props = {
  params: {
    notebookId: string;
    pageId: string;
  };
};
export default async function Page({ params: { notebookId, pageId } }: Props) {
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
    {
      title: "ページ詳細",
      href: pagesPath.notebooks
        ._notebookId(notebookId)
        .pages._pageId(pageId)
        .$url().path,
    },
  ].map((item, index) => (
    <Link href={item.href} key={index}>
      {item.title}
    </Link>
  ));
  const page = await api.page.getDetail({ id: Number(pageId) });
  const { info, entries, select } = page;
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>
        ノートブック {notebookId} ページ {pageId}目
      </Title>
      <Text>{info?.createdAt.toString()}</Text>
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>項目名</TableTh>
            <TableTh>値</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {entries.map((entry) => (
            <TableTr key={entry.notebookEntry.id}>
              <TableTd>{entry.notebookEntry.label}</TableTd>
              <TableTd>
                {entry.notebookEntry.valueType === "array"
                  ? select.filter(
                      (s) =>
                        s.notebookEntryId === entry.notebookEntry.id &&
                        s.id === entry.pageEntry.numberValue
                    )[0]?.value
                  : entry.notebookEntry.valueType === "string"
                  ? entry.pageEntry.stringValue
                  : entry.notebookEntry.valueType === "number"
                  ? entry.pageEntry.numberValue
                  : entry.notebookEntry.valueType === "boolean"
                  ? `${entry.pageEntry.booleanValue ? "はい" : "いいえ"}`
                  : ""}
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Container>
  );
}
