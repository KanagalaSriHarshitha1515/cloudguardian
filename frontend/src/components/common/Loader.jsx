import { Box, CircularProgress } from "@mui/material";

export default function Loader({ size = 32 }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={6}>
      <CircularProgress size={size} />
    </Box>
  );
}
