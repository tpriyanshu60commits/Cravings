import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { openRiderNavigation } from "../../utils/riderNavigation";
import {
  MdOutlineDeliveryDining,
  MdStorefront,
  MdLocationOn,
  MdDirections,
  MdPhone,
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

const RiderOrders = ({ initialSubTab = "available", onSelectOrderForDetails }) => {
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

  const fetchOrders = async (silent = false) => {
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
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => clearInterval(interval);
  }, [subTab]);

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
    <div className="overflow-y-auto h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-base-content)">
            Delivery Orders
          </h1>
          <p className="text-xs text-(--color-secondary) mt-1">
            Claim available ready food packages, manage live navigation, and review past deliveries.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          disabled={isRefreshing || isLoading}
          className="self-start sm:self-auto bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
        >
          <MdRefresh className={isRefreshing ? "animate-spin text-sm" : "text-sm"} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-(--color-secondary)/30 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab("available")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === "available"
                ? "bg-(--color-primary) text-(--color-primary-content) shadow"
                : "bg-(--color-base-200) text-(--color-base-content) hover:bg-(--color-base-300)"
            }`}
          >
            <MdOutlineDeliveryDining size={16} />
            Available Orders
          </button>

          <button
            onClick={() => setSubTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === "active"
                ? "bg-(--color-primary) text-(--color-primary-content) shadow"
                : "bg-(--color-base-200) text-(--color-base-content) hover:bg-(--color-base-300)"
            }`}
          >
            <RiEBike2Fill size={16} />
            My Active Deliveries
          </button>

          <button
            onClick={() => setSubTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === "history"
                ? "bg-(--color-primary) text-(--color-primary-content) shadow"
                : "bg-(--color-base-200) text-(--color-base-content) hover:bg-(--color-base-300)"
            }`}
          >
            <MdOutlineReceiptLong size={16} />
            Delivery History
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <MdSearch className="absolute left-3 top-2.5 text-(--color-secondary) text-lg" />
          <input
            type="text"
            placeholder="Search by ID, restaurant, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-(--color-base-100) border border-(--color-secondary)/40 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          />
        </div>
      </div>

      {/* Main Order Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RiLoader4Fill className="animate-spin text-4xl text-(--color-primary)" />
          <p className="text-xs text-(--color-secondary)">Fetching order pool...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-(--color-base-100) rounded-2xl border border-dashed border-(--color-secondary) p-8 space-y-3">
          <div className="w-14 h-14 rounded-full bg-(--color-primary)/10 text-(--color-primary) mx-auto flex items-center justify-center">
            <MdOutlineDeliveryDining size={32} />
          </div>
          <h3 className="text-sm font-bold text-(--color-base-content)">
            {subTab === "available"
              ? "No available orders right now"
              : subTab === "active"
              ? "No active deliveries in progress"
              : "No past delivery history found"}
          </h3>
          <p className="text-xs text-(--color-secondary) max-w-sm mx-auto">
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
                className="bg-(--color-base-100) rounded-2xl border border-(--color-secondary)/30 shadow-sm overflow-hidden transition hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-(--color-base-200)/60 border-b border-(--color-secondary)/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold">
                      <RiEBike2Fill size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-(--color-base-content)">
                          {order._id}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-(--color-primary)/10 text-(--color-primary)">
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-(--color-secondary) flex items-center gap-1 mt-0.5">
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
                      <p className="text-[10px] text-(--color-secondary)">Rider Fee</p>
                      <p className="text-sm font-extrabold text-green-600">₹40.00</p>
                    </div>
                    <div className="text-right border-l border-(--color-secondary)/30 pl-4">
                      <p className="text-[10px] text-(--color-secondary)">Order Total</p>
                      <p className="text-sm font-extrabold text-(--color-base-content)">
                        ₹{order.billDetails?.finalAmount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Card Body: Pickup & Drop Info */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Restaurant Pickup */}
                  <div className="space-y-1.5 border-l-2 border-amber-500 pl-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
                        <MdStorefront size={14} /> Pickup Restaurant
                      </span>
                      <button
                        onClick={() => handleOpenNavigation(order.restaurantId)}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <MdDirections size={14} /> Pickup Map
                      </button>
                    </div>
                    <p className="text-xs font-bold text-(--color-base-content)">
                      {order.restaurantId?.restaurantName || "Restaurant Partner"}
                    </p>
                    <p className="text-[11px] text-(--color-secondary) line-clamp-1">
                      {order.restaurantId?.address}, {order.restaurantId?.city}
                    </p>
                  </div>

                  {/* Customer Drop */}
                  <div className="space-y-1.5 border-l-2 border-green-500 pl-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-green-700 uppercase flex items-center gap-1">
                        <MdLocationOn size={14} /> Customer Destination
                      </span>
                      <button
                        onClick={() => handleOpenNavigation(order.deliveryAddress)}
                        className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded hover:bg-green-200 flex items-center gap-0.5"
                      >
                        <MdDirections size={14} /> Customer Map
                      </button>
                    </div>
                    <p className="text-xs font-bold text-(--color-base-content)">
                      {order.deliveryAddress?.name || "Customer"}
                    </p>
                    <p className="text-[11px] text-(--color-secondary) line-clamp-1">
                      {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                    </p>
                  </div>
                </div>

                {/* Expandable Item Breakdown Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-(--color-base-200)/40 border-t border-(--color-secondary)/20 space-y-3">
                    <h4 className="text-xs font-bold text-(--color-base-content)">
                      Ordered Items ({order.orderItems?.length})
                    </h4>
                    <div className="space-y-1.5">
                      {order.orderItems?.map((item, idx) => (
                        <div
                          key={item.itemId || idx}
                          className="flex justify-between items-center text-xs py-1 border-b border-(--color-secondary)/10"
                        >
                          <span className="font-medium text-(--color-base-content)">
                            {item.quantity}x {item.itemName}
                          </span>
                          <span className="text-(--color-secondary) font-mono">
                            ₹{item.itemPrice}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 font-bold text-(--color-base-content)">
                      <span>Customer Phone:</span>
                      <span className="font-mono">
                        {order.customerId?.customerId?.phone || "Hidden for privacy"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="p-3 bg-(--color-base-100) border-t border-(--color-secondary)/20 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                    className="text-xs text-(--color-secondary) hover:text-(--color-primary) flex items-center gap-1 font-semibold"
                  >
                    {isExpanded ? "Hide Details" : "View Ordered Items"}
                    {isExpanded ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Available Pool Claim Action */}
                    {isAvailableTab && (
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={isActionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <RiLoader4Fill className="animate-spin" />
                        ) : (
                          <MdCheckCircle size={16} />
                        )}
                        Accept Delivery (₹40)
                      </button>
                    )}

                    {/* Active Order Actions */}
                    {isActiveTab && (
                      <>
                        <button
                          onClick={() => handleOpenNavigation(order.deliveryAddress)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                        >
                          <MdDirections size={16} />
                          Open Google Maps
                        </button>

                        {["ready", "accepted"].includes(order.orderStatus) && (
                          <button
                            onClick={() => handlePickup(order._id)}
                            disabled={isActionLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isActionLoading && <RiLoader4Fill className="animate-spin" />}
                            Confirm Food Pickup
                          </button>
                        )}

                        {order.orderStatus === "pickedUp" && (
                          <button
                            onClick={() =>
                              handleOutForDelivery(order._id, order.deliveryAddress)
                            }
                            disabled={isActionLoading}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isActionLoading && <RiLoader4Fill className="animate-spin" />}
                            Start Delivery (Out for Delivery)
                          </button>
                        )}

                        {order.orderStatus === "outForDelivery" && (
                          <>
                            {order.deliveryConfirmation?.riderConfirmed ? (
                              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 px-3.5 py-2 rounded-xl text-xs font-bold">
                                <MdCheckCircle size={15} />
                                Waiting for Customer Confirmation
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDeliver(order._id)}
                                disabled={isActionLoading}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isActionLoading && <RiLoader4Fill className="animate-spin" />}
                                Mark Delivered
                              </button>
                            )}
                            <button
                              onClick={() => handleUndeliverable(order._id)}
                              disabled={isActionLoading}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1 disabled:opacity-50"
                            >
                              <MdCancel size={14} /> Undeliverable
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