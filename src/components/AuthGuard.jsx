// src/components/AuthGuard.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthGuard = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedRoles = Array.isArray(allowedRoles) ? allowedRoles : [];
  const roleListKey = normalizedRoles.join("|");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      navigate("/login", { replace: true });
      return;
    }

    const hasRoleAccess =
      !normalizedRoles.length || normalizedRoles.includes(role);

    if (!hasRoleAccess) {
      navigate("/forbidden", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [navigate, allowedRoles, roleListKey, location.pathname]);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const hasRoleAccess =
    !normalizedRoles.length || normalizedRoles.includes(role);

  if (!token || !role || !hasRoleAccess) {
    return null;
  }

  return children;
};

export default AuthGuard;
