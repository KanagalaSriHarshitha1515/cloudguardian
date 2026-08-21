import { Typography } from "@mui/material";
import Card from "../common/Card";

export default function ImageCard({ label, value }) {
  return (
    <Card sx={{ flex: 1, minWidth: 140 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800}>
        {value}
      </Typography>
    </Card>
  );
}
