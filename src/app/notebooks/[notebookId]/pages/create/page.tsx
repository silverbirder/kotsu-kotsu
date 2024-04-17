import { Link } from "@/app/_components/link";
import { PageForm } from "@/app/_components/page-form";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import { Breadcrumbs, Container, Title } from "@mantine/core";

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
    {
      title: "ページ作成",
      href: pagesPath.notebooks._notebookId(notebookId).pages.create.$url()
        .path,
    },
  ].map((item, index) => (
    <Link href={item.href} key={index}>
      {item.title}
    </Link>
  ));
  const res = await api.notebook.getDetail({ id: Number(notebookId) });
  const { entries: _entries, select: _select } = res;
  const entries = _entries.map((entry) => {
    const {
      notebookEntry: { valueType },
    } = entry;
    if (valueType === "string") {
      return {
        label: entry.notebookEntry.label,
        id: entry.notebookEntry.id,
        valueType: "string" as const,
      };
    } else if (valueType === "number") {
      return {
        label: entry.notebookEntry.label,
        id: entry.notebookEntry.id,
        valueType: "number" as const,
      };
    } else if (valueType === "boolean") {
      return {
        label: entry.notebookEntry.label,
        id: entry.notebookEntry.id,
        valueType: "boolean" as const,
      };
    } else {
      const options = _select
        .filter((x) => x.notebookEntry.id === entry.notebookEntry.id)
        .map((x) => ({
          value: x.notebookEntryValueArray.id.toString(),
          label: x.notebookEntryValueArray.value,
        }));
      return {
        label: entry.notebookEntry.label,
        id: entry.notebookEntry.id,
        valueType: "array" as const,
        options,
      };
    }
  });
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>{res.entries[0]?.notebook.title} ページ作成</Title>
      <PageForm entries={entries} notebookId={Number(notebookId)} />
    </Container>
  );
}
