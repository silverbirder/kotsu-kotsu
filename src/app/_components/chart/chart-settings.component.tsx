"use client";
import "dayjs/locale/ja";
import React, { useCallback, useMemo } from "react";
import {
  Card,
  Stack,
  Flex,
  Text,
  Fieldset,
  SegmentedControl,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { Props } from "./utils";
import dayjs from "dayjs";

const ChartSettings: React.FC<
  Pick<
    Props,
    | "aggregationStartPeriod"
    | "aggregationEndPeriod"
    | "aggregationPeriod"
    | "setAggregationStartPeriod"
    | "setAggregationEndPeriod"
    | "setAggregationPeriod"
  >
> = ({
  aggregationStartPeriod,
  aggregationEndPeriod,
  aggregationPeriod,
  setAggregationStartPeriod,
  setAggregationEndPeriod,
  setAggregationPeriod,
}) => {
  const aggregationPeriods = useMemo(
    () => [
      { value: "day", label: "日" },
      { value: "week", label: "週" },
      { value: "month", label: "月" },
    ],
    []
  );

  const handleStartPeriodChange = useCallback(
    (v: Date | null) => {
      if (!v) return;
      const start = dayjs(v).startOf("day").toDate();
      setAggregationStartPeriod(start);
    },
    [setAggregationStartPeriod]
  );

  const handleEndPeriodChange = useCallback(
    (v: Date | null) => {
      if (!v) return;
      const end = dayjs(v).endOf("day").toDate();
      setAggregationEndPeriod(end);
    },
    [setAggregationEndPeriod]
  );

  const handlePeriodChange = useCallback(
    (value: string) => {
      const period = aggregationPeriods.find((x) => x.value === value);
      if (period) setAggregationPeriod(period);
    },
    [aggregationPeriods, setAggregationPeriod]
  );

  return (
    <Card>
      <Fieldset legend="グラフ設定">
        <Stack gap={0}>
          <Text size="sm" fw={500}>
            集計範囲
          </Text>
          <Flex gap={"sm"}>
            <DatePickerInput
              label="開始"
              value={aggregationStartPeriod}
              onChange={handleStartPeriodChange}
              valueFormat="YYYY年M月D日"
              locale="ja"
            />
            <DatePickerInput
              label="終了"
              value={aggregationEndPeriod}
              onChange={handleEndPeriodChange}
              valueFormat="YYYY年M月D日"
              locale="ja"
            />
          </Flex>
        </Stack>
        <Stack gap={0}>
          <Text size="sm" fw={500}>
            集計単位
          </Text>
          <SegmentedControl
            value={aggregationPeriod?.value}
            onChange={handlePeriodChange}
            data={aggregationPeriods}
          />
        </Stack>
      </Fieldset>
    </Card>
  );
};

export default ChartSettings;
