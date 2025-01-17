import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import UserDashboard from "./components/UserDashboard";
import LandingPage from "./components/LandingPage";
import Restric from "./components/Restric";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
           <Route exact path="/" element={<Restric />} />
          {/*
          <Route exact path="/" element={<LandingPage />} />
           */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/userdashboard" element={<UserDashboard />} />
        </Routes>
        <ToastContainer />
      </Router>
    </Provider>
  );
}

export default App;
