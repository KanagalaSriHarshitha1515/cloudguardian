import { Box, Typography } from "@mui/material";

// Used everywhere a list can legitimately be empty — most importantly,
// this is what a Docker resource page (Containers/Images/...) shows
// instead of an empty table when no host is connected yet.
export default function EmptyState({ icon, title, description, action }) {
  return (
    <Box textAlign="center" py={8} px={3}>
      {icon}
      <Typography variant="h6" fontWeight={700} mt={2}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5} mb={3}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}
