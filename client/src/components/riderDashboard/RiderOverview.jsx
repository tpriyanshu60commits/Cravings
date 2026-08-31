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
        <RiLoader4Fill className="animate-spin text-4xl text-(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-base-content)">
            Rider Command Center
          </h1>
          <p className="text-xs text-(--color-secondary) mt-1">
            Real-time delivery management, navigation, and earnings overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("available")}
            className="bg-(--color-primary) text-(--color-primary-content) px-4 py-2 rounded-xl text-xs font-bold shadow hover:opacity-90 transition flex items-center gap-2"
          >
            <MdOutlineDeliveryDining size={18} />
            Find Available Orders
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-(--color-base-100) p-4 rounded-2xl border border-(--color-secondary)/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            <MdAttachMoney size={28} />
          </div>
          <div>
            <p className="text-xs text-(--color-secondary) font-medium">Today's Earnings</p>
            <h3 className="text-xl font-extrabold text-(--color-base-content)">
              ₹{stats?.todayEarnings ?? 0}
            </h3>
            <p className="text-[10px] text-green-600 font-semibold mt-0.5">
              {stats?.todayDeliveriesCount ?? 0} deliveries today
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-100) p-4 rounded-2xl border border-(--color-secondary)/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <RiEBike2Fill size={28} />
          </div>
          <div>
            <p className="text-xs text-(--color-secondary) font-medium">Active Deliveries</p>
            <h3 className="text-xl font-extrabold text-(--color-base-content)">
              {stats?.activeOrdersCount ?? activeOrders.length}
            </h3>
            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
              In progress right now
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-100) p-4 rounded-2xl border border-(--color-secondary)/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <MdCheckCircle size={28} />
          </div>
          <div>
            <p className="text-xs text-(--color-secondary) font-medium">Total Completed</p>
            <h3 className="text-xl font-extrabold text-(--color-base-content)">
              {stats?.totalDeliveriesCount ?? 0}
            </h3>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
              Lifetime: ₹{stats?.totalEarnings ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-100) p-4 rounded-2xl border border-(--color-secondary)/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center">
            <MdStarRate size={28} />
          </div>
          <div>
            <p className="text-xs text-(--color-secondary) font-medium">Rider Rating</p>
            <h3 className="text-xl font-extrabold text-(--color-base-content)">
              {stats?.averageRating?.toFixed(1) || "5.0"} ★
            </h3>
            <p className="text-[10px] text-yellow-700 font-semibold mt-0.5 capitalize">
              Status: {stats?.status || "Active"}
            </p>
          </div>
        </div>
      </div>

      {/* Live Active Delivery Banner / Card */}
      {currentOrder ? (
        <div className="bg-(--color-base-100) rounded-2xl border-2 border-(--color-primary) p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-(--color-secondary)/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-ping" />
              <h2 className="font-extrabold text-sm text-(--color-base-content)">
                Active Delivery in Progress
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-(--color-primary)/10 text-(--color-primary) uppercase">
                {currentOrder.orderStatus}
              </span>
            </div>
            <p className="text-xs text-(--color-secondary)">
              Order ID: <span className="font-mono font-bold">{currentOrder._id}</span>
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold py-2">
            <div
              className={`p-2 rounded-lg ${
                ["accepted", "ready", "pickedUp", "outForDelivery", "delivered"].includes(
                  currentOrder.orderStatus
                )
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              1. Assigned
            </div>
            <div
              className={`p-2 rounded-lg ${
                ["ready", "pickedUp", "outForDelivery", "delivered"].includes(
                  currentOrder.orderStatus
                )
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              2. Food Ready
            </div>
            <div
              className={`p-2 rounded-lg ${
                ["pickedUp", "outForDelivery", "delivered"].includes(
                  currentOrder.orderStatus
                )
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              3. Picked Up
            </div>
            <div
              className={`p-2 rounded-lg ${
                ["outForDelivery", "delivered"].includes(currentOrder.orderStatus)
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              4. Out for Delivery
            </div>
          </div>

          {/* Pickup & Drop Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Restaurant Pickup */}
            <div className="p-4 rounded-xl bg-(--color-base-200) space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-(--color-secondary) uppercase tracking-wider flex items-center gap-1.5">
                  <MdStorefront size={16} /> Pickup From
                </span>
                <button
                  onClick={() => handleOpenNavigation(currentOrder.restaurantId)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <MdDirections size={16} /> Maps
                </button>
              </div>
              <h3 className="text-sm font-bold text-(--color-base-content)">
                {currentOrder.restaurantId?.restaurantName || "Restaurant Partner"}
              </h3>
              <p className="text-xs text-(--color-secondary)">
                {currentOrder.restaurantId?.address}, {currentOrder.restaurantId?.city}
              </p>
              {currentOrder.restaurantId?.contactDetails?.phone && (
                <p className="text-xs font-medium text-(--color-base-content) flex items-center gap-1">
                  <MdPhone size={14} /> {currentOrder.restaurantId.contactDetails.phone}
                </p>
              )}
            </div>

            {/* Customer Destination */}
            <div className="p-4 rounded-xl bg-(--color-base-200) space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-(--color-secondary) uppercase tracking-wider flex items-center gap-1.5">
                  <MdLocationOn size={16} /> Deliver To (Customer)
                </span>
                <button
                  onClick={() => handleOpenNavigation(currentOrder.deliveryAddress)}
                  className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded hover:bg-green-200 flex items-center gap-1"
                >
                  <MdDirections size={16} /> Open Navigation
                </button>
              </div>
              <h3 className="text-sm font-bold text-(--color-base-content)">
                {currentOrder.deliveryAddress?.name || "Customer"}
              </h3>
              <p className="text-xs text-(--color-secondary)">
                {currentOrder.deliveryAddress?.address}, {currentOrder.deliveryAddress?.city},{" "}
                {currentOrder.deliveryAddress?.state} - {currentOrder.deliveryAddress?.pinCode}
              </p>
              {currentOrder.customerId?.customerId?.phone && (
                <p className="text-xs font-medium text-(--color-base-content) flex items-center gap-1">
                  <MdPhone size={14} /> {currentOrder.customerId.customerId.phone}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-(--color-secondary)/30">
            <button
              onClick={() => handleOpenNavigation(currentOrder.deliveryAddress)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-2 transition"
            >
              <MdDirections size={18} />
              Navigate to Customer (Google Maps)
            </button>

            <div className="flex items-center gap-2">
              {["ready", "accepted"].includes(currentOrder.orderStatus) && (
                <button
                  onClick={() => handlePickup(currentOrder._id)}
                  disabled={actionLoadingId === currentOrder._id}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
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
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoadingId === currentOrder._id && (
                    <RiLoader4Fill className="animate-spin" />
                  )}
                  Start Delivery (Out for Delivery)
                </button>
              )}

              {currentOrder.orderStatus === "outForDelivery" && (
                currentOrder.deliveryConfirmation?.riderConfirmed ? (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold">
                    <MdCheckCircle className="text-sm" />
                    Waiting for Customer Confirmation
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeliver(currentOrder._id)}
                    disabled={actionLoadingId === currentOrder._id}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
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
                className="bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) px-3 py-2 rounded-xl text-xs font-semibold"
              >
                View Full Live Stepper
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-(--color-base-100) rounded-2xl border border-dashed border-(--color-secondary) p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-(--color-primary)/10 text-(--color-primary) mx-auto flex items-center justify-center">
            <MdOutlineDeliveryDining size={32} />
          </div>
          <h3 className="text-sm font-bold text-(--color-base-content)">
            No Active Delivery Right Now
          </h3>
          <p className="text-xs text-(--color-secondary) max-w-md mx-auto">
            You are ready to accept new delivery requests. Head over to Available Orders to claim ready food packages.
          </p>
          <button
            onClick={() => setActiveTab("available")}
            className="bg-(--color-primary) text-(--color-primary-content) px-5 py-2 rounded-xl text-xs font-bold shadow hover:opacity-90 transition inline-flex items-center gap-1.5"
          >
            Check Available Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default RiderOverview;