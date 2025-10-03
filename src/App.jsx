import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import LoginPage from "./Page/Login";
import RegisterPage from "./Page/Register";
import ServiceWebsite from "./Page/Home";
import Dashboard from "./components/dashboard";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function App() {
  const ProtectRouteAuth = ({ children }) => {
    const user = useSelector((store) => store);
    console.log(user);
    if (user && user?.role == "ADMIN") {
      return children;
    }
    toast.error("You are not allowed to access this");
    return <Navigate to={"/login"} />;
  };

  const router = createBrowserRouter([
    {
      path: "",
      element: <ServiceWebsite />,
    },

    {
      path: "login",
      element: <LoginPage />,
    },

    {
      path: "register",
      element: <RegisterPage />,
    },
    {
      path: "dashboard",
      element: (
        <ProtectRouteAuth>
          <Dashboard />
        </ProtectRouteAuth>
      ),
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
