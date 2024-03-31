import { Breadcrumbs, Button, Container, Title } from "@mantine/core";
import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";

export default async function Page() {
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>ノートブック一覧</Title>
      <Button component={Link} href={pagesPath.notebooks.create.$url().path}>
        ノートブック作成
      </Button>
      <Button
        component={Link}
        href={pagesPath.notebooks._notebookId("1").$url().path}
      >
        ノートブック詳細
      </Button>
    </Container>
  );
}

const breadcrumbs = [
  { title: "Top", href: pagesPath.$url().path },
  { title: "ノートブック一覧", href: pagesPath.notebooks.$url().path },
].map((item, index) => (
  <Link href={item.href} key={index}>
    {item.title}
  </Link>
));
