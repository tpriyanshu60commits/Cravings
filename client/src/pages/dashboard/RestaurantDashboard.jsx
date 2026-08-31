import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import RestaurantSidebar from "../../components/restaurantDashboard/RestaurantSidebar";
import RestaurantOrders from "../../components/restaurantDashboard/RestaurantOrders";
import RestaurantSettings from "../../components/restaurantDashboard/RestaurantSettings";
import RestaurantOverview from "../../components/restaurantDashboard/RestaurantOverview";
import RestaurantMenu from "../../components/restaurantDashboard/RestaurantMenu";
const RestaurantDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isLogin || role !== "restaurant") {
    return (
      <div className="min-h-screen bg-(--color-base-200) flex flex-col items-center justify-center p-4">
        <div className="bg-(--color-base-100) p-8 rounded-2xl border border-(--color-base-300) shadow-lg text-center max-w-md space-y-4">
          <h1 className="text-xl font-bold text-(--color-base-content)">
            Access Denied
          </h1>
          <p className="text-xs text-(--color-secondary)">
            Please log in as a Restaurant Manager to access this dashboard.
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

  return (
    <div className="min-h-screen bg-(--color-base-200) flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 bg-(--color-base-100) border-r border-(--color-base-300) p-4 hidden md:block">
        <RestaurantSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-(--color-base-200) p-3 md:p-6 overflow-y-auto">
        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-3 bg-(--color-base-100) border-b border-(--color-base-300) rounded-xl mb-4">
          {[
            { name: "Overview", value: "overview" },
            { name: "Orders", value: "orders" },
            { name: "Menu", value: "menu" },
            { name: "Settings", value: "settings" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
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
          <RestaurantOverview setActiveTab={setActiveTab} />
        )}
        {activeTab === "orders" && <RestaurantOrders />}
        {activeTab === "menu" && <RestaurantMenu />}
        {activeTab === "settings" && <RestaurantSettings />}
      </main>
    </div>
  );
};

export default RestaurantDashboard;
