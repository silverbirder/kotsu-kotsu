"use client";

import React, { useCallback, useMemo } from "react";
import { Card, Flex, Fieldset, CheckboxGroup } from "@mantine/core";
import type { Props } from "./utils";
import ChartDisplayItem from "./chart-display-item.component";

const ChartDisplayItems: React.FC<
  Pick<
    Props,
    "notebookEntries" | "notebookEntriesWithEtc" | "setNotebookEntriesWithEtc"
  >
> = ({
  notebookEntries,
  notebookEntriesWithEtc,
  setNotebookEntriesWithEtc,
}) => {
  const handleCheckboxGroupChange = useCallback(
    (value: string[]) => {
      setNotebookEntriesWithEtc(
        notebookEntriesWithEtc.map((x) => ({
          ...x,
          selected: value.includes(x.notebookEntryId.toString()),
        }))
      );
    },
    [notebookEntriesWithEtc, setNotebookEntriesWithEtc]
  );

  const defaultValue = useMemo(
    () =>
      notebookEntriesWithEtc
        .filter((x) => x.selected)
        .map((x) => x.notebookEntryId.toString()),
    [notebookEntriesWithEtc]
  );

  return (
    <Card>
      <Fieldset legend="表示する項目">
        <CheckboxGroup
          defaultValue={defaultValue}
          onChange={handleCheckboxGroupChange}
        >
          <Flex direction={{ base: "column", md: "row" }} gap={"sm"}>
            {notebookEntriesWithEtc.map((entry, index) => (
              <ChartDisplayItem
                key={entry.notebookEntryId}
                entry={entry}
                index={index}
                notebookEntries={notebookEntries}
                setNotebookEntriesWithEtc={setNotebookEntriesWithEtc}
                notebookEntriesWithEtc={notebookEntriesWithEtc}
              />
            ))}
          </Flex>
        </CheckboxGroup>
      </Fieldset>
    </Card>
  );
};

export default ChartDisplayItems;
