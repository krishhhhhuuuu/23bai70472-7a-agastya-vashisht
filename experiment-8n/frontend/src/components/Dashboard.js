import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState("");
  const [error, setError] = useState("");
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
      const res = await axios.get("http://localhost:8080/protected", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      setData(res.data);
      setError("");
    } catch (err) {
      setError("Unauthorized or server error ❌");
      setData("");
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

      <button className="btn btn-success me-2" onClick={getData}>
        Fetch Data
      </button>

      <button className="btn btn-danger" onClick={logout}>
        Logout
      </button>

      {/* ✅ Success */}
      {data && <p className="mt-3 text-success">{data}</p>}

      {/* ❌ Error */}
      {error && <p className="mt-3 text-danger">{error}</p>}
    </div>
  );
}

export default Dashboard;