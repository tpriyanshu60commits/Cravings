import { MdDashboard, MdRestaurantMenu, MdOutlineReceiptLong } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { FaStore } from "react-icons/fa";

const RestaurantSidebar = ({ activeTab, setActiveTab }) => {
  const sidebarTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard size={20} /> },
    { name: "Orders", value: "orders", icon: <MdOutlineReceiptLong size={20} /> },
    { name: "Menu", value: "menu", icon: <MdRestaurantMenu size={20} /> },
    { name: "Settings", value: "settings", icon: <IoMdSettings size={20} /> },
  ];

  const renderTab = (data) => {
    const isActive = activeTab === data.value;
    return (
      <li
        key={data.value}
        className={`cursor-pointer px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
            : "text-[#8faea7] hover:text-white hover:bg-teal-900/30"
        }`}
        onClick={() => setActiveTab(data.value)}
      >
        <span className={isActive ? "text-white" : "text-[#ea580c]"}>
          {data.icon}
        </span>
        <span className="capitalize">{data.name}</span>
      </li>
    );
  };

  return (
    <div className="h-full flex flex-col select-none space-y-6">
      <div className="flex items-center gap-3 px-2 py-2 border-b border-teal-900/40 pb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold shrink-0">
          <FaStore size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Partner Portal
          </h2>
          <p className="text-[10px] text-[#8faea7]">
            Manage your restaurant
          </p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {sidebarTabs.map((data) => renderTab(data))}
      </ul>
    </div>
  );
};

export default RestaurantSidebar;

