import { Fragment, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TableRowsIcon from "@mui/icons-material/TableRows";
import GridViewIcon from "@mui/icons-material/GridView";
import LabelIcon from "@mui/icons-material/Label";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CategoryIcon from "@mui/icons-material/Category";
import "./SidePanel.css";

const ALL_FILTER_VALUE = "All";

type Category = {
  resource_category: string;
  total_count: number;
  types: {
    resource_type: string;
    total_count: number;
  }[];
};

type SidePanelProps = {
  items: Category[];
  selectedItem: { category: string; type?: string };
  onItemClick: (category: string, type?: string) => void;
};

const sx = (
  selectedItem: SidePanelProps["selectedItem"],
  currentItem: SidePanelProps["selectedItem"]
) => ({
  backgroundColor:
    selectedItem.category === currentItem.category &&
    selectedItem.type === currentItem.type
      ? "rgba(255, 255, 255, 0.1)"
      : "transparent",
  borderRadius: 2,
});

const ExpandableList = ({
  category,
  selectedItem,
  onItemClick,
}: {
  category: Category;
  selectedItem: SidePanelProps["selectedItem"];
  onItemClick: SidePanelProps["onItemClick"];
}) => {
  const [isExpanded, setIsExpanded] = useState(
    selectedItem?.category === category.resource_category
  );
  const hasSubItems = category.types?.length > 0;
  const handleParentClick = (category: string) => {
    hasSubItems ? setIsExpanded(!isExpanded) : onItemClick(category);
  };
  const handleClick = (type: string, category: string) => {
    onItemClick(type, category);
  };
  const { resource_category, total_count, types } = category;

  return (
    <>
      <ListItem
        key={resource_category}
        disablePadding
        onClick={() => handleParentClick(resource_category)}
        sx={sx(selectedItem, { category: resource_category })}
      >
        <ListItemButton>
          <ListItemIcon>
            {hasSubItems ? <TableRowsIcon /> : <CategoryIcon />}
          </ListItemIcon>
          <ListItemText primary={resource_category} />
          {hasSubItems && (
            <ListItemIcon>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
          )}
        </ListItemButton>
      </ListItem>
      {hasSubItems && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit={true}>
          <List sx={{ paddingLeft: 2 }}>
            <ListItem
              disablePadding
              sx={sx(selectedItem, {
                category: resource_category,
                type: ALL_FILTER_VALUE,
              })}
              onClick={() => handleClick(resource_category, ALL_FILTER_VALUE)}
            >
              <ListItemButton>
                <ListItemIcon>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary={ALL_FILTER_VALUE}
                  secondary={total_count}
                />
              </ListItemButton>
            </ListItem>
            {types.map(({ resource_type, total_count }) => (
              <ListItem
                key={`${category}-${resource_type}`}
                disablePadding
                sx={sx(selectedItem, {
                  category: resource_category,
                  type: resource_type,
                })}
                onClick={() => handleClick(resource_category, resource_type)}
              >
                <ListItemButton>
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={resource_type}
                    secondary={total_count}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export const SidePanel = ({
  items,
  selectedItem,
  onItemClick,
}: SidePanelProps) => {
  const grandTotalCount = items.reduce(
    (acc, item) => acc + item.total_count,
    0
  );

  return (
    <List>
      <ListItem
        disablePadding
        sx={sx(selectedItem, { category: ALL_FILTER_VALUE })}
      >
        <ListItemButton>
          <ListItemIcon>
            <GridViewIcon />
          </ListItemIcon>
          <ListItemText
            primary="All resources"
            secondary={grandTotalCount}
            secondaryTypographyProps={{
              sx: { textAlign: "right" },
            }}
            onClick={() => onItemClick(ALL_FILTER_VALUE)}
          />
        </ListItemButton>
      </ListItem>
      {items.map((item) => {
        return (
          <Fragment key={item.resource_category}>
            <ExpandableList
              category={item}
              selectedItem={selectedItem}
              onItemClick={onItemClick}
            />
          </Fragment>
        );
      })}
    </List>
  );
};
