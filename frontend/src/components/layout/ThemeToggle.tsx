import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material';
import { useThemeContext } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        sx={{
          p: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'rotate(30deg)',
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {mode === 'light' ? (
          <DarkIcon />
        ) : (
          <LightIcon sx={{ color: theme.palette.warning.light }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
