import { useState } from "react";
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
      <div className="min-h-screen bg-[#061d19] flex flex-col items-center justify-center p-4">
        <div className="bg-[#072420] p-8 rounded-2xl border border-teal-800/50 shadow-2xl text-center max-w-md space-y-4">
          <h1 className="text-xl font-bold text-white">
            Access Denied
          </h1>
          <p className="text-xs text-[#8faea7]">
            Please log in as an Admin to access this dashboard.
          </p>
          <button
            className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
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
    <div className="min-h-screen bg-[#061d19] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 bg-[#072420]/95 backdrop-blur-md border-r border-teal-900/40 p-4 hidden md:block">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => handleTabChange(tab, "all")}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#061d19] p-3 md:p-6 overflow-y-auto">
        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-2 bg-[#072420] border border-teal-800/40 rounded-2xl mb-4 scrollbar-none">
          {mobileTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value, "all")}
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
