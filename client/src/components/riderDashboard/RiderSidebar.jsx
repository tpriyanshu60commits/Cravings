import React from "react";
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
    <aside className="w-full h-full bg-(--color-base-100) border-r border-(--color-secondary)/40 flex flex-col justify-between shadow-sm">
      <div className="p-4">
        {/* Portal Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-(--color-secondary)/30">
          <div className="w-10 h-10 rounded-xl bg-(--color-primary) text-(--color-primary-content) flex items-center justify-center shadow">
            <RiEBike2Fill size={24} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-(--color-base-content) tracking-wide">
              CRAVINGS RIDER
            </h2>
            <p className="text-[11px] text-(--color-secondary) font-medium">
              Delivery Partner Portal
            </p>
          </div>
        </div>

        {/* Online / Offline Status Widget */}
        <div className="mb-4 p-3 rounded-xl bg-(--color-base-200) border border-(--color-secondary)/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-(--color-base-content)">
              Duty Status
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isAvailable
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAvailable ? "bg-green-600 animate-pulse" : "bg-gray-500"
                }`}
              />
              {isAvailable ? "Online" : "Offline"}
            </span>
          </div>
          <div className="space-y-1.5">
            <button
              onClick={onToggleAvailability}
              disabled={isTogglingAvailability}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 ${
                isAvailable
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
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
                className="w-full py-1 px-2 rounded-lg text-[11px] font-medium text-(--color-base-content) bg-(--color-base-100) hover:bg-(--color-base-300) border border-(--color-secondary)/30 transition flex items-center justify-center gap-1"
                title="Request live GPS coordinates from browser"
              >
                <MdMyLocation size={13} className="text-blue-600" />
                Sync Live GPS
              </button>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navigationTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-(--color-primary) text-(--color-primary-content) shadow-sm"
                    : "text-(--color-base-content) hover:bg-(--color-base-200) hover:text-(--color-primary)"
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-800"
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
      <div className="p-4 border-t border-(--color-secondary)/30 text-[11px] text-(--color-secondary)">
        <div className="flex items-center justify-between">
          <span>Account:</span>
          <span className="capitalize font-bold text-(--color-primary)">
            {riderStatus || "Active"}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default RiderSidebar;
