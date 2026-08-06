import React from "react";
import { useState } from "react";
import api from "../../config/ApiConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RiderOrders from "../../components/riderDashboard/RiderOrders";
import RiderOverview from "../../components/riderDashboard/RiderOverview";
import RiderSettings from "../../components/riderDashboard/RiderSettings";
import RiderSidebar from "../../components/riderDashboard/RiderSidebar";

const RiderDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");

  if (!isLogin || role !== "rider") {
    return (
      <>
        <div className="h-screen bg-gray-600 bg-cover bg-center">
          <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-(--color-neutral-content)">
              Access Denied. Please log in as a Restaurant Manager to view this
              page.
            </h1>
            <button
              className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md"
              onClick={() => navigate("/login")}
            >
              Go To Login
            </button>
          </div>
        </div>
      </>   
    );
  }
  return (
    <>
      <div className="h-screen flex">
        <div className="w-1/5 border">
          <RiderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="w-4/5 border">
          {activeTab === "overview" && <RiderOverview />}
          {activeTab === "orders" && <RiderOrders />}
          {activeTab === "settings" && <RiderSettings />}
        </div>
      </div>
    </>
  );
};

export default RiderDashboard;
