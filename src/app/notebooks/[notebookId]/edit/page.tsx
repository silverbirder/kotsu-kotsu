import { Breadcrumbs } from "@/app/_components/breadcrumbs";
import { NotebookForm } from "@/app/_components/notebook-form";
import { pagesPath } from "@/lib/$path";
import { Container, Stack, Title } from "@mantine/core";

type Props = {
  params: {
    notebookId: string;
  };
};

export default async function Page({ params: { notebookId } }: Props) {
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
              href: pagesPath.notebooks.create.$url().path,
            },
          ]}
        />
        <Title order={1}>ノートブック編集</Title>
        <NotebookForm />
      </Stack>
    </Container>
  );
}
