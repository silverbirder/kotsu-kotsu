"use client";

import {
  SegmentedControl,
  Flex,
  Checkbox,
  CheckboxGroup,
  Card,
  Stack,
  Text,
  Fieldset,
} from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { useMemo, useState } from "react";
import { DatePickerInput } from "@mantine/dates";

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
    pageId: number;
  }[];
};

const colors = [
  "red",
  "green",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "lime",
  "yellow",
  "orange",
  "gray",
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
  const aggregationMethods = [
    { value: "sum", label: "合計" },
    { value: "sum", label: "最大" },
    { value: "sum", label: "最小" },
  ];
  const [notebookEntriesWithEtc, setNotebookEntriesWithEtc] = useState(
    notebookEntries.map((entry) => ({
      ...entry,
      selected: true,
      aggregationMethod: aggregationMethods[0],
      category: null as null | typeof entry,
    }))
  );
  const categories = useMemo(() => {
    const notebooks = notebookEntriesWithEtc
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
                  pageEntries,
                  notebookEntry,
                  categoryName: `${notebookEntry.label}-はい`,
                  value: (pageEntry.value as boolean) === true ? 1 : 0,
                },
                {
                  pageEntry,
                  pageEntries,
                  notebookEntry,
                  categoryName: `${notebookEntry.label}-いいえ`,
                  value: (pageEntry.value as boolean) === false ? 1 : 0,
                },
              ];
            } else if (notebookEntry.valueType === "number") {
              return [
                {
                  pageEntry,
                  pageEntries,
                  notebookEntry,
                  categoryName: notebookEntry.label,
                  value: pageEntry.value as number,
                },
              ];
            } else if (notebookEntry.valueType === "array") {
              return notebookEntry.select.map((select) => {
                return {
                  pageEntry,
                  pageEntries,
                  notebookEntry,
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
                  pageEntries,
                  notebookEntry,
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
    const newNotebooks = notebooks
      .map((notebook) => {
        const category = notebook.notebookEntry.category;
        if (!category) return [notebook];
        const categoryPageEntry = notebook.pageEntries.find(
          (pageEntry) =>
            pageEntry.notebookEntryId === category?.notebookEntryId &&
            pageEntry.pageId === notebook.pageEntry.pageId
        );
        if (!categoryPageEntry) return [notebook];
        if (category.valueType === "array") {
          const categoryValue = category.select.find(
            (x) => x.id === categoryPageEntry.value
          )?.value;
          const newNotebook = {
            ...notebook,
            categoryName: `${notebook.categoryName}-${categoryValue}`,
          };
          return [newNotebook];
        } else {
          return [notebook];
        }
      })
      .flat();
    return newNotebooks;
  }, [notebookEntriesWithEtc, pageEntries]);

  const data = useMemo(() => {
    const dates = categories.map((x) =>
      new Date(x.pageEntry.createdAt).getTime()
    );
    const startDate = new Date(Math.min(...dates));
    const dateRange: Date[] = generateDateRange(
      startDate,
      aggregationPeriod?.value as "day" | "week" | "month"
    );

    return dateRange.map((dateLabel, index) => {
      let nextDateLabel: Date;
      if (index < dateRange.length - 1) {
        nextDateLabel = new Date(dateRange[index + 1] ?? "");
      } else {
        nextDateLabel = addDate(
          new Date(dateRange[index] ?? ""),
          1,
          aggregationPeriod?.value as "day" | "week" | "month"
        );
      }

      const series: Record<string, number | string> = {};
      categories.forEach((category) => {
        const categoryDate = new Date(category.pageEntry.createdAt);
        if (
          categoryDate >= new Date(dateLabel) &&
          categoryDate < nextDateLabel
        ) {
          const prevValue = (series[category.categoryName] as number) ?? 0;
          series[category.categoryName] = prevValue + category.value;
        }
      });

      series.date = dateLabel
        .toLocaleDateString("ja-JP", { month: "short", day: "numeric" })
        .replace(" ", "");
      return series;
    });
  }, [aggregationPeriod, categories]);

  const uniqNames = useMemo(() => {
    return unique(data.map((d) => Object.keys(d)).flat()).filter(
      (d) => d !== "date"
    );
  }, [data]);

  const series = useMemo(() => {
    if (data.length == 0) return [];
    return uniqNames.map((key, index) => {
      const colorIndex = index % colors.length;
      return {
        name: key,
        color: `${colors[colorIndex]}.6`,
      };
    });
  }, [data, uniqNames]);

  const normalizedData = useMemo(() => {
    return data.map((entry) => {
      const normalizedEntry = { ...entry };
      uniqNames.forEach((key) => {
        if (!(key in entry)) {
          normalizedEntry[key] = 0;
        }
      });
      return normalizedEntry;
    });
  }, [data, uniqNames]);
  return (
    <Stack gap={0}>
      <Flex direction={{ base: "column", md: "row" }}>
        <Card>
          <AreaChart
            w={{ base: 360, md: 660 }}
            h={{ base: 360, md: 360 }}
            data={normalizedData}
            dataKey="date"
            series={series}
            curveType="linear"
          />
        </Card>
        <Card>
          <Fieldset legend="グラフ設定">
            <Stack gap={0}>
              <Text size="sm" fw={500}>
                集計範囲
              </Text>
              <Flex gap={"sm"}>
                <DatePickerInput label="開始" value={new Date()} />
                <DatePickerInput label="終了" value={new Date()} />
              </Flex>
            </Stack>
            <Stack gap={0}>
              <Text size="sm" fw={500}>
                集計単位
              </Text>
              <SegmentedControl
                value={aggregationPeriod?.value}
                onChange={(value) => {
                  setAggregationPeriod(
                    aggregationPeriods.find((x) => x.value === value)
                  );
                }}
                data={aggregationPeriods}
              />
            </Stack>
          </Fieldset>
        </Card>
      </Flex>
      <Card>
        <Fieldset legend="表示する項目">
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
            <Flex direction={{ base: "column", md: "row" }} gap={"sm"}>
              {notebookEntriesWithEtc.map((entry, index) => {
                const selectable = [
                  {
                    value: "0",
                    label: "なし",
                  },
                  ...notebookEntries
                    .filter(
                      (notebookEntry) =>
                        notebookEntry.notebookEntryId !==
                          entry.notebookEntryId &&
                        notebookEntry.valueType === "array"
                    )
                    .map((x) => ({
                      value: x.notebookEntryId.toString(),
                      label: x.label,
                    })),
                ];
                return (
                  <Stack gap={0} key={index}>
                    <Checkbox
                      value={entry.notebookEntryId.toString()}
                      label={entry.label}
                    />
                    <Card withBorder>
                      <Flex direction={"column"} key={index}>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            計算方法
                          </Text>
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
                        </Stack>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            カテゴリ分割
                          </Text>
                          <SegmentedControl
                            value={
                              entry.category
                                ? entry.category.notebookEntryId.toString()
                                : "0"
                            }
                            onChange={(value) => {
                              const category = notebookEntries.find(
                                (x) => x.notebookEntryId === Number(value)
                              );
                              const newEntries = [...notebookEntriesWithEtc];
                              const newEntry = { ...entry };
                              if (!category) {
                                newEntry.category = null;
                              } else {
                                newEntry.category = category;
                              }
                              newEntries[index] = newEntry;
                              setNotebookEntriesWithEtc(newEntries);
                            }}
                            data={selectable}
                          />
                        </Stack>
                      </Flex>
                    </Card>
                  </Stack>
                );
              })}
            </Flex>
          </CheckboxGroup>
        </Fieldset>
      </Card>
    </Stack>
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
  period: "day" | "week" | "month"
): Date[] => {
  let current: Date = startDate;
  const range: Date[] = [];
  if (period === "day") {
    for (let i = 0; i < 7; i++) {
      range.push(current);
      current = addDate(current, 1, "day");
    }
  } else if (period === "week") {
    for (let i = 0; i < 5; i++) {
      range.push(current);
      current = addDate(current, 1, "week");
    }
  } else if (period === "month") {
    for (let i = 0; i < 12; i++) {
      range.push(current);
      current = addDate(current, 1, "month");
    }
  }
  return range;
};
