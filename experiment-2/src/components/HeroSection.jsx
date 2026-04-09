import { Box, Button, Typography } from "@mui/material";

export default function HeroSection() {
  return (
    <Box
      id="home"
      sx={{
        width: "100vw",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "white",
      }}
    >
      <Typography variant="h2" fontWeight="bold">
        Build Your Dream Project 🚀
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mt: 2,
          maxWidth: 700,
          opacity: 0.85,
        }}
      >
        A modern, responsive React landing page using Bootstrap + Material UI
        components.
      </Typography>

      <Button
        variant="contained"
        sx={{
          mt: 4,
          px: 5,
          py: 1.3,
          fontWeight: "bold",
          borderRadius: "10px",
        }}
      >
        GET STARTED
      </Button>
    </Box>
  );
}
