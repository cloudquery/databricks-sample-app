import { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { createThemeOptions } from "@cloudquery/cloud-ui";
import { MuiChipsInput } from "mui-chips-input";
import { SidePanel } from "./components/SidePanel";
import { InventoryTable } from "./components/InventoryTable";
import { useDatabricks } from "./hooks/useDatabricks";
import { useChips } from "./hooks/useChips";

const cloudUITheme = createThemeOptions();
const theme = createTheme(cloudUITheme);

function App() {
  const { chips, updateChipsFromFilterModel } = useChips();
  const {
    panelData,
    tableData,
    loading,
    columns,
    filterModel,
    paginationModel,
    sortModel,
    setFilterModel,
    setPaginationModel,
    setSortModel,
    selectedCategory,
    selectedType,
    rowCount,
  } = useDatabricks();

  const handleManualClauseChange = (newChips: string[]) => {
    setFilterModel({
      items: newChips.map((chip) => {
        const [field, operator, value] = chip.split(" ");
        return { field, operator, value };
      }),
    });
  };

  const handlePanelItemClick = (category?: string, type?: string) => {
    setPaginationModel({ page: 0, pageSize: 25 });
    setFilterModel({
      items: [
        {
          field: "resource_category",
          operator: "equals",
          value: category,
        },
        { field: "resource_type", operator: "equals", value: type },
      ],
    });
  };

  const handleFilterModelChange = (model: any) => {
    setFilterModel(model);
  };

  useEffect(() => {
    updateChipsFromFilterModel(filterModel);
  }, [filterModel]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack direction={"row"}>
        <Box p={2} sx={{ width: "275px" }}>
          <SidePanel
            items={panelData?.data || []}
            onItemClick={handlePanelItemClick}
            selectedItem={{
              category: selectedCategory,
              type: selectedType,
            }}
          />
        </Box>
        <Box p={2} sx={{ textAlign: "center", width: "80vw" }}>
          <MuiChipsInput
            value={chips}
            onChange={handleManualClauseChange}
            fullWidth
          />
          <InventoryTable
            rows={tableData?.data || []}
            columns={columns}
            loading={loading}
            filterModel={filterModel}
            paginationModel={paginationModel}
            sortModel={sortModel}
            rowCount={rowCount}
            onFilterModelChange={handleFilterModelChange}
            onPaginationModelChange={setPaginationModel}
            onSortModelChange={setSortModel}
          />
        </Box>
      </Stack>
    </ThemeProvider>
  );
}

export default App;
