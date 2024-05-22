import { AreaChart } from "@mantine/charts";
import { Text, Stack } from "@mantine/core";

export function ChartSection() {
  return (
    <Stack
      gap={"md"}
      align={"center"}
      justify={"flex-start"}
      style={{ flex: "1 1 45%", maxWidth: "330px" }}
    >
      <AreaChart
        h={330}
        w={330}
        data={data}
        dataKey="date"
        series={[
          { name: "Apples", color: "indigo.6" },
          { name: "Oranges", color: "blue.6" },
          { name: "Tomatoes", color: "teal.6" },
        ]}
        curveType="linear"
      />
      <Text size="md">
        あなたの記録を視覚化し、傾向や変化を一目で確認できます。
      </Text>
    </Stack>
  );
}

const data = [
  {
    date: "Mar 22",
    Apples: 2890,
    Oranges: 2338,
    Tomatoes: 2452,
  },
  {
    date: "Mar 23",
    Apples: 2756,
    Oranges: 2103,
    Tomatoes: 2402,
  },
  {
    date: "Mar 24",
    Apples: 3322,
    Oranges: 986,
    Tomatoes: 1821,
  },
  {
    date: "Mar 25",
    Apples: 3470,
    Oranges: 2108,
    Tomatoes: 2809,
  },
  {
    date: "Mar 26",
    Apples: 3129,
    Oranges: 1726,
    Tomatoes: 2290,
  },
];
