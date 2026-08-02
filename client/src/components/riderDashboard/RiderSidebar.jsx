import React from "react";
import { MdDashboard } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { MdFavoriteBorder } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
const RiderSidebar = ({ activeTab, setActiveTab }) => {
  const mainTabs = [
    { name: "overview", value: "overview", icon: <MdDashboard /> },
    { name: "orders", value: "orders", icon: <FaShoppingCart /> },
  ];
  const settings = {
    name: "settings",
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
      {data.icon}
      {data.name}
    </li>
  );

  return (
    <>
      <div className="h-full flex flex-col">
        <ul className="space-y-4 flex-1 ">
          {mainTabs.map((data) => renderTabs(data))}
        </ul>
        <ul className="space-y-4 border-t border-(--color-secondary) py-2">
          {renderTabs(settings)}
        </ul>
      </div>
      {/* <div>RiderSidebar</div>
      <button onClick={()=>setActiveTab("overview")}>Overview</button>
      <br />
      <button onClick={()=>setActiveTab("orders")}>orders</button>
      <br />
      <button onClick={()=>setActiveTab("settings")}>settings</button> */}
    </>
  );
};

export default RiderSidebar;
