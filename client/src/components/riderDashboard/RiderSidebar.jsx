import {
  MdDashboard,
  MdOutlineDeliveryDining,
  MdOutlineReceiptLong,
  MdAttachMoney,
  MdPersonOutline,
  MdVerifiedUser,
  MdMyLocation,
} from "react-icons/md";
import { RiEBike2Fill } from "react-icons/ri";

const RiderSidebar = ({
  activeTab,
  setActiveTab,
  isAvailable,
  onToggleAvailability,
  isTogglingAvailability,
  onSyncLocation,
  riderStatus,
}) => {
  const navigationTabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <MdDashboard size={20} />,
      badge: null,
    },
    {
      id: "available",
      label: "Available Orders",
      icon: <MdOutlineDeliveryDining size={20} />,
      badge: "Pool",
    },
    {
      id: "active",
      label: "Active Delivery",
      icon: <RiEBike2Fill size={20} />,
      badge: "Live",
    },
    {
      id: "orders",
      label: "Delivery History",
      icon: <MdOutlineReceiptLong size={20} />,
      badge: null,
    },
    {
      id: "earnings",
      label: "My Earnings",
      icon: <MdAttachMoney size={20} />,
      badge: null,
    },
    {
      id: "profile",
      label: "Rider Profile",
      icon: <MdPersonOutline size={20} />,
      badge: null,
    },
    {
      id: "kyc",
      label: "KYC & Documents",
      icon: <MdVerifiedUser size={20} />,
      badge: null,
    },
  ];

  return (
    <aside className="w-full h-full flex flex-col justify-between select-none p-4">
      <div className="space-y-4">
        {/* Portal Header */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-teal-900/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold shadow-sm shrink-0">
            <RiEBike2Fill size={22} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-wide">
              CRAVINGS RIDER
            </h2>
            <p className="text-[10px] text-[#8faea7]">
              Delivery Partner Portal
            </p>
          </div>
        </div>

        {/* Online / Offline Status Widget */}
        <div className="p-3.5 rounded-2xl bg-[#041916] border border-teal-800/60 shadow-inner space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              Duty Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isAvailable
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-300 border-rose-500/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              {isAvailable ? "Online" : "Offline"}
            </span>
          </div>
          <div className="space-y-1.5">
            <button
              onClick={onToggleAvailability}
              disabled={isTogglingAvailability}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isAvailable
                  ? "bg-amber-600/90 hover:bg-amber-600 text-white shadow-amber-950/40"
                  : "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-orange-950/40 hover:opacity-95"
              } disabled:opacity-50`}
            >
              {isTogglingAvailability
                ? "Updating..."
                : isAvailable
                ? "Go Offline"
                : "Go Online"}
            </button>
            {onSyncLocation && (
              <button
                onClick={onSyncLocation}
                className="w-full py-1 px-2 rounded-xl text-[11px] font-semibold text-[#8faea7] hover:text-white bg-[#072420] hover:bg-teal-900/30 border border-teal-800/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Request live GPS coordinates from browser"
              >
                <MdMyLocation size={13} className="text-blue-400" />
                <span>Sync Live GPS</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navigationTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
                    : "text-[#8faea7] hover:text-white hover:bg-teal-900/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "text-[#ea580c]"}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      isActive
                        ? "bg-black/20 text-white"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Account status */}
      <div className="pt-4 border-t border-teal-900/40 text-[11px] text-[#8faea7]">
        <div className="flex items-center justify-between">
          <span>Account:</span>
          <span className="capitalize font-bold text-orange-400">
            {riderStatus || "Active"}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default RiderSidebar;
