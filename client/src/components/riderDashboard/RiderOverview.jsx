import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { openRiderNavigation } from "../../utils/riderNavigation";
import {
  MdAttachMoney,
  MdOutlineDeliveryDining,
  MdStarRate,
  MdLocationOn,
  MdStorefront,
  MdDirections,
  MdPhone,
  MdCheckCircle,
} from "react-icons/md";
import { RiEBike2Fill, RiLoader4Fill } from "react-icons/ri";

const RiderOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchOverviewData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, ordersRes] = await Promise.all([
        api.get("/rider/dashboard"),
        api.get("/rider/orders?status=active"),
      ]);
      setStats(dashRes.data?.data || null);
      setActiveOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : []);
    } catch (error) {
      console.error("Failed to fetch rider overview data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadOverview = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          api.get("/rider/dashboard"),
          api.get("/rider/orders?status=active"),
        ]);
        if (isMounted) {
          setStats(dashRes.data?.data || null);
          setActiveOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch rider overview data:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadOverview();
    const interval = setInterval(fetchOverviewData, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentOrder = activeOrders[0] || null;

  const handleOpenNavigation = (addressObj) => {
    openRiderNavigation(addressObj);
  };

  const handlePickup = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/rider/orders/${orderId}/pickup`);
      toast.success(res.data?.message || "Order marked as picked up");
      await fetchOverviewData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to pickup order");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOutForDelivery = async (orderId, deliveryAddress) => {
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/rider/orders/${orderId}/out-for-delivery`);
      toast.success(res.data?.message || "Order is now out for delivery");
      
      // Auto-open navigation directly with live GPS origin & clean customer destination
      openRiderNavigation(deliveryAddress);
      await fetchOverviewData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start delivery");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeliver = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/rider/orders/${orderId}/deliver`);
      toast.success(res.data?.message || "Order delivered successfully!");
      await fetchOverviewData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete delivery");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <RiLoader4Fill className="animate-spin text-4xl text-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Rider Command Center
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Real-time delivery management, navigation, and earnings overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("available")}
            className="w-full sm:w-auto bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MdOutlineDeliveryDining size={18} />
            <span>Find Available Orders</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex items-center gap-4 hover:border-emerald-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <MdAttachMoney size={26} />
          </div>
          <div>
            <p className="text-xs text-[#8faea7] font-medium">Today's Earnings</p>
            <h3 className="text-xl font-extrabold text-white">
              ₹{stats?.todayEarnings ?? 0}
            </h3>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              {stats?.todayDeliveriesCount ?? 0} deliveries today
            </p>
          </div>
        </div>

        <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex items-center gap-4 hover:border-amber-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <RiEBike2Fill size={26} />
          </div>
          <div>
            <p className="text-xs text-[#8faea7] font-medium">Active Deliveries</p>
            <h3 className="text-xl font-extrabold text-white">
              {stats?.activeOrdersCount ?? activeOrders.length}
            </h3>
            <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
              In progress right now
            </p>
          </div>
        </div>

        <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex items-center gap-4 hover:border-blue-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <MdCheckCircle size={26} />
          </div>
          <div>
            <p className="text-xs text-[#8faea7] font-medium">Total Completed</p>
            <h3 className="text-xl font-extrabold text-white">
              {stats?.totalDeliveriesCount ?? 0}
            </h3>
            <p className="text-[10px] text-blue-400 font-semibold mt-0.5">
              Lifetime: ₹{stats?.totalEarnings ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex items-center gap-4 hover:border-yellow-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 flex items-center justify-center shrink-0">
            <MdStarRate size={26} />
          </div>
          <div>
            <p className="text-xs text-[#8faea7] font-medium">Rider Rating</p>
            <h3 className="text-xl font-extrabold text-white">
              {stats?.averageRating?.toFixed(1) || "5.0"} ★
            </h3>
            <p className="text-[10px] text-yellow-400 font-semibold mt-0.5 capitalize">
              Status: {stats?.status || "Active"}
            </p>
          </div>
        </div>
      </div>

      {/* Live Active Delivery Banner / Card */}
      {currentOrder ? (
        <div className="bg-[#072420] rounded-2xl border border-orange-500/50 p-5 sm:p-6 shadow-xl shadow-black/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-900/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="font-extrabold text-sm text-white">
                Active Delivery in Progress
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase">
                {currentOrder.orderStatus}
              </span>
            </div>
            <p className="text-xs text-[#8faea7]">
              Order ID: <span className="font-mono font-bold text-white">#{currentOrder._id}</span>
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-semibold py-2">
            <div
              className={`p-2 rounded-xl border ${
                ["accepted", "ready", "pickedUp", "outForDelivery", "delivered"].includes(
                  currentOrder.orderStatus
                )
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-[#041916] text-[#8faea7]/50 border-teal-900/40"
              }`}
            >
              1. Assigned
            </div>
            <div
              className={`p-2 rounded-xl border ${
                ["ready", "pickedUp", "outForDelivery", "delivered"].includes(
                  currentOrder.orderStatus
                )
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-[#041916] text-[#8faea7]/50 border-teal-900/40"
              }`}
            >
              2. Food Ready
            </div>
            <div
              className={`p-2 rounded-xl border ${
                ["pickedUp", "outForDelivery", "delivered"].includes(
                  currentOrder.orderStatus
                )
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-[#041916] text-[#8faea7]/50 border-teal-900/40"
              }`}
            >
              3. Picked Up
            </div>
            <div
              className={`p-2 rounded-xl border ${
                ["outForDelivery", "delivered"].includes(currentOrder.orderStatus)
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-[#041916] text-[#8faea7]/50 border-teal-900/40"
              }`}
            >
              4. Out for Delivery
            </div>
          </div>

          {/* Pickup & Drop Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Restaurant Pickup */}
            <div className="p-4 rounded-xl bg-[#041916] border border-teal-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8faea7] uppercase tracking-wider flex items-center gap-1.5">
                  <MdStorefront size={16} className="text-[#f97316]" /> Pickup From
                </span>
                <button
                  onClick={() => handleOpenNavigation(currentOrder.restaurantId)}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  <MdDirections size={16} /> Maps
                </button>
              </div>
              <h3 className="text-sm font-bold text-white">
                {currentOrder.restaurantId?.restaurantName || "Restaurant Partner"}
              </h3>
              <p className="text-xs text-[#8faea7]">
                {currentOrder.restaurantId?.address}, {currentOrder.restaurantId?.city}
              </p>
              {currentOrder.restaurantId?.contactDetails?.phone && (
                <p className="text-xs font-medium text-white flex items-center gap-1 pt-1">
                  <MdPhone size={14} className="text-[#f97316]" /> {currentOrder.restaurantId.contactDetails.phone}
                </p>
              )}
            </div>

            {/* Customer Destination */}
            <div className="p-4 rounded-xl bg-[#041916] border border-teal-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8faea7] uppercase tracking-wider flex items-center gap-1.5">
                  <MdLocationOn size={16} className="text-[#f97316]" /> Deliver To (Customer)
                </span>
                <button
                  onClick={() => handleOpenNavigation(currentOrder.deliveryAddress)}
                  className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg hover:bg-emerald-500/25 flex items-center gap-1 cursor-pointer"
                >
                  <MdDirections size={16} /> Open Navigation
                </button>
              </div>
              <h3 className="text-sm font-bold text-white">
                {currentOrder.deliveryAddress?.name || "Customer"}
              </h3>
              <p className="text-xs text-[#8faea7]">
                {currentOrder.deliveryAddress?.address}, {currentOrder.deliveryAddress?.city},{" "}
                {currentOrder.deliveryAddress?.state} - {currentOrder.deliveryAddress?.pinCode}
              </p>
              {currentOrder.customerId?.customerId?.phone && (
                <p className="text-xs font-medium text-white flex items-center gap-1 pt-1">
                  <MdPhone size={14} className="text-[#f97316]" /> {currentOrder.customerId.customerId.phone}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-teal-900/40">
            <button
              onClick={() => handleOpenNavigation(currentOrder.deliveryAddress)}
              className="bg-blue-600/90 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <MdDirections size={18} />
              <span>Navigate to Customer (Maps)</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {["ready", "accepted"].includes(currentOrder.orderStatus) && (
                <button
                  onClick={() => handlePickup(currentOrder._id)}
                  disabled={actionLoadingId === currentOrder._id}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoadingId === currentOrder._id && (
                    <RiLoader4Fill className="animate-spin" />
                  )}
                  Confirm Food Pickup
                </button>
              )}

              {currentOrder.orderStatus === "pickedUp" && (
                <button
                  onClick={() =>
                    handleOutForDelivery(currentOrder._id, currentOrder.deliveryAddress)
                  }
                  disabled={actionLoadingId === currentOrder._id}
                  className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoadingId === currentOrder._id && (
                    <RiLoader4Fill className="animate-spin" />
                  )}
                  Start Delivery
                </button>
              )}

              {currentOrder.orderStatus === "outForDelivery" && (
                currentOrder.deliveryConfirmation?.riderConfirmed ? (
                  <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold">
                    <MdCheckCircle className="text-sm" />
                    Waiting for Customer Confirmation
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeliver(currentOrder._id)}
                    disabled={actionLoadingId === currentOrder._id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoadingId === currentOrder._id && (
                      <RiLoader4Fill className="animate-spin" />
                    )}
                    Mark Delivered
                  </button>
                )
              )}

              <button
                onClick={() => setActiveTab("active")}
                className="bg-[#041916] hover:bg-teal-900/30 border border-teal-800/60 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                View Full Live Stepper
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#072420] rounded-2xl border border-dashed border-teal-800/60 p-8 text-center space-y-3 shadow-xl shadow-black/40">
          <div className="w-14 h-14 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 mx-auto flex items-center justify-center">
            <MdOutlineDeliveryDining size={32} />
          </div>
          <h3 className="text-sm font-bold text-white">
            No Active Delivery Right Now
          </h3>
          <p className="text-xs text-[#8faea7] max-w-md mx-auto">
            You are ready to accept new delivery requests. Head over to Available Orders to claim ready food packages.
          </p>
          <button
            onClick={() => setActiveTab("available")}
            className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            Check Available Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default RiderOverview;