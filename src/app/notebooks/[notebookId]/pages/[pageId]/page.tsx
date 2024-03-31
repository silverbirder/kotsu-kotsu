import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";
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
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>
        ノートブック {notebookId} ページ {pageId}目
      </Title>
    </Container>
  );
}
