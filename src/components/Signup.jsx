import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchUsers } from "../store/userSlice";
import SignupLogo from "../assets/file.png";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [selectedPosition, setSelectedPosition] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
    course: "",
    year: "",
    age: "",
    studentId: "",
    gender: "",
    role: "user",
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (users.length > 0) {
      const adminUser = users.find((user) => user.role === "admin");
      if (adminUser) {
        setAdminExists(true);
      }
      console.log("Fetch users", users);
    }
  }, [users]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handlePositionChange = (event) => {
    const { value } = event.target;
    setSelectedPosition(value);
    setFormData({ ...formData, gender: value });
  };

  const handleRoleChange = (event) => {
    const { value } = event.target;
    setIsAdmin(value === "admin");
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("https://ssc-backend.onrender.com/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          toast.success("Success: " + data.message, {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true,
          });
          navigate("/login");
          resetForm();
        } else {
          toast.error("Error: " + data.error, {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      fullname: "",
      course: "",
      year: "",
      age: "",
      studentId: "",
      gender: "",
      role: "user",
    });
    setSelectedPosition("");
    setIsAdmin(false);
  };

  return (
    <div className="maincon">
      <div className="formmain">
        <form className="form-con" onSubmit={handleSubmit}>
          <img src={SignupLogo} alt="SignupLogo" />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={(e) => handleInputChange("fullname", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            required
          />
          <select
            value={selectedPosition}
            onChange={handlePositionChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {!isAdmin && (
            <>
              <input
                type="text"
                placeholder="Course"
                value={formData.course}
                onChange={(e) => handleInputChange("course", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Year"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Student ID Number"
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                required
              />
            </>
          )}

          <div className="radio">
            <label>
              <input
                type="radio"
                value="user"
                checked={!isAdmin}
                onChange={handleRoleChange}
              />
              User
            </label>
            {!adminExists && (
              <label>
                <input
                  type="radio"
                  value="admin"
                  checked={isAdmin}
                  onChange={handleRoleChange}
                />
                Admin
              </label>
            )}
          </div>
          <button className="butt" type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
