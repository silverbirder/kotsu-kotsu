import { Link } from "@/app/_components/link";
import { PageForm } from "@/app/_components/page-form";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import { Breadcrumbs, Container, Title } from "@mantine/core";

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
      title: "ページ編集",
      href: pagesPath.notebooks
        ._notebookId(notebookId)
        .pages._pageId(pageId)
        .edit.$url().path,
    },
  ].map((item, index) => (
    <Link href={item.href} key={index}>
      {item.title}
    </Link>
  ));
  const { notebook } = await api.notebook.getInfo({ id: Number(notebookId) });
  const res = await api.page.getDetail({ id: Number(pageId) });
  const { entries: _entries, select: _select, info } = res;
  const entries = _entries.map((entry) => {
    const {
      notebookEntry: { valueType },
    } = entry;
    if (valueType === "string") {
      return {
        label: entry.notebookEntry.label,
        id: entry.notebookEntry.id,
        valueType: "string" as const,
        value: entry.pageEntry?.stringValue,
        pageEntryId: entry.pageEntry?.id,
      };
    } else if (valueType === "number") {
      return {
        label: entry.notebookEntry.label,
        id: entry.notebookEntry.id,
        valueType: "number" as const,
        value: entry.pageEntry?.numberValue,
        pageEntryId: entry.pageEntry?.id,
      };
    } else if (valueType === "boolean") {
      return {
        label: entry.notebookEntry.label,
        id: entry.notebookEntry.id,
        valueType: "boolean" as const,
        value: entry.pageEntry?.booleanValue,
        pageEntryId: entry.pageEntry?.id,
      };
    } else {
      const options = _select
        .filter((x) => x.notebookEntryId === entry.notebookEntry.id)
        .map((x) => ({
          value: x.id.toString(),
          label: x.value,
        }));
      return {
        label: entry.notebookEntry.label,
        id: entry.notebookEntry.id,
        valueType: "array" as const,
        value: entry.pageEntry?.numberValue?.toString()
          ? [entry.pageEntry?.numberValue?.toString()]
          : [],
        pageEntryId: entry.pageEntry?.id,
        options,
      };
    }
  });
  const entries2 = entries.reduce((prev, current) => {
    if (current.valueType !== "array") {
      prev.push(current);
      return prev;
    }
    const notebookEntryId = current.id;
    const notebookEntry = prev.find((p) => p.id === notebookEntryId);
    if (!notebookEntry) {
      prev.push(current);
      return prev;
    } else {
      const value = notebookEntry.value as string[];
      notebookEntry.value = [...value, ...current.value];
      return prev;
    }
  }, [] as typeof entries);
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>{notebook?.title} ページ編集</Title>
      <PageForm
        entries={entries2}
        notebookId={Number(notebookId)}
        createdAt={info?.createdAt}
        pageId={Number(pageId)}
      />
    </Container>
  );
}
