import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ContactPage from "./pages/ContactPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import PasswordChangeModal from "./components/commonModals/PasswordChangeModal";
import ForgotPasswordModal from "./components/commonModals/ForgotPasswordModal";
import RestaurantDashboard from "./pages/dashboard/RestaurantDashboard";
import RiderDashboard from "./pages/dashboard/RiderDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import OrderNow from "./pages/OrderNow";
import RestaurantDetailsPage from "./pages/RestaurantDetailsPage";
import Cart from "./components/Cart";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Route Guards
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

const App = () => {
  return (
    <>
      <Toaster />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/order-now" element={<OrderNow />} />
        <Route
          path="/restaurant-details/:restaurantId"
          element={<RestaurantDetailsPage />}
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/forgotPasswordModal" element={<ForgotPasswordModal />} />

        {/* Guest Only Routes (logged in users are redirected to their dashboard) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
        </Route>

        {/* Restaurant Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["restaurant"]} />}>
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        </Route>

        {/* Rider Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["rider"]} />}>
          <Route path="/rider-dashboard" element={<RiderDashboard />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Authenticated Common Modals */}
        <Route element={<ProtectedRoute />}>
          <Route path="/passwordChangeModal" element={<PasswordChangeModal />} />
        </Route>

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
