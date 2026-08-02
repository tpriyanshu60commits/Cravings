import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import CustomerSidebar from "../../components/customerDashboard/CustomerSidebar";
import CustomerOverview from "../../components/customerDashboard/CustomerOverview";
import CustomerOrders from "../../components/customerDashboard/CustomerOrders";
import CustomerSetting from "../../components/customerDashboard/CustomerSetting";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { isLogin, role } = useAuth();

  const [activeTab, setActiveTab] = useState("settings");

  if (!isLogin || role !== "customer") {
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
      <div className="h-screen flex">
        <div className="w-1/4 border">
          <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="w-3/4 border">
          {activeTab === "overview" && <CustomerOverview />}
          {activeTab === "orders" && <CustomerOrders />}
          {activeTab === "settings" && <CustomerSetting />}
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
