import { Box, Typography, IconButton } from "@mui/material";
import { X } from "lucide-react";

// Plain manual overlay — deliberately not MUI's Dialog, which (like Menu)
// is built on a Modal with its own focus-trap/backdrop. See UserMenu.jsx
// for the full story on why that pattern was dropped app-wide.
export default function Modal({ open, onClose, title, children, width = 440 }) {
  if (!open) return null;

  return (
    <Box
      onClick={onClose}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        bgcolor: "rgba(0,0,0,.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width,
          maxWidth: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          boxShadow: (theme) => theme.customShadows?.soft,
          p: 3,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography fontWeight={700} fontSize={16}>
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </Box>
        {children}
      </Box>
    </Box>
  );
}