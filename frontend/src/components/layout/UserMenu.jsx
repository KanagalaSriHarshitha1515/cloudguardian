import { useState } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { LogOut, ChevronsUpDown } from "lucide-react";
import useAuth from "../../hooks/useAuth";

// Deliberately NOT using MUI's <Menu> here — it's built on a Modal with
// its own focus-trap/backdrop, which in this app was leaving an invisible
// layer over the page that swallowed all clicks after closing. This is a
// plain positioned div instead: no portal, no focus trap, nothing to leak.
export default function UserMenu({ collapsed = false }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CG";

  return (
    <Box position="relative">
      <Box
        onClick={() => setOpen((v) => !v)}
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "space-between"}
        gap={1}
        px={collapsed ? 0 : 1}
        py={1}
        borderRadius={2.5}
        sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
      >
        <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: "text.primary", color: "background.paper", fontSize: 12, fontWeight: 700 }}>
            {initials}
          </Avatar>
          {!collapsed && (
            <Box minWidth={0}>
              <Typography noWrap fontSize={13} fontWeight={600} lineHeight={1.3}>
                {user?.name || "Guest"}
              </Typography>
              <Typography noWrap fontSize={11.5} color="text.secondary" lineHeight={1.3} textTransform="capitalize">
                {user?.role || "user"} account
              </Typography>
            </Box>
          )}
        </Box>
        {!collapsed && <ChevronsUpDown size={14} color="var(--mui-palette-text-secondary, #6B7280)" />}
      </Box>

      {open && (
        <>
          {/* Invisible click-catcher — closes the dropdown on any outside
              click. Plain div, not an MUI Modal/Backdrop. */}
          <Box onClick={() => setOpen(false)} sx={{ position: "fixed", inset: 0, zIndex: 1200 }} />
          <Box
            sx={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              mb: 1,
              width: 200,
              zIndex: 1201,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2.5,
              boxShadow: (theme) => theme.customShadows?.soft,
              overflow: "hidden",
              py: 0.5,
            }}
          >
            <Box
              onClick={() => {
                setOpen(false);
                logout();
              }}
              display="flex"
              alignItems="center"
              gap={1.25}
              px={1.75}
              py={1.1}
              sx={{ cursor: "pointer", color: "error.main", "&:hover": { bgcolor: "action.hover" } }}
            >
              <LogOut size={15} />
              <Typography fontSize={13.5} fontWeight={500}>
                Log out
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}