import { Box, InputBase, IconButton, Badge } from "@mui/material";
import { Search, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";

// NOTE: this is a simple pathname->title lookup. It won't show a
// per-project title (e.g. "Payments Service — Containers") out of the
// box — that would need each page to set a title via context or a
// small useDocumentTitle-style hook. Left simple here on purpose;
// flagged in the README as an easy next improvement.
const titles = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/settings": "Settings",
};

export default function Topbar() {
  const location = useLocation();
  const title = titles[location.pathname] || "CloudGuardian";

  return (
    <Box
      component="header"
      height={64}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={3}
      borderBottom="1px solid"
      borderColor="divider"
      bgcolor="background.paper"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Box fontWeight={700} fontSize={17}>
        {title}
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Box display="flex" alignItems="center" gap={1} bgcolor="action.hover" borderRadius={3} px={1.5} py={0.8} width={260}>
          <Search size={15} />
          <InputBase placeholder="Search…" sx={{ fontSize: 13, width: "100%" }} />
        </Box>
        <IconButton size="small">
          <Badge color="error" variant="dot">
            <Bell size={18} />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  );
}
