import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

export default function MyAlert() {
  return (
    <Stack spacing={2}>
      <Alert severity="success">This is a success alert!</Alert>
      <Alert severity="info">This is an info alert!</Alert>
      <Alert severity="warning">This is a warning alert!</Alert>
      <Alert severity="error">This is an error alert!</Alert>
    </Stack>
  );
}
