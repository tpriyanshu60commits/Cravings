import { useAuth } from "../../context/AuthContext";
import { MdDashboard, MdOutlineLocationOn } from "react-icons/md";
import { IoReceiptOutline, IoSettingsOutline, IoPersonOutline } from "react-icons/io5";

const CustomerSidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const sidebarTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard size={18} /> },
    { name: "My Orders", value: "orders", icon: <IoReceiptOutline size={18} /> },
    { name: "Address Book", value: "address-book", icon: <MdOutlineLocationOn size={18} /> },
    { name: "Settings", value: "settings", icon: <IoSettingsOutline size={18} /> },
  ];

  const renderTab = (tab) => {
    const isActive = activeTab === tab.value;
    return (
      <li
        key={tab.value}
        onClick={() => setActiveTab(tab.value)}
        className={`cursor-pointer px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
            : "text-[#8faea7] hover:text-white hover:bg-teal-900/30"
        }`}
      >
        <span className={isActive ? "text-white" : "text-[#ea580c]"}>
          {tab.icon}
        </span>
        <span>{tab.name}</span>
      </li>
    );
  };

  return (
    <div className="h-full flex flex-col select-none space-y-6">
      {/* User Mini Profile Card */}
      <div className="p-3 bg-[#041916] rounded-2xl border border-teal-800/60 flex items-center gap-3 shadow-inner">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
          {user?.fullName?.charAt(0)?.toUpperCase() || <IoPersonOutline />}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-white truncate">
            {user?.fullName || "Customer"}
          </h4>
          <p className="text-[10px] text-[#8faea7] truncate">
            {user?.email || "customer@cravings.com"}
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <ul className="space-y-1.5">
        {sidebarTabs.map((tab) => renderTab(tab))}
      </ul>
    </div>
  );
};

export default CustomerSidebar;
