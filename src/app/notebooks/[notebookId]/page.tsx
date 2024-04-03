import { Link } from "@/app/_components/link";
import { pagesPath } from "@/lib/$path";
import { api } from "@/trpc/server";
import { Breadcrumbs, Button, Container, Title } from "@mantine/core";
import { AreaChart } from "@mantine/charts";

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
  ].map((item, index) => (
    <Link href={item.href} key={index}>
      {item.title}
    </Link>
  ));
  const pages = await api.page.getList({ notebookId: Number(notebookId) });
  const pageDetails = await Promise.all(
    pages.map(async (page) => {
      return await api.page.getDetail({ id: page.id });
    })
  );
  const entries = pageDetails
    .map((page) => {
      return page.entries
        .filter((entry) => entry.notebookEntry.valueType === "number")
        .map((entry) => {
          return {
            [entry.notebookEntry.label]: entry.pageEntry.numberValue,
            date: entry.page.createdAt.toString(),
          };
        });
    })
    .flat();
  const colors = ["indigo.6", "blue.6", "teal.6", "green.6", "red.6"];
  const uniqueSeriesNames: string[] = [];
  const seriesWithColors = entries
    .map((d) => {
      const name = Object.keys(d)[0];
      if (!uniqueSeriesNames.includes(name ?? "")) {
        uniqueSeriesNames.push(name ?? "");
      }
      const colorIndex = uniqueSeriesNames.indexOf(name ?? "") % colors.length;
      return {
        name: name ?? "",
        color: colors[colorIndex] ?? "",
      };
    })
    .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);
  return (
    <Container>
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title order={1}>ノートブック {notebookId}</Title>
      <Button
        component={Link}
        href={pagesPath.notebooks._notebookId(notebookId).pages.$url().path}
      >
        ページ一覧
      </Button>
      <AreaChart
        h={300}
        data={entries}
        dataKey="date"
        series={seriesWithColors}
        curveType="linear"
      />
    </Container>
  );
}
