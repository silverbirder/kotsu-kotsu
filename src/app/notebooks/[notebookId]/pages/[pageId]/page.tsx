import { DeletePage } from "@/app/_components/delete-page";
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
  Button,
  Flex,
} from "@mantine/core";
import dayjs from "dayjs";

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
  const { notebook } = await api.notebook.getInfo({ id: Number(notebookId) });
  const page = await api.page.getDetail({ id: Number(pageId) });
  const { info, entries, select } = page;
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>{notebook?.title} ページ詳細</Title>
      <Flex gap="md">
        <Button
          component={Link}
          href={
            pagesPath.notebooks
              ._notebookId(notebookId)
              .pages._pageId(Number(pageId))
              .edit.$url().path
          }
        >
          ページ編集
        </Button>
        <DeletePage id={Number(pageId)} notebookId={Number(notebookId)} />
      </Flex>
      <Text>
        作成日:{" "}
        {info?.createdAt && dayjs(info?.createdAt).format("YYYY年M月D日")}
      </Text>
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
