import type dayjs from "dayjs";

type NotebookEntry = {
  notebookId: number;
  notebookEntryId: number;
  label: string;
  valueType: "string" | "number" | "boolean" | "array";
  select: {
    id: number;
    value: string;
  }[];
};

type NotebookEntryWithEtc = NotebookEntry & {
  selected: boolean;
  aggregationMethod: { value: string; label: string };
  category: null | NotebookEntry;
};

export type Props = {
  notebookEntries: NotebookEntry[];
  pageEntries: {
    value: string | number | boolean | null;
    createdAt: Date;
    notebookEntryId: number;
    pageId: number;
  }[];
  chartType: "area" | "bar" | "line" | "donut" | "pie" | "radar";
  aggregationStartPeriod: Date;
  aggregationEndPeriod: Date;
  aggregationPeriod: { value: string; label: string };
  setAggregationStartPeriod: (date: Date) => void;
  setAggregationEndPeriod: (date: Date) => void;
  setAggregationPeriod: (period: { value: string; label: string }) => void;
  notebookEntriesWithEtc: NotebookEntryWithEtc[];
  setNotebookEntriesWithEtc: (entries: NotebookEntryWithEtc[]) => void;
};

export const colors = [
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

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray: T[] = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [
      shuffledArray[j],
      shuffledArray[i],
    ] as [T, T];
  }
  return shuffledArray;
};

export const unique = (ary: string[]): string[] => {
  return Array.from(new Set(ary));
};

export const addDate = (
  date: dayjs.Dayjs,
  value: number,
  period: "day" | "week" | "month"
): dayjs.Dayjs => {
  if (period === "day") {
    return date.add(value, "day");
  } else if (period === "week") {
    return date.add(value, "week");
  } else if (period === "month") {
    return date.add(value, "month");
  }
  return date;
};

export const generateDateRange = (
  startDate: dayjs.Dayjs,
  endDate: dayjs.Dayjs,
  period: "day" | "week" | "month"
): dayjs.Dayjs[] => {
  const range: dayjs.Dayjs[] = [];
  let current = startDate.startOf("day");

  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    range.push(current);
    current = addDate(current, 1, period);
  }

  return range;
};
