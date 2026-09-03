import { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

import RiderSidebar from "../../components/riderDashboard/RiderSidebar";
import RiderOverview from "../../components/riderDashboard/RiderOverview";
import RiderOrders from "../../components/riderDashboard/RiderOrders";
import RiderEarnings from "../../components/riderDashboard/RiderEarnings";
import RiderSettings from "../../components/riderDashboard/RiderSettings";
import RiderKYCModal from "../../components/riderDashboard/RiderKYCModal";
import RiderOrderDetailsModal from "../../components/riderDashboard/RiderOrderDetailsModal";

const RiderDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [isAvailable, setIsAvailable] = useState(false);
  const [riderStatus, setRiderStatus] = useState("active");
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [selectedOrderIdForModal, setSelectedOrderIdForModal] = useState(null);

  // Handle Location update using browser native Geolocation (No paid API)
  const syncLocation = useCallback((showToast = false) => {
    if (!("geolocation" in navigator)) {
      if (showToast) toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const res = await api.patch("/rider/location", { lat, lon });
          console.log("Rider GPS location synced:", lat, lon, res.data);
          if (showToast) {
            toast.success("GPS location updated successfully");
          }
        } catch (err) {
          console.warn("Location sync notice:", err.message);
          if (showToast) {
            toast.error(err.response?.data?.message || "Failed to update GPS location");
          }
        }
      },
      (error) => {
        console.warn("Geolocation notice:", error.message);
        if (showToast || error.code === 1) {
          toast.error("Please allow location access to share live GPS coordinates", {
            id: "geo-perm",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);



  useEffect(() => {
    if (isLogin && role === "rider") {
      let isMounted = true;
      api
        .get("/rider/dashboard")
        .then((res) => {
          if (isMounted && res.data?.data) {
            setIsAvailable(!!res.data.data.isAvailable);
            setRiderStatus(res.data.data.status || "active");
          }
        })
        .catch((err) =>
          console.error("Failed to fetch initial rider status:", err)
        );
      syncLocation(false);
      return () => {
        isMounted = false;
      };
    }
  }, [isLogin, role, syncLocation]);

  // Periodic location sync when online
  useEffect(() => {
    if (isAvailable) {
      syncLocation(false);
      const locationInterval = setInterval(() => syncLocation(false), 60000);
      return () => clearInterval(locationInterval);
    }
  }, [isAvailable, syncLocation]);

  const handleToggleAvailability = async () => {
    try {
      setIsTogglingAvailability(true);
      const targetState = !isAvailable;
      if (targetState) {
        syncLocation(false);
      }
      const res = await api.patch("/rider/toggle-availability", {
        isAvailable: targetState,
      });
      const nextStatus = !!res.data?.data?.isAvailable;
      setIsAvailable(nextStatus);
      toast.success(
        res.data?.message || `You are now ${nextStatus ? "online" : "offline"}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle duty status"
      );
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  if (!isLogin || role !== "rider") {
    return (
      <div className="h-screen bg-[#061d19] flex flex-col items-center justify-center p-4">
        <div className="bg-[#072420] p-8 rounded-2xl border border-teal-800/50 shadow-2xl max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="text-xs text-[#8faea7]">
            Please log in with an authorized Delivery Partner (Rider) account to access this command portal.
          </p>
          <button
            className="w-full py-2.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold rounded-xl text-xs shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Go To Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#061d19] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0 hidden md:block h-full bg-[#072420]/95 backdrop-blur-md border-r border-teal-900/40">
        <RiderSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAvailable={isAvailable}
          onToggleAvailability={handleToggleAvailability}
          isTogglingAvailability={isTogglingAvailability}
          onSyncLocation={() => syncLocation(true)}
          riderStatus={riderStatus}
        />
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#061d19]">
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 p-2 bg-[#072420] border-b border-teal-800/40 shrink-0 scrollbar-none">
          {[
            { id: "overview", label: "Overview" },
            { id: "available", label: "Available" },
            { id: "active", label: "Active" },
            { id: "orders", label: "History" },
            { id: "earnings", label: "Earnings" },
            { id: "profile", label: "Profile" },
            { id: "kyc", label: "KYC" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-sm shadow-orange-950/40"
                  : "bg-[#041916] text-[#8faea7] hover:text-white border border-teal-800/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Body */}
        <div className="flex-1 h-full overflow-y-auto">
          {activeTab === "overview" && (
            <RiderOverview
              setActiveTab={setActiveTab}
              onSelectOrderForDetails={(id) => setSelectedOrderIdForModal(id)}
            />
          )}

          {activeTab === "available" && (
            <RiderOrders
              initialSubTab="available"
              onSelectOrderForDetails={(id) => setSelectedOrderIdForModal(id)}
            />
          )}

          {activeTab === "active" && (
            <RiderOrders
              initialSubTab="active"
              onSelectOrderForDetails={(id) => setSelectedOrderIdForModal(id)}
            />
          )}

          {activeTab === "orders" && (
            <RiderOrders
              initialSubTab="history"
              onSelectOrderForDetails={(id) => setSelectedOrderIdForModal(id)}
            />
          )}

          {activeTab === "earnings" && <RiderEarnings />}

          {activeTab === "profile" && <RiderSettings />}

          {activeTab === "kyc" && <RiderKYCModal />}
        </div>
      </div>

      {/* Optional Order Details Modal */}
      {selectedOrderIdForModal && (
        <RiderOrderDetailsModal
          isOpen={!!selectedOrderIdForModal}
          orderId={selectedOrderIdForModal}
          onClose={() => setSelectedOrderIdForModal(null)}
        />
      )}
    </div>
  );
};

export default RiderDashboard;
