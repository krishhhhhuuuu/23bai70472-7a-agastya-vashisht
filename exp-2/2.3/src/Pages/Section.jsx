import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

export default function Section() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Updated Count:", count);
  }, [count]);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">📌 Contact Page</h2>

      <Alert severity="warning" className="mb-3">
        Open Console to see updated count ✅
      </Alert>

      <Typography variant="h5">Number of digits: {count}</Typography>

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => setCount(count + 1)}
      >
        Click to Add Digit
      </Button>
    </div>
  );
}
