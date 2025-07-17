import { Typography } from "@mui/material";

export default function SectionTitle({ children }) {
  return <Typography variant="h5" sx={{ mb: 2 }}>{children}</Typography>;
}
