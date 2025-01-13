import React from "react";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();

  const handleLogoutUser = () => {
    fetch("https://ssc-backend.onrender.com/api/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          navigate("/");
        } else {
          console.error("Failed to log out");
        }
      })
      .catch((error) => {
        console.error("Error", error);
      });
  };

  return (
    <div>
      <p>hello this is user</p>
      <button onClick={handleLogoutUser}>logout</button>
    </div>
  );
}

export default UserDashboard;
