import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/adminDashboard/AdminSidebar";
import AdminOverview from "../../components/adminDashboard/AdminOverview";
import AdminCustomers from "../../components/adminDashboard/AdminCustomers";
import AdminRestaurants from "../../components/adminDashboard/AdminRestaurants";
import AdminRiders from "../../components/adminDashboard/AdminRiders";
import AdminOrders from "../../components/adminDashboard/AdminOrders";
import AdminSetting from "../../components/adminDashboard/AdminSettings";

const AdminDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [tabFilter, setTabFilter] = useState("all");

  if (!isLogin || role !== "admin") {
    return (
      <div className="min-h-screen bg-(--color-base-200) flex flex-col items-center justify-center p-4">
        <div className="bg-(--color-base-100) p-8 rounded-2xl border border-(--color-base-300) shadow-lg text-center max-w-md space-y-4">
          <h1 className="text-xl font-bold text-(--color-base-content)">
            Access Denied
          </h1>
          <p className="text-xs text-(--color-secondary)">
            Please log in as an Admin to access this dashboard.
          </p>
          <button
            className="px-5 py-2.5 bg-(--color-primary) text-(--color-primary-content) text-xs font-semibold rounded-xl hover:opacity-90 transition"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab, filter = "all") => {
    setTabFilter(filter);
    setActiveTab(tab);
  };

  const mobileTabs = [
    { name: "Overview", value: "overview" },
    { name: "Customers", value: "customers" },
    { name: "Restaurants", value: "restaurants" },
    { name: "Riders", value: "riders" },
    { name: "Orders", value: "orders" },
    { name: "Settings", value: "settings" },
  ];

  return (
    <div className="min-h-screen bg-(--color-base-200) flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 bg-(--color-base-100) border-r border-(--color-base-300) p-4 hidden md:block">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => handleTabChange(tab, "all")}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-(--color-base-200) p-3 md:p-6 overflow-y-auto">
        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-3 bg-(--color-base-100) border-b border-(--color-base-300) rounded-xl mb-4 scrollbar-thin">
          {mobileTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value, "all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.value
                  ? "bg-(--color-primary) text-(--color-primary-content)"
                  : "bg-(--color-base-200) text-(--color-base-content)"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <AdminOverview
            setActiveTab={handleTabChange}
            setTabWithFilter={handleTabChange}
          />
        )}
        {activeTab === "customers" && (
          <AdminCustomers initialFilter={tabFilter} />
        )}
        {activeTab === "restaurants" && (
          <AdminRestaurants initialFilter={tabFilter} />
        )}
        {activeTab === "riders" && (
          <AdminRiders initialFilter={tabFilter} />
        )}
        {activeTab === "orders" && (
          <AdminOrders initialFilter={tabFilter} />
        )}
        {activeTab === "settings" && <AdminSetting />}
      </main>
    </div>
  );
};

export default AdminDashboard;
