import { Box, Typography } from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { Outlet } from "react-router-dom";

// Shared shell for Login/Register — kept deliberately separate from
// DashboardLayout since it has no sidebar/topbar, just a centered card.
export default function AuthLayout() {
  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default" px={2}>
      <Box width="100%" maxWidth={380}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1.2} mb={4}>
          <Box
            width={40}
            height={40}
            borderRadius={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 8px 18px rgba(99,102,241,.28)" }}
          >
            <ShieldRoundedIcon sx={{ color: "#fff" }} />
          </Box>
          <Typography fontWeight={800} fontSize={20}>
            CloudGuardian
          </Typography>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
