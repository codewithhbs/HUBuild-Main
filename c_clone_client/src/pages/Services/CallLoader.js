import React from "react";
import "./CallLoader.css"; // Import the custom CSS file

const CallLoader = () => {
  return (
    <div className="call-loader-container">
      {/* Loader Animation */}
      <div className="loader"></div>

      {/* Message */}
      <p className="call-message">
        ✅ Call Initiated Successfully! <br />
        📞 You will receive a call in <span className="highlight">10 to 15 seconds</span>.
      </p>
    </div>
  );
};

export default CallLoader;
