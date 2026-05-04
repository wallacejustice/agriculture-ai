import React from 'react';
import { IconButton, useTheme, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

// ✅ STANDALONE THEME TOGGLE (no external dependencies)
const ThemeToggle = () => {
  const theme = useTheme();
  const [mode, setMode] = React.useState(() => 
    localStorage.getItem('themeMode') || 'light'
  );

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

  return (
    <Tooltip 
      title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      placement="left"
      arrow
    >
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[4],
          '&:hover': {
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
          },
          transition: 'all 0.3s ease',
        }}
        aria-label="Toggle theme"
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;