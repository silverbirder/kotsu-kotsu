import { Breadcrumbs } from "@/app/_components/breadcrumbs";
import { Chart } from "@/app/_components/chart";
import { DeleteNotebook } from "@/app/_components/delete-notebook";
import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import { Button, Container, Title, Text, Flex } from "@mantine/core";

type Props = {
  params: {
    notebookId: string;
  };
};

export default async function Page({ params: { notebookId } }: Props) {
  const notebook = await api.notebook.getDetail({ id: Number(notebookId) });
  const pages = await api.page.getList({ notebookId: Number(notebookId) });
  const pageDetails = await Promise.all(
    pages.map(async (page) => {
      return await api.page.getDetail({ id: page.id });
    })
  );
  const pageEntries = pageDetails
    .map((detail) => {
      return detail.entries.map((entry) => {
        const valueType = entry.notebookEntry.valueType;
        return {
          value:
            valueType === "string"
              ? entry.pageEntry?.stringValue ?? ""
              : valueType === "number"
              ? entry.pageEntry?.numberValue ?? 0
              : valueType === "boolean"
              ? entry.pageEntry?.booleanValue ?? false
              : entry.pageEntry?.numberValue ?? 0,
          createdAt: entry.page.createdAt,
          notebookEntryId: entry.pageEntry?.notebookEntryId ?? 0,
          pageId: entry.page.id,
        };
      });
    })
    .flat();
  const notebookEntries = notebook.entries.map((entry) => ({
    notebookId: entry.notebook.id,
    notebookEntryId: entry.notebookEntry.id,
    label: entry.notebookEntry.label,
    valueType: entry.notebookEntry.valueType,
    select: notebook.select
      .filter((x) => entry.notebookEntry.id === x.notebookEntry.id)
      .map((x) => ({
        id: x.notebookEntryValueArray.id,
        value: x.notebookEntryValueArray.value,
      })),
  }));
  return (
    <Container>
      <Breadcrumbs
        items={[
          { title: "Top", href: pagesPath.$url().path },
          { title: "ノートブック一覧", href: pagesPath.notebooks.$url().path },
          {
            title: "ノートブック詳細",
            href: pagesPath.notebooks._notebookId(notebookId).$url().path,
          },
        ]}
      />
      <Title order={1}>{notebook.entries[0]?.notebook.title}</Title>
      <Flex gap={"md"}>
        <Button
          component={Link}
          href={pagesPath.notebooks._notebookId(notebookId).pages.$url().path}
        >
          ページ一覧
        </Button>
        <DeleteNotebook id={Number(notebookId)} />
      </Flex>
      {pageEntries.length === 0 ? (
        <Text>まだ1つも記録がありません</Text>
      ) : (
        <Chart notebookEntries={notebookEntries} pageEntries={pageEntries} />
      )}
    </Container>
  );
}
