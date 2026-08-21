import { Typography } from "@mui/material";
import Card from "../common/Card";

// Small stat tile used atop the Containers page (Total / Running / Stopped).
export default function ContainerCard({ label, value, color = "text.primary" }) {
  return (
    <Card sx={{ flex: 1, minWidth: 140 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800} color={color}>
        {value}
      </Typography>
    </Card>
  );
}
