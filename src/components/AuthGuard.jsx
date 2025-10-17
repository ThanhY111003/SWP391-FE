// src/components/AuthGuard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || !role) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (!token || !role) {
    return null; // Don't render anything while redirecting
  }

  return children;
};

export default AuthGuard;
