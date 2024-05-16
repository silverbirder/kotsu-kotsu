"use client";

import React, { useCallback, useState } from "react";
import { Flex, Indicator, Stack } from "@mantine/core";
import ChartComponent from "./chart.component";
import ChartSettings from "./chart-settings.component";
import ChartDisplayItems from "./chart-display-items.component";
import { type Props } from "./utils";
import dayjs from "dayjs";
import { Calendar } from "@mantine/dates";

export const Chart: React.FC<
  Pick<Props, "chartType" | "notebookEntries" | "pageEntries">
> = ({ chartType, notebookEntries, pageEntries }) => {
  const [aggregationStartPeriod, setAggregationStartPeriod] = useState(
    dayjs().subtract(7, "day").startOf("day").toDate()
  );
  const [aggregationEndPeriod, setAggregationEndPeriod] = useState(
    dayjs().endOf("day").toDate()
  );
  const [aggregationPeriod, setAggregationPeriod] = useState<{
    value: string;
    label: string;
  }>({ value: "day", label: "日" });
  const [notebookEntriesWithEtc, setNotebookEntriesWithEtc] = useState(
    notebookEntries.map((entry) => ({
      ...entry,
      selected: true,
      aggregationMethod: { value: "sum", label: "合計" },
      category: null as null | typeof entry,
    }))
  );
  const renderDay = useCallback(
    (date: Date) => {
      const dayjsDate = dayjs(date);
      const index = pageEntries.findIndex((pageEntry) =>
        dayjsDate.isSame(pageEntry.createdAt, "date")
      );
      return (
        <Indicator size={6} offset={-2} disabled={index === -1}>
          <div>{dayjsDate.date()}</div>
        </Indicator>
      );
    },
    [pageEntries]
  );

  return (
    <Stack gap={0}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "center", md: "flex-start" }}
        justify={"center"}
      >
        <ChartComponent
          chartType={chartType}
          pageEntries={pageEntries}
          aggregationStartPeriod={aggregationStartPeriod}
          aggregationEndPeriod={aggregationEndPeriod}
          aggregationPeriod={aggregationPeriod}
          notebookEntriesWithEtc={notebookEntriesWithEtc}
        />
        <Calendar
          static
          minDate={aggregationStartPeriod}
          maxDate={aggregationEndPeriod}
          locale="ja"
          renderDay={renderDay}
        />
      </Flex>
      <ChartSettings
        aggregationStartPeriod={aggregationStartPeriod}
        aggregationEndPeriod={aggregationEndPeriod}
        aggregationPeriod={aggregationPeriod}
        setAggregationStartPeriod={(date) =>
          setAggregationStartPeriod(dayjs(date).startOf("day").toDate())
        }
        setAggregationEndPeriod={(date) =>
          setAggregationEndPeriod(dayjs(date).endOf("day").toDate())
        }
        setAggregationPeriod={setAggregationPeriod}
      />
      <ChartDisplayItems
        notebookEntries={notebookEntries}
        notebookEntriesWithEtc={notebookEntriesWithEtc}
        setNotebookEntriesWithEtc={setNotebookEntriesWithEtc}
      />
    </Stack>
  );
};
