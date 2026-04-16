import React from "react";
import axios from "axios";

function AdminDashboard() {
  const username = sessionStorage.getItem("user");
  const password = sessionStorage.getItem("password");
  const role = sessionStorage.getItem("role");

  if (role !== "ADMIN") {
    alert("Access Denied ❌");
    window.location.href = "/";
    return null;
  }

  const fetchAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/dashboard", {
        auth: {
          username,
          password
        }
      });

      alert(res.data.message);
    } catch {
      alert("Error ❌");
    }
  };

  const logout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>

      <button className="btn btn-danger me-2" onClick={fetchAdmin}>
        Admin Data
      </button>

      <button className="btn btn-secondary" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default AdminDashboard;