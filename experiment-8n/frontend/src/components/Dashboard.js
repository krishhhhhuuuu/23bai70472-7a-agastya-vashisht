import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState("");
  const token = sessionStorage.getItem("token");

  // 🔐 Protect route
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  // 📡 Fetch protected data
  const getData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/protected", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setData(
        typeof res.data === "object"
          ? JSON.stringify(res.data)
          : res.data
      );

    } catch (err) {
      console.error(err);
      alert("Unauthorized ❌ or Server Error");
    }
  };

  // 🚪 Logout
  const logout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>

      <h5 className="mb-3">Welcome User 👋</h5>

      <button className="btn btn-success me-2" onClick={getData}>
        Fetch Data
      </button>

      <button className="btn btn-danger" onClick={logout}>
        Logout
      </button>

      <div className="mt-3">
        <strong>Response:</strong>
        <p>{data}</p>
      </div>
    </div>
  );
}

export default Dashboard;