import { useMemo } from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

import { ChipWithTooltip } from "./ChipWithTooltip";

export interface TagsDisplayProps {
  limit?: number;
  nullValue?: string | null;
  onClick?: (tagValue: string) => void;
  showKeyValue?: boolean;
  tags?: Record<string, string> | string[];
  wrap?: boolean;
}

const tagProps = {
  size: "small" as const,
  sx: { fontSize: "13px" },
};

export const TagsDisplay = ({
  limit = 1,
  nullValue = null,
  onClick,
  showKeyValue = true,
  tags = {},
  wrap,
}: TagsDisplayProps) => {
  const tagsArray = useMemo(() => {
    if (typeof tags === "object") {
      return Object.entries(tags);
    } else {
      try {
        return Object.entries(JSON.parse(tags) as Record<string, string>);
      } catch {
        return [];
      }
    }
  }, [tags]);

  if (tagsArray.length === 0) {
    return nullValue;
  }

  const tagsOverflow: boolean = tagsArray.length > limit;

  return (
    <Box
      alignItems="center"
      display="flex"
      flexWrap={wrap ? "wrap" : undefined}
      gap={0.5}
      height="100%"
      justifyContent="flex-start"
    >
      {tagsArray.slice(0, limit).map(([key, value]) => {
        const tagValue = showKeyValue
          ? `${key}: ${
              typeof value === "string" ? value : JSON.stringify(value)
            }`
          : value;

        return (
          <ChipWithTooltip
            key={key}
            label={tagValue}
            onClick={onClick ? () => onClick(tagValue) : undefined}
            {...tagProps}
          />
        );
      })}
      {tagsOverflow && (
        <Tooltip
          title={
            <Stack gap={0.5}>
              {tagsArray.slice(limit).map(([key, value]) => {
                const tagValue = showKeyValue ? `${key}: ${value}` : value;

                return (
                  <ChipWithTooltip
                    key={key}
                    label={tagValue}
                    onClick={onClick ? () => onClick(tagValue) : undefined}
                    {...tagProps}
                  />
                );
              })}
            </Stack>
          }
        >
          <Chip
            label={`+${tagsArray.length - limit}`}
            {...tagProps}
            sx={{ ...tagProps?.sx, cursor: onClick ? "pointer" : "inherit" }}
          />
        </Tooltip>
      )}
    </Box>
  );
};
