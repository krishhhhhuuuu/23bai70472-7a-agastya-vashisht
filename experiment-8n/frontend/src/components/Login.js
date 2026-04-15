import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password
      });

      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
      alert("Login Failed ❌");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>

      <input
        className="form-control"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      /><br/>

      <input
        type="password"
        className="form-control"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br/>

      <button className="btn btn-primary" onClick={login}>
        Login
      </button>
    </div>
  );
}

export default Login;