import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
      <div className="min-h-screen bg-[#061d19] flex flex-col items-center justify-center p-4">
        <div className="bg-[#072420] p-8 rounded-2xl border border-teal-800/50 shadow-2xl shadow-black/60 text-center max-w-md space-y-4">
          <h1 className="text-xl font-bold text-white">
            Access Denied
          </h1>
          <p className="text-xs text-[#8faea7]">
            Please log in as a Restaurant Manager to access this dashboard.
          </p>
          <button
            className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition shadow-md shadow-orange-950/40 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061d19] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 bg-[#072420]/95 backdrop-blur-md border-r border-teal-900/40 p-4 hidden md:block">
        <RestaurantSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#061d19] p-3 md:p-6 overflow-y-auto">
        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-2 bg-[#072420] border border-teal-800/40 rounded-2xl mb-4 scrollbar-none">
          {[
            { name: "Overview", value: "overview" },
            { name: "Orders", value: "orders" },
            { name: "Menu", value: "menu" },
            { name: "Settings", value: "settings" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.value
                  ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-sm shadow-orange-950/40"
                  : "bg-[#041916] text-[#8faea7] hover:text-white border border-teal-800/40"
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

