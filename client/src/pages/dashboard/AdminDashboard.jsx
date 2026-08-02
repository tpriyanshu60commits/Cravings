import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/adminDashboard/AdminSidebar";
import AdminOverview from "../../components/adminDashboard//AdminOverview";
import AdminOrders from "../../components/adminDashboard/AdminOrders";
import AdminSetting from "../../components/adminDashboard/AdminSettings";

const AdminDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  if (!isLogin || role !== "admin") {
    return (
      <>
        <div className="h-screen bg-gray-500 bg-cover bg-center">
          <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
            <h1 className="text-2xl font-bold text-(--color-neutral-content)">
              Access Denied. Please log in as a Restaurant Manager to view this
              page.
            </h1>
            <button
              className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-[91vh] flex gap-2 p-2">
        <div className="w-3/17 bg-(--color-base-200) p-4 rounded-lg shadow-md h-full">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="w-14/17 bg-(--color-base-100) p-4 rounded-lg shadow-md h-full">
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "settings" && <AdminSetting />}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
