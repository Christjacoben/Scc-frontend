import React from "react";
import "./Landing.css";
import Landing from "../assets/landing-page.jpg";
import Background from "../assets/background-landing.png";
import Landinglogo from "../assets/file.png";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const gotoLogin = () => {
    navigate("/login");
  };
  /*
  const gotoSignup = () => {
    navigate("/signup");
  };
*/
  const downloadApp = () => {
    const apkUrl = "/apk/app-release.apk";
    window.location.href = apkUrl;
  };

  return (
    <div className="landing-main">
      <div className="landing-content">
        <div className="landing-header">
          <ul>
            <img src={Landinglogo} alt="landind-logo" />
            <li className="app-link" onClick={downloadApp}>App</li>
            <li className="login-link" onClick={gotoLogin}>Login</li>
                {/*
            <li className="signup-link" onClick={gotoSignup}>Signup</li>
               */}
          </ul>
        </div>
        <div className="left-landing-con">
          <img src={Background} alt="background" />
        </div>
        <div className="right-landing-con">
          <img src={Landing} alt="landing" />
        </div>
        <div className="landing-text">
          <p>SSC EVENT ATTENDANCE </p>
          <p>MONITORING SYSTEM USING QR CODE </p>
          <p>WITH DATA VISUALIZATION</p>
          <p>A WEB AND MOBILE BASED APPLICATION</p>
        </div>
        <div className="get-landing">
          <button onClick={gotoLogin} className="btn">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
