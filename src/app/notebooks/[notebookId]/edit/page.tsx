import { Breadcrumbs } from "@/app/_components/breadcrumbs";
import { NotebookForm } from "@/app/_components/notebook-form";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
// import { api } from "@/trpc/server";
import { Container, Stack, Title } from "@mantine/core";

type Props = {
  params: {
    notebookId: string;
  };
};

export default async function Page({ params: { notebookId } }: Props) {
  const { notebook } = await api.notebook.getInfo({ id: Number(notebookId) });
  const { entries, select } = await api.notebook.getDetail({
    id: Number(notebookId),
  });
  const initialValues = {
    title: notebook?.title ?? "",
    items: entries.map((entry) => {
      return {
        notebookEntryId: entry.notebookEntry.id,
        label: entry.notebookEntry.label,
        valueType: entry.notebookEntry.valueType,
        array:
          entry.notebookEntry.valueType !== "array"
            ? []
            : select
                .filter((x) => x.notebookEntry.id === entry.notebookEntry.id)
                ?.map((x) => ({
                  notebookEntryValueArrayId: x.notebookEntryValueArray.id,
                  value: x.notebookEntryValueArray.value,
                })),
      };
    }),
  };
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
            {
              title: "ノートブック詳細",
              href: pagesPath.notebooks._notebookId(notebookId).$url().path,
            },
            {
              title: "ノートブック編集",
              href: pagesPath.notebooks._notebookId(notebookId).edit.$url()
                .path,
            },
          ]}
        />
        <Title order={1}>ノートブック編集</Title>
        <NotebookForm
          initialValues={initialValues}
          notebookId={Number(notebookId)}
        />
      </Stack>
    </Container>
  );
}
