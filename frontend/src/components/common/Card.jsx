import { Paper } from "@mui/material";

export default function Card({ children, sx, hover = false, ...rest }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        p: 3,
        transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
        ...(hover && {
          cursor: "pointer",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: (theme) => theme.customShadows?.soft,
            transform: "translateY(-2px)",
          },
        }),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
}