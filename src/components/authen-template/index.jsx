import React from "react";
import "./index.css";
function AuthenTemplate({ children }) {
  return (
    <div className="authen-template">
      <div className="authen-card">
        <div className="authen-card__left">
          <div className="brand">
            <span className="brand__logo">SWP</span>
            <span className="brand__name">ServiceWorks</span>
          </div>
          <p className="brand__tagline">Simplify your daily services with confidence.</p>
        </div>
        <div className="authen-card__right">
          <div className="authen-template__form">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthenTemplate;
