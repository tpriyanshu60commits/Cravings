import React from "react";
import { MdDashboard } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { MdFavoriteBorder } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
const RestaurantSidebar = ({ activeTab, setActiveTab }) => {
  const mainTabs = [
    { name: "overview", value: "overview", icon: <MdDashboard /> },
    { name: "orders", value: "orders", icon: <FaShoppingCart /> },
    { name: "menu", value: "menu", icon: <FaShoppingCart /> },
  ];
  const settingsTab = {
    name: "Settings",
    value: "settings",
    icon: <IoMdSettings />,
  };

  const renderTabs = (data) => (
    <li
      key={data.value}
      className={`cursor-pointer p-2 rounded text-(--color-neutral) flex items-center gap-3 ${
        activeTab === data.value
          ? "bg-(--color-primary) text-(--color-primary-content) font-semibold"
          : "hover:bg-(--color-secondary) hover:text-(--color-secondary-content) transition-colors duration-200"
      }`}
      onClick={() => setActiveTab(data.value)}
    >
      {data.icon} {data.value}
    </li>
  );
  return (
    <>
      <div className="h-full flex flex-col">
        <ul className="space-y-4 flex-1">
          {mainTabs.map((data) => renderTabs(data))}
        </ul>
        <ul className="space-y-4 border-t border-(--color-secondary) py-2">
          {renderTabs(settingsTab)}
        </ul>
      </div>
      {/* <button onClick={() => setActiveTab("overview")}>Overview</button>

      <button onClick={() => setActiveTab("orders")}>Orders</button>

      <button onClick={() => setActiveTab("settings")}>Settings</button> */}
    </>
  );
};

export default RestaurantSidebar;
