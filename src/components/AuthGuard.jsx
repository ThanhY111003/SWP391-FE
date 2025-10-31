// src/components/AuthGuard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    console.log("AuthGuard - Token:", token ? "Present" : "Missing");
    console.log("AuthGuard - Role:", role || "Missing");
    
    if (!token || !role) {
      console.log("AuthGuard - Redirecting to login");
      navigate("/login");
      return;
    }
  }, [navigate]);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (!token || !role) {
    console.log("AuthGuard - Not rendering children, redirecting...");
    return null; // Don't render anything while redirecting
  }

  console.log("AuthGuard - Rendering children");
  return children;
};

export default AuthGuard;
