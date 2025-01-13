import React from "react";
import DashLeft from "../assets/left-dashhome-img.jpg";
import DashRight from "../assets/right-dashhome-img1.jpg";
import "../components/DashHome.css";

function DashHome() {
  return (
    <div>
      <div className="dashhome-bottom">
        <div className="dashhome-bottom-content">
          <img src={DashLeft} alt="DashLeft" className="dashhome-left" />
          <img src={DashRight} alt="DashRight" className="dashhome-right" />
          <p>SSC EVENT ATTENDANCE </p>
          <p>MONITORING SYSTEM USING QR CODE </p>
          <p>WITH DATA VISUALIZATION</p>
          <p>A WEB AND MOBILE BASED APPLICATION</p>
        </div>
      </div>
    </div>
  );
}

export default DashHome;
