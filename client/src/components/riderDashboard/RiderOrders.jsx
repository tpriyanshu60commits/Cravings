import { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { openRiderNavigation } from "../../utils/riderNavigation";
import {
  MdOutlineDeliveryDining,
  MdStorefront,
  MdLocationOn,
  MdDirections,
  MdSearch,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdOutlineReceiptLong,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdRefresh,
} from "react-icons/md";
import { RiEBike2Fill, RiLoader4Fill } from "react-icons/ri";

const RiderOrders = ({ initialSubTab = "available" }) => {
  const [subTab, setSubTab] = useState(initialSubTab); // "available" | "active" | "history"
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const handleOpenNavigation = (addressObj) => {
    openRiderNavigation(addressObj);
  };

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      let endpoint = "/rider/orders";
      if (subTab === "available") {
        endpoint = "/rider/orders?status=available";
      } else if (subTab === "active") {
        endpoint = "/rider/orders?status=active";
      } else if (subTab === "history") {
        endpoint = "/rider/orders?status=completed";
      }

      const res = await api.get(endpoint);
      setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [subTab]);

  useEffect(() => {
    let isMounted = true;
    const loadInitialOrders = async () => {
      try {
        let endpoint = "/rider/orders";
        if (subTab === "available") {
          endpoint = "/rider/orders?status=available";
        } else if (subTab === "active") {
          endpoint = "/rider/orders?status=active";
        } else if (subTab === "history") {
          endpoint = "/rider/orders?status=completed";
        }
        const res = await api.get(endpoint);
        if (isMounted) {
          setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.message || "Failed to fetch orders");
          setIsLoading(false);
        }
      }
    };
    loadInitialOrders();
    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [subTab, fetchOrders]);

  // Actions
  const handleAcceptOrder = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/rider/orders/${orderId}/accept`);
      toast.success(res.data?.message || "Order claimed successfully!");
      setSubTab("active");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to claim order. It may have been taken."
      );
    } finally {
      setActionLoadingId(null);
      fetchOrders();
    }
  };

  const handlePickup = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/rider/orders/${orderId}/pickup`);
      toast.success(res.data?.message || "Order marked as picked up");
      await fetchOrders();
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

      // Auto-open navigation directly to customer
      openRiderNavigation(deliveryAddress);
      await fetchOrders();
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
      toast.success(res.data?.message || "Order delivered successfully! Payout credited.");
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete delivery");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUndeliverable = async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this order as undeliverable?")) {
      return;
    }
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/rider/orders/${orderId}/undeliverable`);
      toast.success(res.data?.message || "Order marked as undeliverable");
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o._id?.toLowerCase().includes(q) ||
      o.restaurantId?.restaurantName?.toLowerCase().includes(q) ||
      o.deliveryAddress?.name?.toLowerCase().includes(q) ||
      o.deliveryAddress?.address?.toLowerCase().includes(q) ||
      o.orderStatus?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Delivery Orders
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Claim available ready food packages, manage live navigation, and review past deliveries.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          disabled={isRefreshing || isLoading}
          className="self-start sm:self-auto bg-[#041916] hover:bg-teal-900/30 text-white border border-teal-800/60 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
        >
          <MdRefresh className={isRefreshing ? "animate-spin text-sm text-[#f97316]" : "text-sm"} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-teal-900/40 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab("available")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === "available"
                ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
                : "bg-[#041916] text-[#8faea7] hover:text-white border border-teal-800/60 hover:bg-teal-900/30"
            }`}
          >
            <MdOutlineDeliveryDining size={16} />
            <span>Available Orders</span>
          </button>

          <button
            onClick={() => setSubTab("active")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === "active"
                ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
                : "bg-[#041916] text-[#8faea7] hover:text-white border border-teal-800/60 hover:bg-teal-900/30"
            }`}
          >
            <RiEBike2Fill size={16} />
            <span>My Active Deliveries</span>
          </button>

          <button
            onClick={() => setSubTab("history")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === "history"
                ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
                : "bg-[#041916] text-[#8faea7] hover:text-white border border-teal-800/60 hover:bg-teal-900/30"
            }`}
          >
            <MdOutlineReceiptLong size={16} />
            <span>Delivery History</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <MdSearch className="absolute left-3 top-2.5 text-[#537770] text-lg" />
          <input
            type="text"
            placeholder="Search by ID, restaurant, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-[#041916] border border-teal-800/60 text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Order Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RiLoader4Fill className="animate-spin text-4xl text-[#f97316]" />
          <p className="text-xs text-[#8faea7]">Fetching order pool...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-[#072420] rounded-2xl border border-dashed border-teal-800/60 p-8 space-y-3 shadow-xl shadow-black/40">
          <div className="w-14 h-14 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 mx-auto flex items-center justify-center">
            <MdOutlineDeliveryDining size={32} />
          </div>
          <h3 className="text-sm font-bold text-white">
            {subTab === "available"
              ? "No available orders right now"
              : subTab === "active"
              ? "No active deliveries in progress"
              : "No past delivery history found"}
          </h3>
          <p className="text-xs text-[#8faea7] max-w-sm mx-auto">
            {subTab === "available"
              ? "When restaurants mark orders as ready, they appear here for pickup. Check back in a moment!"
              : subTab === "active"
              ? "Claim an order from the Available tab to start a new delivery."
              : "Completed orders will be logged here with complete payout details."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const isActionLoading = actionLoadingId === order._id;
            const isAvailableTab = subTab === "available";
            const isActiveTab = subTab === "active";

            return (
              <div
                key={order._id}
                className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 overflow-hidden transition hover:border-teal-700/60"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-[#041916]/80 border-b border-teal-900/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold">
                      <RiEBike2Fill size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          #{order._id}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8faea7] flex items-center gap-1 mt-0.5">
                        <MdAccessTime size={13} />
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {order.orderItems?.length || 0} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-[#8faea7]">Rider Fee</p>
                      <p className="text-sm font-extrabold text-emerald-400">₹40.00</p>
                    </div>
                    <div className="text-right border-l border-teal-900/60 pl-4">
                      <p className="text-[10px] text-[#8faea7]">Order Total</p>
                      <p className="text-sm font-extrabold text-[#f97316]">
                        ₹{order.billDetails?.finalAmount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Card Body: Pickup & Drop Info */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Restaurant Pickup */}
                  <div className="p-3.5 rounded-xl bg-[#041916] border border-teal-800/60 space-y-1.5 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1">
                        <MdStorefront size={14} /> Pickup Restaurant
                      </span>
                      <button
                        onClick={() => handleOpenNavigation(order.restaurantId)}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                      >
                        <MdDirections size={14} /> Pickup Map
                      </button>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {order.restaurantId?.restaurantName || "Restaurant Partner"}
                    </p>
                    <p className="text-[11px] text-[#8faea7] line-clamp-1">
                      {order.restaurantId?.address}, {order.restaurantId?.city}
                    </p>
                  </div>

                  {/* Customer Drop */}
                  <div className="p-3.5 rounded-xl bg-[#041916] border border-teal-800/60 space-y-1.5 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                        <MdLocationOn size={14} /> Customer Destination
                      </span>
                      <button
                        onClick={() => handleOpenNavigation(order.deliveryAddress)}
                        className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg hover:bg-emerald-500/25 flex items-center gap-0.5 cursor-pointer"
                      >
                        <MdDirections size={14} /> Customer Map
                      </button>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {order.deliveryAddress?.name || "Customer"}
                    </p>
                    <p className="text-[11px] text-[#8faea7] line-clamp-1">
                      {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                    </p>
                  </div>
                </div>

                {/* Expandable Item Breakdown Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-[#041916]/60 border-t border-teal-900/40 space-y-3">
                    <h4 className="text-xs font-bold text-white">
                      Ordered Items ({order.orderItems?.length})
                    </h4>
                    <div className="space-y-1.5">
                      {order.orderItems?.map((item, idx) => (
                        <div
                          key={item.itemId || idx}
                          className="flex justify-between items-center text-xs py-1 border-b border-teal-900/40"
                        >
                          <span className="font-medium text-white">
                            {item.quantity}x {item.itemName}
                          </span>
                          <span className="text-orange-400 font-mono">
                            ₹{item.itemPrice}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 font-bold text-white">
                      <span className="text-[#8faea7]">Customer Phone:</span>
                      <span className="font-mono text-orange-400">
                        {order.customerId?.customerId?.phone || "Hidden for privacy"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="p-3 bg-[#041916]/80 border-t border-teal-900/40 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                    className="text-xs text-[#8faea7] hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer"
                  >
                    <span>{isExpanded ? "Hide Details" : "View Ordered Items"}</span>
                    {isExpanded ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Available Pool Claim Action */}
                    {isAvailableTab && (
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={isActionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isActionLoading ? (
                          <RiLoader4Fill className="animate-spin" />
                        ) : (
                          <MdCheckCircle size={16} />
                        )}
                        <span>Accept Delivery (₹40)</span>
                      </button>
                    )}

                    {/* Active Order Actions */}
                    {isActiveTab && (
                      <>
                        <button
                          onClick={() => handleOpenNavigation(order.deliveryAddress)}
                          className="bg-blue-600/90 hover:bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <MdDirections size={16} />
                          <span>Google Maps</span>
                        </button>

                        {["ready", "accepted"].includes(order.orderStatus) && (
                          <button
                            onClick={() => handlePickup(order._id)}
                            disabled={isActionLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            {isActionLoading && <RiLoader4Fill className="animate-spin" />}
                            <span>Confirm Pickup</span>
                          </button>
                        )}

                        {order.orderStatus === "pickedUp" && (
                          <button
                            onClick={() =>
                              handleOutForDelivery(order._id, order.deliveryAddress)
                            }
                            disabled={isActionLoading}
                            className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            {isActionLoading && <RiLoader4Fill className="animate-spin" />}
                            <span>Start Delivery</span>
                          </button>
                        )}

                        {order.orderStatus === "outForDelivery" && (
                          <>
                            {order.deliveryConfirmation?.riderConfirmed ? (
                              <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold">
                                <MdCheckCircle size={15} />
                                <span>Waiting Customer</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDeliver(order._id)}
                                disabled={isActionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              >
                                {isActionLoading && <RiLoader4Fill className="animate-spin" />}
                                <span>Mark Delivered</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleUndeliverable(order._id)}
                              disabled={isActionLoading}
                              className="bg-rose-600/90 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                            >
                              <MdCancel size={14} />
                              <span>Undeliverable</span>
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiderOrders;