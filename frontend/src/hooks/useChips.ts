import { GridFilterItem, GridFilterModel } from "@mui/x-data-grid-pro";
import { useState } from "react";

export const useChips = () => {
  const [chips, setChips] = useState<string[]>([]);

  const updateChipsFromFilterModel = (filterModel?: GridFilterModel) => {
    setChips([
      ...(filterModel?.items || [])
        .filter((item: GridFilterItem) => item.field && item.value)
        .map(
          (item: GridFilterItem) =>
            `${item.field} ${item.operator} ${item.value}`
        ),
    ]);
  };

  return { chips, updateChipsFromFilterModel };
};
