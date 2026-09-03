import {
  MdDashboard,
  MdPeople,
  MdRestaurant,
  MdDeliveryDining,
} from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { RiShieldUserLine } from "react-icons/ri";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const allTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard size={20} /> },
    { name: "Customers", value: "customers", icon: <MdPeople size={20} /> },
    { name: "Restaurants", value: "restaurants", icon: <MdRestaurant size={20} /> },
    { name: "Riders", value: "riders", icon: <MdDeliveryDining size={20} /> },
    { name: "Orders", value: "orders", icon: <FaShoppingCart size={18} /> },
    { name: "Settings", value: "settings", icon: <IoMdSettings size={20} /> },
  ];

  return (
    <div className="h-full flex flex-col justify-start select-none">
      {/* Brand / Portal Header */}
      <div className="flex items-center gap-3 px-3 py-2 mb-4 border-b border-teal-900/40 pb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold shadow-sm shrink-0">
          <RiShieldUserLine size={22} />
        </div>
        <div>
          <h2 className="font-bold text-sm text-white tracking-wide">
            CRAVINGS ADMIN
          </h2>
          <p className="text-[10px] text-[#8faea7]">
            Master Control Center
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="px-3 py-1 mb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8faea7]">
            Navigation
          </p>
        </div>
        {allTabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
                  : "text-[#8faea7] hover:text-white hover:bg-teal-900/30"
              }`}
            >
              <span className={isActive ? "text-white" : "text-[#ea580c]"}>
                {tab.icon}
              </span>
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSidebar;
