import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "../styles/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("cg_theme") === "dark");

  useEffect(() => {
    localStorage.setItem("cg_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const theme = useMemo(() => getTheme(darkMode ? "dark" : "light"), [darkMode]);
  const toggleDarkMode = () => setDarkMode((v) => !v);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline resets browser defaults AND repaints background/text
            color to match the current theme — this is the "CssBaseline" step
            from the architecture diagram. */}
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => useContext(ThemeContext);
