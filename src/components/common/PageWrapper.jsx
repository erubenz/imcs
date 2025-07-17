import { Box, Paper } from "@mui/material";

export default function PageWrapper({ children, type = "narrow" }) {
  // type: "wide" for lists, "narrow" for forms/details
  const maxWidth =
    type === "wide"
      ? { xs: "100vw", sm: "100vw", md: "100vw", lg: "1800px" }
      : 1000;
  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, md: 3 },
          width: "100%",
          maxWidth,
          mx: "auto",
          boxShadow: 1,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
