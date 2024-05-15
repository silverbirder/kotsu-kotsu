"use client";

import React from "react";
import { Flex } from "@mantine/core";
import {
  AreaChart,
  BarChart,
  DonutChart,
  LineChart,
  PieChart,
  RadarChart,
} from "@mantine/charts";
import { type Props } from "./utils";
import useChartData from "./chart.hook";

const ChartComponent = ({
  chartType,
  pageEntries,
  aggregationStartPeriod,
  aggregationEndPeriod,
  aggregationPeriod,
  notebookEntriesWithEtc,
}: Pick<
  Props,
  | "chartType"
  | "pageEntries"
  | "aggregationStartPeriod"
  | "aggregationEndPeriod"
  | "aggregationPeriod"
  | "notebookEntriesWithEtc"
>) => {
  const { series, normalizedData, donutsdata } = useChartData(
    aggregationStartPeriod,
    aggregationEndPeriod,
    aggregationPeriod,
    notebookEntriesWithEtc,
    pageEntries
  );

  return (
    <Flex direction={{ base: "column", md: "row" }}>
      {chartType === "area" && (
        <AreaChart
          w={{ base: 300, md: 660 }}
          h={{ base: 300, md: 360 }}
          yAxisProps={{
            padding: {
              top: 10,
            },
          }}
          xAxisProps={{
            padding: {
              left: 10,
              right: 10,
            },
          }}
          data={normalizedData}
          dataKey="date"
          series={series}
          curveType="linear"
          withLegend
        />
      )}
      {chartType === "bar" && (
        <BarChart
          w={{ base: 300, md: 660 }}
          h={{ base: 300, md: 360 }}
          yAxisProps={{
            padding: {
              top: 10,
            },
          }}
          xAxisProps={{
            padding: {
              left: 10,
              right: 10,
            },
          }}
          data={normalizedData}
          dataKey="date"
          series={series}
          withLegend
        />
      )}
      {chartType === "line" && (
        <LineChart
          w={{ base: 300, md: 660 }}
          h={{ base: 300, md: 360 }}
          yAxisProps={{
            padding: {
              top: 10,
            },
          }}
          xAxisProps={{
            padding: {
              left: 10,
              right: 10,
            },
          }}
          data={normalizedData}
          dataKey="date"
          series={series}
          curveType="linear"
          withLegend
        />
      )}
      {chartType === "donut" && (
        <DonutChart
          w={{ base: 300, md: 660 }}
          data={donutsdata}
          withLabels
          withTooltip
          tooltipDataSource="segment"
        />
      )}
      {chartType === "pie" && (
        <PieChart
          w={{ base: 300, md: 660 }}
          data={donutsdata}
          withLabels
          withTooltip
          tooltipDataSource="segment"
        />
      )}
      {chartType === "radar" && (
        <RadarChart
          w={{ base: 340, md: 660 }}
          data={donutsdata}
          dataKey="name"
          series={[{ name: "value", color: "blue.6", opacity: 0.2 }]}
          withPolarGrid
          withPolarAngleAxis
          withPolarRadiusAxis
        />
      )}
    </Flex>
  );
};

export default ChartComponent;
