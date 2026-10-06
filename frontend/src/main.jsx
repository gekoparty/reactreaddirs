import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root'));
const theme = createTheme({
  palette: {
    primary: {
      main: "#1f6f4a",
      dark: "#154d34",
      light: "#d9efe5",
    },
    secondary: {
      main: "#b7791f",
    },
    background: {
      default: "#f5f7f3",
      paper: "#ffffff",
    },
    text: {
      primary: "#172033",
      secondary: "#5c677a",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
