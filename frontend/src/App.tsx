import { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import { createThemeOptions } from "@cloudquery/cloud-ui";
import { MuiChipsInput } from "mui-chips-input";
import { SidePanel } from "./components/SidePanel";
import { InventoryTable } from "./components/InventoryTable";
import { useDatabricks } from "./hooks/useDatabricks";
import { useChips } from "./hooks/useChips";
import logo from "./assets/logo.svg";

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
    columnVisibilityModel,
    setColumnVisibilityModel,
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
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box
          sx={{
            width: "275px",
            flexShrink: 0,
            height: "100%",
            bgcolor: "secondary.darkest",
            borderRight: "1px solid",
            borderRightColor: "secondary.dark",
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{
              width: "160px",
              height: "auto",
              margin: "20px auto",
              display: "block",
            }}
          />
          <SidePanel
            items={panelData?.data || []}
            onItemClick={handlePanelItemClick}
            selectedItem={{
              category: selectedCategory,
              type: selectedType,
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Box sx={{ flexShrink: 0, p: 2 }}>
            <MuiChipsInput
              size="small"
              value={chips}
              onChange={handleManualClauseChange}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1, overflow: "hidden" }}>
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
              onColumnVisibilityModelChange={setColumnVisibilityModel}
              columnVisibilityModel={columnVisibilityModel}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
