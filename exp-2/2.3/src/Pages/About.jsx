import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

export default function About() {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">ℹ️ About Page</h2>

      <Stack spacing={2}>
        <Alert severity="success">Material UI Alert Working ✅</Alert>
        <Alert severity="info">This page uses Material UI components</Alert>
        <Alert severity="warning">You can mix Bootstrap + MUI together</Alert>
      </Stack>
    </div>
  );
}
