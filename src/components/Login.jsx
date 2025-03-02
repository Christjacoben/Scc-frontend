import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import "./Login.css";
import Logo from "../assets/file.png";
import { fetchUsers } from "../store/userSlice";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector((state) => state.users.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (users.length > 0) {
      const adminUser = users.find((user) => user.role === "admin");
      if (adminUser) {
        setAdminExists(true);
      }
    }
  }, [users]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(true);
    fetch("https://ssc-backend.onrender.com/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          toast.error("Error" + data.error, {
            position: "top-center",
          });
        } else {
          dispatch(login(data.user));
          toast.success("Login successful!", {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true,
          });
          if (data.user.role === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/userdashboard");
          }
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Error", error, {
          position: "top-center",
        });
      });
  };

  const handleClickMe = () => {
    navigate("/signup");
  };

  return (
    <div className="main-con">
      <div className="form-main">
        <form className="form" onSubmit={handleLogin}>
          <img className="logo" src={Logo} alt="logo" />
          <input
            className="text"
            type="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          <input
            className="text1"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>
          {!adminExists && (
            <a
              className="link"
              href="signup"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </a>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
