import { Button as MuiButton } from "@mui/material";

// Thin wrapper so every button in the app gets the same brand styling
// (gradient fill, no uppercase transform, rounded) without repeating sx{}.
export default function Button({ children, variant = "contained", ...rest }) {
  return (
    <MuiButton
      variant={variant}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: 3,
        ...(variant === "contained" && { background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }),
      }}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}
