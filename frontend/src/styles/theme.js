import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";
import { typography } from "./typography";

const softShadow = (mode) =>
  mode === "dark" ? "0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.35)" : "0 1px 2px rgba(15,23,42,.03), 0 8px 24px rgba(15,23,42,.05)";

// Neutral, mostly-monochrome palette — accent color (indigo/purple) is
// now reserved for the logo, primary buttons, and the active nav state,
// instead of being spread across pastel icon chips everywhere.
export function getTheme(mode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },
      success: { main: colors.success },
      error: { main: colors.danger },
      warning: { main: colors.warning },
      info: { main: colors.info },
      divider: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
      background: {
        default: isDark ? "#111113" : "#FFFFFF",
        paper: isDark ? "#18181B" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#F4F4F5" : "#18181B",
        secondary: isDark ? "#A1A1AA" : "#6B7280",
      },
      action: {
        hover: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)",
        selected: isDark ? "rgba(99,102,241,0.16)" : "rgba(99,102,241,0.08)",
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: typography.fontFamily,
      h4: { fontFamily: typography.displayFontFamily, fontWeight: 700, letterSpacing: -0.3, fontSize: "1.5rem" },
      h5: { fontFamily: typography.displayFontFamily, fontWeight: 700, letterSpacing: -0.25, fontSize: "1.15rem" },
      h6: { fontFamily: typography.displayFontFamily, fontWeight: 700, letterSpacing: -0.15, fontSize: "1rem" },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiCssBaseline: {
        styleOverrides: {
          body: { transition: "background-color .2s ease" },
          "*": { scrollbarWidth: "thin" },
          "::-webkit-scrollbar": { width: 8, height: 8 },
          "::-webkit-scrollbar-thumb": { background: isDark ? "rgba(255,255,255,.15)" : "rgba(15,23,42,.12)", borderRadius: 8 },
          "::-webkit-scrollbar-track": { background: "transparent" },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, paddingLeft: 16, paddingRight: 16, transition: "transform .15s ease, box-shadow .15s ease" },
          containedPrimary: {
            backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: "0 6px 16px rgba(99,102,241,.24)",
            "&:hover": { boxShadow: "0 8px 22px rgba(99,102,241,.36)", transform: "translateY(-1px)" },
          },
        },
      },
      MuiMenu: { styleOverrides: { paper: { boxShadow: softShadow(mode), borderRadius: 12, border: "1px solid", borderColor: isDark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.06)" } } },
      MuiTableCell: { styleOverrides: { root: { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)" } } },
    },
    customShadows: { soft: softShadow(mode) },
  });
}