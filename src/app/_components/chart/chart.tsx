"use client";

import React, { useState } from "react";
import { Stack } from "@mantine/core";
import ChartComponent from "./chart.component";
import ChartSettings from "./chart-settings.component";
import ChartDisplayItems from "./chart-display-items.component";
import { type Props } from "./utils";
import dayjs from "dayjs";

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

  return (
    <Stack gap={0}>
      <ChartComponent
        chartType={chartType}
        pageEntries={pageEntries}
        aggregationStartPeriod={aggregationStartPeriod}
        aggregationEndPeriod={aggregationEndPeriod}
        aggregationPeriod={aggregationPeriod}
        notebookEntriesWithEtc={notebookEntriesWithEtc}
      />
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
