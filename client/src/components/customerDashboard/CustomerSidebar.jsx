import React from "react";
import { useAuth } from "../../context/AuthContext";
import { MdDashboard, MdOutlineLocationOn } from "react-icons/md";
import { IoReceiptOutline, IoSettingsOutline, IoPersonOutline } from "react-icons/io5";

const CustomerSidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const mainTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard /> },
    { name: "My Orders", value: "orders", icon: <IoReceiptOutline /> },
    { name: "Address Book", value: "address-book", icon: <MdOutlineLocationOn /> },
  ];

  const settingsTab = {
    name: "Settings",
    value: "settings",
    icon: <IoSettingsOutline />,
  };

  const renderTab = (tab) => {
    const isActive = activeTab === tab.value;
    return (
      <li
        key={tab.value}
        onClick={() => setActiveTab(tab.value)}
        className={`cursor-pointer px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition ${
          isActive
            ? "bg-(--color-primary) text-(--color-primary-content) shadow-xs"
            : "text-(--color-base-content) hover:bg-(--color-base-200)"
        }`}
      >
        <span className="text-base">{tab.icon}</span>
        <span>{tab.name}</span>
      </li>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-6">
        {/* User Mini Profile Card */}
        <div className="p-3 bg-(--color-base-200) rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold text-sm shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase() || <IoPersonOutline />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-(--color-base-content) truncate">
              {user?.fullName || "Customer"}
            </h4>
            <p className="text-[10px] text-(--color-secondary) truncate">
              {user?.email || "customer@cravings.com"}
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <ul className="space-y-1.5">{mainTabs.map((tab) => renderTab(tab))}</ul>
      </div>

      <ul className="space-y-1.5 border-t border-(--color-base-300) pt-3">
        {renderTab(settingsTab)}
      </ul>
    </div>
  );
};

export default CustomerSidebar;
