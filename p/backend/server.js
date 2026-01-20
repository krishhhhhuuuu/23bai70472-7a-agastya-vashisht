const express = require("express");
const app = express();

app.get("/api/data", (req, res) => {
  res.json({
    message: "Hello from backend",
    count: 10
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
