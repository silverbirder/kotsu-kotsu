import { Link } from "@/app/_components/link";
import { NotebookForm } from "@/app/_components/notebook-form";
import { pagesPath } from "@/lib/$path";
import { Breadcrumbs, Container, Title } from "@mantine/core";

export default async function Page() {
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>ノートブック作成</Title>
      <NotebookForm />
    </Container>
  );
}

const breadcrumbs = [
  { title: "Top", href: pagesPath.$url().path },
  { title: "ノートブック一覧", href: pagesPath.notebooks.$url().path },
  { title: "ノートブック作成", href: pagesPath.notebooks.create.$url().path },
].map((item, index) => (
  <Link href={item.href} key={index}>
    {item.title}
  </Link>
));
