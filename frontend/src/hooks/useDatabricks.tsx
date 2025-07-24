import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TagsDisplay } from "../components/TagsDisplay";
import {
  GridFilterModel,
  GridFilterItem,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid-pro";
import { useRoutedState } from "./useRoutedState";

export const useDatabricks = () => {
  const [sortModel, setSortModel] = useRoutedState<GridSortModel>({
    key: "sorting",
    defaultValue: [],
  });

  const [filterModel, setFilterModel] = useRoutedState<GridFilterModel>({
    key: "filter",
    defaultValue: { items: [] },
  });

  const [paginationModel, setPaginationModel] =
    useRoutedState<GridPaginationModel>({
      key: "pagination",
      defaultValue: { page: 0, pageSize: 25 },
    });

  const { data: panelData, isLoading: isPanelLoading } = useQuery({
    queryKey: ["panelData"],
    queryFn: async () => {
      const response = await fetch("/api/classification");
      return response.json();
    },
  });

  const { data: tableData, isLoading: isTableLoading } = useQuery({
    queryKey: [
      "tableData",
      `filter=${filterModel.items
        .map(({ field, operator, value }) => `${field}:${operator}:${value}`)
        .join("|")}`,
      `pagination=${JSON.stringify(paginationModel)}`,
      `sorting=${JSON.stringify(sortModel)}`,
    ],
    queryFn: async () => {
      const sorting = JSON.stringify(sortModel);
      // Filter out "All" values for resource_category and resource_type
      const filter = JSON.stringify(
        filterModel.items.filter(
          (item) =>
            !["resource_category", "resource_type"].includes(item.field) ||
            item.value !== "All"
        )
      );
      const response = await fetch(
        `/api/data?page=${paginationModel.page}&pageSize=${paginationModel.pageSize}&filter=${filter}&sorting=${sorting}`
      );
      return response.json();
    },
  });

  const columns = useMemo(
    () =>
      Object.keys(tableData?.data[0] || {}).map((key) => ({
        field: key,
        headerName: key,
        width: key === "tags" ? 300 : 150,
        ...(key === "tags" && {
          renderCell: (params: any) => {
            return <TagsDisplay tags={params.value} limit={1} />;
          },
        }),
      })),
    [tableData]
  );

  const { selectedCategory, selectedType } = useMemo(() => {
    return {
      selectedCategory: filterModel?.items.find(
        (item: GridFilterItem) => item.field === "resource_category"
      )?.value,
      selectedType: filterModel?.items.find(
        (item: GridFilterItem) => item.field === "resource_type"
      )?.value,
    };
  }, [filterModel]);

  return {
    panelData,
    tableData,
    loading: isPanelLoading || isTableLoading,
    columns,
    filterModel,
    setFilterModel,
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    selectedCategory,
    selectedType,
    rowCount: tableData?.rowCount,
  };
};
