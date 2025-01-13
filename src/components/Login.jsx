import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import { useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import "./Login.css";
import Logo from "../assets/file.png";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(true);
    fetch("http://localhost:5000/api/login", {
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
          <a className="link" href="signup" onClick={handleClickMe}>
            Sign up
          </a>
        </form>
      </div>
    </div>
  );
}

export default Login;
