import React from "react";
import axios from "axios";

function UserDashboard() {
  const username = sessionStorage.getItem("user");
  const password = sessionStorage.getItem("password");
  const role = sessionStorage.getItem("role");

  if (!role) {
    window.location.href = "/";
    return null;
  }

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/user/profile", {
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
      <h2>User Dashboard</h2>

      <button className="btn btn-success me-2" onClick={fetchData}>
        Get Profile
      </button>

      {/* USER cannot see admin button */}
      {role === "ADMIN" && (
        <button className="btn btn-danger">Admin Panel</button>
      )}

      <br/><br/>

      <button className="btn btn-secondary" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default UserDashboard;