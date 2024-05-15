import { useMemo } from "react";
import dayjs from "dayjs";
import {
  generateDateRange,
  addDate,
  unique,
  colors,
  shuffleArray,
  type Props,
} from "./utils";

interface DataItem {
  [key: string]: number | string;
  date: string;
}

interface SeriesItem {
  name: string;
  color: string;
}

const getCategories = (
  notebookEntriesWithEtc: Props["notebookEntriesWithEtc"],
  pageEntries: Props["pageEntries"]
) => {
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
                    pageEntry.notebookEntryId === notebookEntry.notebookEntryId
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
};

const getData = (
  aggregationStartPeriod: Date,
  aggregationEndPeriod: Date,
  aggregationPeriod: { value: string; label: string },
  categories: ReturnType<typeof getCategories>
): DataItem[] => {
  const dateRange = generateDateRange(
    dayjs(aggregationStartPeriod),
    dayjs(aggregationEndPeriod),
    aggregationPeriod?.value as "day" | "week" | "month"
  );

  return dateRange.map((dateLabel, index) => {
    let nextDateLabel: dayjs.Dayjs;
    if (index < dateRange.length - 1) {
      const date = dateRange[index + 1];
      if (date !== undefined) {
        nextDateLabel = date;
      }
    } else {
      const date = dateRange[index];
      if (date !== undefined) {
        nextDateLabel = addDate(
          date,
          1,
          aggregationPeriod?.value as "day" | "week" | "month"
        );
      }
    }
    const series: DataItem = {
      date: dateLabel.format("M月D日").replace(" ", ""),
    };
    categories.forEach((category) => {
      const categoryDate = dayjs(category.pageEntry.createdAt);
      if (
        (categoryDate.isAfter(dateLabel) || categoryDate.isSame(dateLabel)) &&
        categoryDate.isBefore(nextDateLabel)
      ) {
        const prevValue = (series[category.categoryName] as number) ?? 0;
        const aggregationMethod =
          category.notebookEntry.aggregationMethod?.value;
        if (aggregationMethod === "sum") {
          series[category.categoryName] = prevValue + category.value;
        } else if (aggregationMethod === "max") {
          series[category.categoryName] = Math.max(prevValue, category.value);
        } else if (aggregationMethod === "avg") {
          const count =
            (series[`${category.categoryName}_count`] as number) ?? 0;
          series[category.categoryName] =
            (prevValue * count + category.value) / (count + 1);
          series[`${category.categoryName}_count`] = count + 1;
        }
      }
    });
    return series;
  });
};

const getUniqNames = (data: DataItem[]): string[] => {
  return unique(data.map((d) => Object.keys(d)).flat()).filter(
    (d) => d !== "date" && !d.endsWith("_count")
  );
};

const getSeries = (
  uniqNames: string[],
  shuffledColors: string[]
): SeriesItem[] => {
  return uniqNames.map((key, index) => {
    const colorIndex = index % shuffledColors.length;
    return {
      name: key,
      color: `${shuffledColors[colorIndex]}.6`,
    };
  });
};

const getNormalizedData = (
  data: DataItem[],
  uniqNames: string[]
): DataItem[] => {
  return data.map((entry) => {
    const normalizedEntry = { ...entry };
    uniqNames.forEach((key) => {
      if (!(key in entry)) {
        normalizedEntry[key] = 0;
      }
    });
    return normalizedEntry;
  });
};

const getDonutsData = (series: SeriesItem[], data: DataItem[]) => {
  return series.map((x) => {
    const result = {
      name: x.name,
      color: x.color,
      value: data
        .map((d) => d[x.name] as number)
        .filter((x) => !isNaN(x))
        .reduce((a, b) => a + b, 0),
    };
    return result;
  });
};

const useChartData = (
  aggregationStartPeriod: Date,
  aggregationEndPeriod: Date,
  aggregationPeriod: { value: string; label: string },
  notebookEntriesWithEtc: Props["notebookEntriesWithEtc"],
  pageEntries: Props["pageEntries"]
) => {
  const categories = useMemo(
    () => getCategories(notebookEntriesWithEtc, pageEntries),
    [notebookEntriesWithEtc, pageEntries]
  );
  const data = useMemo(
    () =>
      getData(
        aggregationStartPeriod,
        aggregationEndPeriod,
        aggregationPeriod,
        categories
      ),
    [
      aggregationStartPeriod,
      aggregationEndPeriod,
      aggregationPeriod,
      categories,
    ]
  );
  const uniqNames = useMemo(() => getUniqNames(data), [data]);

  const shuffledColors = useMemo(() => shuffleArray(colors), []);

  const series = useMemo(
    () => getSeries(uniqNames, shuffledColors),
    [uniqNames, shuffledColors]
  );
  const normalizedData = useMemo(
    () => getNormalizedData(data, uniqNames),
    [data, uniqNames]
  );
  const donutsdata = useMemo(() => getDonutsData(series, data), [series, data]);
  return {
    series,
    normalizedData,
    donutsdata,
  };
};

export default useChartData;
