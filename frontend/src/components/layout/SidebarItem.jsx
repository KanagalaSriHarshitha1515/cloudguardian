import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

// Monochrome by default — icon/text are just muted gray. Only the
// active route gets color (a soft tinted pill background + primary text),
// instead of every nav item carrying its own pastel icon chip.
export default function SidebarItem({ to, icon: Icon, label, collapsed = false }) {
  const location = useLocation();
  const active = location.pathname === to;

  const button = (
    <ListItemButton
      component={NavLink}
      to={to}
      sx={{
        mb: 0.25,
        borderRadius: 2.5,
        px: collapsed ? 1.5 : 1.75,
        py: 1,
        justifyContent: collapsed ? "center" : "flex-start",
        bgcolor: active ? "action.selected" : "transparent",
        "&:hover": { bgcolor: active ? "action.selected" : "action.hover" },
      }}
    >
      <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, color: active ? "primary.main" : "text.secondary" }}>
        <Icon size={18} strokeWidth={active ? 2.4 : 2} />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={label}
          primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? "primary.main" : "text.primary" }}
        />
      )}
    </ListItemButton>
  );

  return collapsed ? (
    <Tooltip title={label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}
