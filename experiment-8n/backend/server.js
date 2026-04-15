const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "mysecretkey";

// Dummy user (for testing)
const USER = {
  username: "admin",
  password: "1234"
};

// 🔐 LOGIN API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    return res.json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// 🔒 PROTECTED API
app.get("/protected", (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.json("🎉 Protected data accessed successfully!");
  });
});

// 🚀 START SERVER
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});