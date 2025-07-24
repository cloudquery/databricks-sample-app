import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import {
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  DataGridPro as DataGrid,
  gridClasses,
} from "@mui/x-data-grid-pro";
import "./InventoryTable.css";
import { useEffect, useState } from "react";
import debounce from "@mui/utils/debounce";

interface InventoryTableProps {
  rows: any[];
  columns: any[];
  loading: boolean;
  onFilterModelChange: (model: GridFilterModel) => void;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onSortModelChange: (model: GridSortModel) => void;
  filterModel: any;
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  rowCount?: number;
}

export const InventoryTable = ({
  rows,
  columns,
  loading,
  onFilterModelChange,
  onPaginationModelChange,
  onSortModelChange,
  filterModel,
  paginationModel,
  sortModel,
  rowCount,
}: InventoryTableProps) => {
  const debouncedFilterModelChange = debounce(onFilterModelChange, 1000);
  const [localFilterModel, setLocalFilterModel] =
    useState<GridFilterModel>(filterModel);

  const handleFilterModelChange = (model: GridFilterModel) => {
    // If DataGrid is trying to clear the filter but we have valid filters in parent, ignore it
    if (model.items.length === 0 && filterModel.items.length > 0) {
      return;
    }

    setLocalFilterModel(model);

    // Check if the model has actually changed compared to the current filterModel
    const hasChanged = JSON.stringify(model) !== JSON.stringify(filterModel);

    // If no filter items, allow the change
    if (model.items.length === 0) {
      if (hasChanged) {
        debouncedFilterModelChange(model);
      }
      return;
    }

    // Check if all items have valid values
    if (
      model.items.every(
        (item) =>
          item.value !== null && item.value !== undefined && item.value !== ""
      )
    ) {
      if (hasChanged) {
        debouncedFilterModelChange(model);
      }
    }
  };

  useEffect(() => {
    setLocalFilterModel(filterModel);
  }, [filterModel]);

  return (
    <>
      {loading ? (
        <Box sx={{ py: 2 }}>
          <CircularProgress color="success" disableShrink />
        </Box>
      ) : columns.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
            fontSize: "1rem",
            color: "text.secondary",
          }}
        >
          No data found
        </Box>
      ) : (
        <DataGrid
          sortingMode="server"
          filterMode="server"
          paginationMode="server"
          rows={rows}
          rowCount={rowCount || 0}
          showToolbar={true}
          pagination={true}
          columns={columns}
          getRowId={(row) => `${row._cq_id}_${row._cq_sync_time}`}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={paginationModel}
          sortModel={sortModel}
          filterModel={localFilterModel}
          onFilterModelChange={handleFilterModelChange}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange}
          sx={{
            [`& .${gridClasses.cell}`]: {
              height: "52px",
            },
            border: "none",
            "& .MuiDataGrid-toolbarQuickFilter": {
              display: "none",
            },
          }}
        />
      )}
    </>
  );
};
