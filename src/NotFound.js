import React from "react";
import { Box, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography>The page you are looking for does not exist.</Typography>
    </Box>
  );
}
