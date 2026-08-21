import { Box, Typography, Switch, FormControlLabel } from "@mui/material";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";
import { useThemeContext } from "../../context/ThemeContext";

export default function Settings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();

  return (
    <Box maxWidth={480}>
      <Typography variant="h5" mb={3}>
        Settings
      </Typography>

      <Card sx={{ mb: 2 }}>
        <Typography fontWeight={700} mb={1}>
          Profile
        </Typography>
        <Typography color="text.secondary">{user?.name}</Typography>
        <Typography color="text.secondary">{user?.email}</Typography>
      </Card>

      <Card sx={{ mb: 2 }}>
        <FormControlLabel control={<Switch checked={darkMode} onChange={toggleDarkMode} />} label="Dark Mode" />
      </Card>

      <Button color="error" variant="outlined" onClick={logout}>
        Logout
      </Button>
    </Box>
  );
}
