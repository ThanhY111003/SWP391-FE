import { useEffect } from "react";

const DebugAuth = () => {
  useEffect(() => {
    console.log("=== DEBUG AUTH ===");
    console.log("Token:", localStorage.getItem("token"));
    console.log("Role:", localStorage.getItem("role"));
    console.log("Username:", localStorage.getItem("username"));
    console.log("RefreshToken:", localStorage.getItem("refreshToken"));
    console.log("==================");
  }, []);

  return (
    // <div style={{
    //   position: 'fixed',
    //   bottom: '10px',
    //   right: '10px',
    //   background: 'rgba(0,0,0,0.8)',
    //   color: 'white',
    //   padding: '10px',
    //   borderRadius: '5px',
    //   fontSize: '12px',
    //   zIndex: 9999
    // }}>
    //   <div>Token: {localStorage.getItem('token') ? '✓' : '✗'}</div>
    //   <div>Role: {localStorage.getItem('role') || 'None'}</div>
    //   <div>Username: {localStorage.getItem('username') || 'None'}</div>
    // </div>
    <div></div>
  );
};

export default DebugAuth;
