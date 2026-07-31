import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PasswordChangeModal from "./components/commonModals/PasswordChangeModal";
import ForgotPasswordModal from "./components/commonModals/ForgotPasswordModal";
import RestaurantDashboard from "./pages/dashboard/RestaurantDashboard";
const App = () => {
  return (
    <>
    <Toaster/>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/passwordChangeModal" element={<PasswordChangeModal/>}/>
        <Route path="/forgotPasswordModal" element={<ForgotPasswordModal/>}/>
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard/>}/>
      </Routes>
    </>
  );
};

export default App;
