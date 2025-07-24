'use client';

import { useState, useRef } from 'react';

import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

interface ChipWithTooltipProps {
  [key: string]: any;
  label: string;
  onClick?: () => void;
}

export const ChipWithTooltip = ({ label, onClick, ...props }: ChipWithTooltipProps) => {
  const [isClipped, setIsClipped] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (textRef.current) {
      const { clientWidth, scrollWidth } = textRef.current;
      setIsClipped(scrollWidth > clientWidth);
    }
  };

  return (
    <Tooltip disableHoverListener={!isClipped} title={label}>
      <span>
        <Chip
          label={
            <span
              ref={textRef}
              style={{
                display: 'block',
                overflow: 'hidden',
                padding: 0,
                textAlign: 'left',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {label}
            </span>
          }
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          sx={{ ...props?.sx, padding: 0 }}
          {...props}
        />
      </span>
    </Tooltip>
  );
};
