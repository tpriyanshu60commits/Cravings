import { useState } from "react";
import CustomerSidebar from "../../components/customerDashboard/CustomerSidebar";
import CustomerOverview from "../../components/customerDashboard/CustomerOverview";
import CustomerOrders from "../../components/customerDashboard/CustomerOrders";
import CustomerAddressBook from "../../components/customerDashboard/CustomerAddressBook";
import CustomerSetting from "../../components/customerDashboard/CustomerSetting";

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-[#061d19] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#072420]/95 backdrop-blur-md border-r border-teal-900/40 p-4 hidden md:block">
        <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#061d19] p-3 md:p-6 overflow-y-auto">
        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-2 bg-[#072420] border border-teal-800/40 rounded-2xl mb-4 scrollbar-none">
          {[
            { name: "Overview", value: "overview" },
            { name: "Orders", value: "orders" },
            { name: "Addresses", value: "address-book" },
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
          <CustomerOverview setActiveTab={setActiveTab} />
        )}
        {activeTab === "orders" && <CustomerOrders />}
        {activeTab === "address-book" && <CustomerAddressBook />}
        {activeTab === "settings" && <CustomerSetting />}
      </main>
    </div>
  );
};

export default CustomerDashboard;
