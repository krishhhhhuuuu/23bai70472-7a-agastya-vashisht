import { Box, Typography, Button } from "@mui/material";

export default function HeroSection() {
  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "white",
        textAlign: "center",
      }}
    >
      <Typography variant="h3" fontWeight="bold">
        StartupX Platform
      </Typography>

      <Typography sx={{ mt: 2, maxWidth: 600 }}>
        A modern React Single Page Application using Bootstrap, Material UI and
        React Router.
      </Typography>

      <Button variant="contained" sx={{ mt: 3 }}>
        Get Started
      </Button>
    </Box>
  );
}
