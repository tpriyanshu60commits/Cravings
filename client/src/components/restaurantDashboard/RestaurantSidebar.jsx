import React from "react";
import { MdDashboard, MdRestaurantMenu, MdOutlineReceiptLong } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { FaStore } from "react-icons/fa";

const RestaurantSidebar = ({ activeTab, setActiveTab }) => {
  const mainTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard size={20} /> },
    { name: "Orders", value: "orders", icon: <MdOutlineReceiptLong size={20} /> },
    { name: "Menu", value: "menu", icon: <MdRestaurantMenu size={20} /> },
  ];
  const settingsTab = {
    name: "Settings",
    value: "settings",
    icon: <IoMdSettings size={20} />,
  };

  const renderTab = (data) => {
    const isActive = activeTab === data.value;
    return (
      <li
        key={data.value}
        className={`cursor-pointer px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "bg-(--color-primary) text-(--color-primary-content) shadow-sm shadow-orange-500/30"
            : "text-(--color-base-content) hover:bg-(--color-base-200)"
        }`}
        onClick={() => setActiveTab(data.value)}
      >
        <span className={isActive ? "text-(--color-primary-content)" : "text-(--color-primary)"}>
          {data.icon}
        </span>
        <span className="capitalize">{data.name}</span>
      </li>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-(--color-base-300) pb-4">
          <div className="w-10 h-10 rounded-xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold">
            <FaStore size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-(--color-base-content)">
              Partner Portal
            </h2>
            <p className="text-[10px] text-(--color-secondary)">
              Manage your restaurant
            </p>
          </div>
        </div>

        <ul className="space-y-2">
          {mainTabs.map((data) => renderTab(data))}
        </ul>
      </div>

      <div className="border-t border-(--color-base-300) pt-4">
        <ul>
          {renderTab(settingsTab)}
        </ul>
      </div>
    </div>
  );
};

export default RestaurantSidebar;
