import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PasswordChangeModal from "./components/commonModals/PasswordChangeModal";
import ForgotPasswordModal from "./components/commonModals/ForgotPasswordModal";
import RestaurantDashboard from "./pages/dashboard/RestaurantDashboard";
import RiderDashboard from "./pages/dashboard/RiderDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
// import RestaurantSettings from "./components/restaurantDashboard/RestaurantSettings";

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/passwordChangeModal" element={<PasswordChangeModal />} />
        <Route path="/forgotPasswordModal" element={<ForgotPasswordModal />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/rider-dashboard" element={<RiderDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* <Route path="/restaurant-setting" element={<RestaurantSettings />} /> */}
      </Routes>
    </>
  );
};

export default App;
