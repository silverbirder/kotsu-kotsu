import { Breadcrumbs } from "@/app/_components/breadcrumbs";
import { NotebookForm } from "@/app/_components/notebook-form";
import { pagesPath } from "@/lib/$path";
import { Container, Stack, Title } from "@mantine/core";

export default async function Page() {
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
              title: "ノートブック作成",
              href: pagesPath.notebooks.create.$url().path,
            },
          ]}
        />
        <Title order={1}>ノートブック作成</Title>
        <NotebookForm />
      </Stack>
    </Container>
  );
}
