import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',      
      light: '#818cf8',
      dark: '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',      
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',  
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',  
      secondary: '#6b7280', 
      disabled: '#d1d5db', 
    },
    error: {
      main: '#ef4444',     
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',    
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6',    
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',   
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
  },    
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", sans-serif',
    h1: {
      color: '#111827',    
      fontWeight: 700,
    },
    h2: {
      color: '#111827',
      fontWeight: 600,
    },
    h3: {
      color: '#111827',
      fontWeight: 600,
    },
    h4: {
      color: '#1f2937',
      fontWeight: 600,
    },
    h5: {
      color: '#1f2937',
      fontWeight: 500,
    },
    h6: {
      color: '#374151',
      fontWeight: 500,
    },
    body1: {
      color: '#374151',     // Softer than headers
      lineHeight: 1.6,
    },
    body2: {
      color: '#6b7280',     // Muted body text
      lineHeight: 1.5,
    },
    caption: {
      color: '#9ca3af',     // Light caption text
    },
    overline: {
      color: '#9ca3af',
      letterSpacing: '0.1em',
    },
  },
});


export const ANIMATION_DURATION = 300;

export default theme;
