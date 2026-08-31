import { useState } from "react";
import CustomerSidebar from "../../components/customerDashboard/CustomerSidebar";
import CustomerOverview from "../../components/customerDashboard/CustomerOverview";
import CustomerOrders from "../../components/customerDashboard/CustomerOrders";
import CustomerAddressBook from "../../components/customerDashboard/CustomerAddressBook";
import CustomerSetting from "../../components/customerDashboard/CustomerSetting";

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-(--color-base-200) flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-(--color-base-100) border-r border-(--color-base-300) p-4 hidden md:block">
        <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-(--color-base-200)">
        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-3 bg-(--color-base-100) border-b border-(--color-base-300)">
          {[
            { name: "Overview", value: "overview" },
            { name: "Orders", value: "orders" },
            { name: "Addresses", value: "address-book" },
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
