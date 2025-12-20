'use client';

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export const ThemeToggleButton: React.FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/settings/theme');
  };

  return (
    <Tooltip title="Theme Settings" arrow>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <PaletteIcon />
      </IconButton>
    </Tooltip>
  );
};
