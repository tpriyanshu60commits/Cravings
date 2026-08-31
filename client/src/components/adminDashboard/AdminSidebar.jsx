import React from "react";
import {
  MdDashboard,
  MdPeople,
  MdRestaurant,
  MdDeliveryDining,
} from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const mainTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard size={20} /> },
    { name: "Customers", value: "customers", icon: <MdPeople size={20} /> },
    { name: "Restaurants", value: "restaurants", icon: <MdRestaurant size={20} /> },
    { name: "Riders", value: "riders", icon: <MdDeliveryDining size={20} /> },
    { name: "Orders", value: "orders", icon: <FaShoppingCart size={18} /> },
  ];

  const settingsTab = {
    name: "Settings",
    value: "settings",
    icon: <IoMdSettings size={20} />,
  };

  const renderTab = (tab) => {
    const isActive = activeTab === tab.value;
    return (
      <button
        key={tab.value}
        onClick={() => setActiveTab(tab.value)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "bg-(--color-primary) text-(--color-primary-content) shadow-sm translate-x-1"
            : "text-(--color-base-content) hover:bg-(--color-base-200) hover:text-(--color-primary)"
        }`}
      >
        <span className={isActive ? "text-(--color-primary-content)" : "text-(--color-secondary)"}>
          {tab.icon}
        </span>
        <span>{tab.name}</span>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-(--color-secondary)">
            Admin Control
          </p>
        </div>
        <div className="space-y-1">
          {mainTabs.map((tab) => renderTab(tab))}
        </div>
      </div>

      <div className="pt-4 border-t border-(--color-base-300) space-y-1">
        {renderTab(settingsTab)}
      </div>
    </div>
  );
};

export default AdminSidebar;
