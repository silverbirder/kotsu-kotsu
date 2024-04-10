"use client";

import {
  SegmentedControl,
  Flex,
  Checkbox,
  CheckboxGroup,
  Group,
  Card,
} from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { useMemo, useState } from "react";

type Props = {
  notebookEntries: {
    notebookId: number;
    notebookEntryId: number;
    label: string;
    valueType: "string" | "number" | "boolean" | "array";
    select: { id: number; value: string }[];
  }[];
  pageEntries: {
    value: string | number | boolean | null;
    createdAt: Date;
    notebookEntryId: number;
  }[];
};

const colors = [
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
];

export function Chart({ notebookEntries, pageEntries }: Props) {
  const aggregationPeriods = [
    {
      value: "day",
      label: "日",
    },
    {
      value: "week",
      label: "週",
    },
    {
      value: "month",
      label: "年",
    },
  ];
  const [aggregationPeriod, setAggregationPeriod] = useState(
    aggregationPeriods[0]
  );
  const aggregationMethods = [{ value: "sum", label: "合計" }];
  const [notebookEntriesWithEtc, setNotebookEntriesWithEtc] = useState(
    notebookEntries.map((entry) => ({
      ...entry,
      selected: true,
      aggregationMethod: aggregationMethods[0],
      category: null as null | typeof entry,
    }))
  );
  const categories = useMemo(() => {
    return notebookEntriesWithEtc
      .filter((x) => x.selected)
      .map((notebookEntry) => {
        const pageEntryWithValue = pageEntries
          .filter(
            (pageEntry) =>
              pageEntry.notebookEntryId === notebookEntry.notebookEntryId
          )
          .map((pageEntry) => {
            if (notebookEntry.valueType === "boolean") {
              return [
                {
                  pageEntry,
                  categoryName: `${notebookEntry.label}-はい`,
                  value: (pageEntry.value as boolean) === true ? 1 : 0,
                },
                {
                  pageEntry,
                  categoryName: `${notebookEntry.label}-いいえ`,
                  value: (pageEntry.value as boolean) === false ? 1 : 0,
                },
              ];
            } else if (notebookEntry.valueType === "number") {
              return [
                {
                  pageEntry,
                  categoryName: notebookEntry.label,
                  value: pageEntry.value as number,
                },
              ];
            } else if (notebookEntry.valueType === "array") {
              return notebookEntry.select.map((select) => {
                return {
                  pageEntry,
                  categoryName: `${notebookEntry.label}-${select.value}`,
                  value: (pageEntry.value as number) === select.id ? 1 : 0,
                };
              });
            } else if (notebookEntry.valueType === "string") {
              const strValues = unique(
                pageEntries
                  .filter(
                    (pageEntry) =>
                      pageEntry.notebookEntryId ===
                      notebookEntry.notebookEntryId
                  )
                  .map((pageEntry) => pageEntry.value as string)
              );
              return strValues.map((string) => {
                return {
                  pageEntry,
                  categoryName: `${notebookEntry.label}-${string}`,
                  value: (pageEntry.value as string) === string ? 1 : 0,
                };
              });
            } else {
              return [];
            }
          })
          .flat();
        return pageEntryWithValue;
      })
      .flat();
  }, [notebookEntriesWithEtc, pageEntries]);

  const data = useMemo(() => {
    const createdAt = categories.map((x) => x.pageEntry.createdAt).sort();
    const [startDate, endDate] = [
      createdAt[0],
      createdAt[createdAt.length - 1],
    ];
    if (startDate === undefined || endDate === undefined) return [];
    const dateRange: string[] = generateDateRange(
      new Date(startDate),
      new Date(endDate),
      aggregationPeriod?.value as "day" | "week" | "month"
    );

    return dateRange.map((dateLabel) => {
      const series: Record<string, number | string> = {};

      categories.forEach((category) => {
        const date = new Date(category.pageEntry.createdAt);
        const dateStr = date
          .toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
          .replace(" ", "");
        if (dateLabel === dateStr) {
          const prevValue = (series[category.categoryName] as number) ?? 0;
          series[category.categoryName] = prevValue + category.value;
        }
      });

      series.date = dateLabel;
      return series;
    });
  }, [aggregationPeriod, categories]);

  const series = useMemo(() => {
    if (data.length == 0) return [];
    return Object.keys(data[0] ?? {})
      .filter((key) => key !== "date")
      .map((key, index) => {
        const colorIndex = index % colors.length;
        return {
          name: key,
          color: `${colors[colorIndex]}.6`,
        };
      });
  }, [data]);
  return (
    <Flex direction={"column"}>
      <Card>
        <SegmentedControl
          value={aggregationPeriod?.value}
          onChange={(value) => {
            setAggregationPeriod(
              aggregationPeriods.find((x) => x.value === value)
            );
          }}
          data={aggregationPeriods}
        />
        <CheckboxGroup
          defaultValue={notebookEntriesWithEtc
            .filter((x) => x.selected)
            .map((x) => x.notebookEntryId.toString())}
          onChange={(value) => {
            setNotebookEntriesWithEtc(
              notebookEntriesWithEtc.map((x) => {
                return {
                  ...x,
                  selected: value.includes(x.notebookEntryId.toString()),
                };
              })
            );
          }}
        >
          <Group mt="xs">
            {notebookEntriesWithEtc.map((entry, index) => (
              <Flex direction={"column"} key={index}>
                <Checkbox
                  value={entry.notebookEntryId.toString()}
                  label={entry.label}
                  key={index}
                />
                <SegmentedControl
                  value={entry.aggregationMethod?.value}
                  onChange={(value) => {
                    const aggregationMethod = aggregationMethods.find(
                      (x) => x.value === value
                    );
                    if (!aggregationMethod) return;
                    const newEntries = [...notebookEntriesWithEtc];
                    const newEntry = { ...entry };
                    newEntry.aggregationMethod = aggregationMethod;
                    newEntries[index] = newEntry;
                    setNotebookEntriesWithEtc(newEntries);
                  }}
                  data={aggregationMethods}
                />
                <SegmentedControl
                  value={entry.category?.notebookEntryId.toString()}
                  onChange={(value) => {
                    const category = notebookEntries.find(
                      (x) => x.notebookEntryId === Number(value)
                    );
                    if (!category) return;
                    const newEntries = [...notebookEntriesWithEtc];
                    const newEntry = { ...entry };
                    newEntry.category = category;
                    newEntries[index] = newEntry;
                    setNotebookEntriesWithEtc(newEntries);
                  }}
                  data={notebookEntries.map((x) => ({
                    value: x.notebookEntryId.toString(),
                    label: x.label,
                  }))}
                />
              </Flex>
            ))}
          </Group>
        </CheckboxGroup>
      </Card>
      <Card>
        <AreaChart
          h={300}
          data={data}
          dataKey="date"
          series={series}
          curveType="linear"
        />
      </Card>
    </Flex>
  );
}

const unique = (ary: string[]): string[] => {
  return Array.from(new Set(ary));
};

const addDate = (
  date: Date,
  value: number,
  period: "day" | "week" | "month"
): Date => {
  const result = new Date(date);
  if (period === "day") {
    result.setDate(result.getDate() + value);
  } else if (period === "week") {
    result.setDate(result.getDate() + value * 7);
  } else if (period === "month") {
    result.setMonth(result.getMonth() + value);
  }
  return result;
};

const generateDateRange = (
  startDate: Date,
  endDate: Date,
  period: "day" | "week" | "month"
): string[] => {
  let current: Date = startDate;
  const range: Date[] = [];
  while (current <= endDate) {
    range.push(new Date(current));
    if (period === "day") {
      current = addDate(current, 1, "day");
    } else if (period === "week") {
      current = addDate(current, 1, "week");
    } else if (period === "month") {
      current = addDate(current, 1, "month");
    }
  }
  return range.map((date) =>
    date
      .toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
      .replace(" ", "")
  );
};
