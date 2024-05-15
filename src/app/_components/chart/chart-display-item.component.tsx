"use client";

import React, { useCallback, useMemo } from "react";
import {
  Card,
  Stack,
  Flex,
  Text,
  Checkbox,
  SegmentedControl,
} from "@mantine/core";
import type { Props } from "./utils";

interface ChartDisplayItemProps {
  entry: Props["notebookEntriesWithEtc"][number];
  index: number;
  notebookEntries: Props["notebookEntries"];
  aggregationMethods: { value: string; label: string }[];
  setNotebookEntriesWithEtc: (entries: Props["notebookEntriesWithEtc"]) => void;
  notebookEntriesWithEtc: Props["notebookEntriesWithEtc"];
}

const ChartDisplayItem: React.FC<ChartDisplayItemProps> = ({
  entry,
  index,
  notebookEntries,
  aggregationMethods,
  setNotebookEntriesWithEtc,
  notebookEntriesWithEtc,
}) => {
  const handleAggregationMethodChange = useCallback(
    (value: string) => {
      const aggregationMethod = aggregationMethods.find(
        (x) => x.value === value
      );
      if (!aggregationMethod) return;
      const newEntries = [...notebookEntriesWithEtc];
      const newEntry = { ...entry };
      newEntry.aggregationMethod = aggregationMethod;
      newEntries[index] = newEntry;
      setNotebookEntriesWithEtc(newEntries);
    },
    [
      aggregationMethods,
      notebookEntriesWithEtc,
      entry,
      index,
      setNotebookEntriesWithEtc,
    ]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
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
    },
    [
      notebookEntries,
      notebookEntriesWithEtc,
      entry,
      index,
      setNotebookEntriesWithEtc,
    ]
  );

  const selectable = useMemo(
    () => [
      { value: "0", label: "なし" },
      ...notebookEntries
        .filter(
          (notebookEntry) =>
            notebookEntry.notebookEntryId !== entry.notebookEntryId &&
            notebookEntry.valueType === "array"
        )
        .map((x) => ({
          value: x.notebookEntryId.toString(),
          label: x.label,
        })),
    ],
    [notebookEntries, entry.notebookEntryId]
  );

  return (
    <Stack gap={0} key={index}>
      <Checkbox value={entry.notebookEntryId.toString()} label={entry.label} />
      <Card withBorder>
        <Flex direction={"column"} key={index}>
          <Stack gap={0}>
            <Text size="sm" fw={500}>
              計算方法
            </Text>
            <SegmentedControl
              value={entry.aggregationMethod?.value}
              onChange={handleAggregationMethodChange}
              data={aggregationMethods}
            />
          </Stack>
          <Stack gap={0}>
            <Text size="sm" fw={500}>
              カテゴリ
            </Text>
            <SegmentedControl
              value={
                entry.category ? entry.category.notebookEntryId.toString() : "0"
              }
              onChange={handleCategoryChange}
              data={selectable}
            />
          </Stack>
        </Flex>
      </Card>
    </Stack>
  );
};

export default ChartDisplayItem;
