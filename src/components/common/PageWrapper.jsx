import { Box, Paper } from "@mui/material";

export default function PageWrapper({
  children,
  type = "narrow",
  maxWidth: customMaxWidth,
  elevation = 1,
  sx = {},
}) {
  // type: "wide" for lists, "narrow" for forms/details
  const defaultMaxWidth =
    type === "wide"
      ? { xs: "100vw", sm: "100vw", md: "100vw", lg: "1800px" }
      : 1000;
  const maxWidth = customMaxWidth ?? defaultMaxWidth;

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Paper
        elevation={elevation}
        sx={{
          p: { xs: 2, md: 3 },
          width: "100%",
          maxWidth,
          mx: "auto",
          boxShadow: 1,
          ...sx,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
