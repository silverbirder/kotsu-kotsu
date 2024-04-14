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
  const { entries, select } = res;
  const formValues = entries.map((entry) => {
    const selectbox = select
      .filter((s) => s.notebookEntry.id === entry.notebookEntry.id)
      .map((x) => ({
        value: x.notebookEntryValueArray.id.toString(),
        label: x.notebookEntryValueArray.value,
      }));
    return {
      label: entry.notebookEntry.label,
      id: entry.notebookEntry.id,
      valueType: entry.notebookEntry.valueType,
      selectbox: selectbox,
    };
  });
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>{res.entries[0]?.notebook.title} ページ作成</Title>
      <PageForm formValues={formValues} notebookId={Number(notebookId)} />
    </Container>
  );
}
