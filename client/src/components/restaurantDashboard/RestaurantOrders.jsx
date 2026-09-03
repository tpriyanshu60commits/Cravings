import { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdOutlineReceiptLong,
  MdRefresh,
  MdSearch,
  MdCheckCircle,
  MdDeliveryDining,
  MdLocationOn,
  MdPhone,
  MdPerson,
  MdClose,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdAccessTime,
} from "react-icons/md";
import { FaUtensils, FaCheckDouble, FaBoxOpen } from "react-icons/fa";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  pending: { label: "Pending Acceptance", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  accepted: { label: "Accepted", bg: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  preparing: { label: "Preparing Food", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  ready: { label: "Food Ready", bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  pickedUp: { label: "Picked Up by Rider", bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  outForDelivery: { label: "Out for Delivery", bg: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
  delivered: { label: "Delivered", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  cancelled: { label: "Cancelled", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  failed: { label: "Failed", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  rejected: { label: "Rejected", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const res = await api.get("/restaurant/orders");
      if (Array.isArray(res.data?.data)) {
        setOrders(res.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch restaurant orders",
      );
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialOrders = async () => {
      try {
        const res = await api.get("/restaurant/orders");
        if (isMounted) {
          if (Array.isArray(res.data?.data)) {
            setOrders(res.data.data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to fetch restaurant orders",
          );
          setIsLoading(false);
        }
      }
    };
    loadInitialOrders();
    // Auto-poll orders every 10 seconds for real-time responsiveness
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchOrders]);

  // Status transitions
  const handleAcceptOrder = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/restaurant/orders/${orderId}/accept`);
      toast.success(res.data?.message || "Order accepted successfully");
      await fetchOrders();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to accept order",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePrepareOrder = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/restaurant/orders/${orderId}/preparing`);
      toast.success(res.data?.message || "Order is now being prepared");
      await fetchOrders();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update order to preparing",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReadyOrder = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      const res = await api.patch(`/restaurant/orders/${orderId}/ready`);
      toast.success(res.data?.message || "Order marked ready for pickup");
      await fetchOrders();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark order as ready",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Filter calculation
  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;
  const acceptedCount = orders.filter((o) => o.orderStatus === "accepted").length;
  const preparingCount = orders.filter((o) => o.orderStatus === "preparing").length;
  const readyCount = orders.filter((o) => o.orderStatus === "ready").length;
  const transitCount = orders.filter((o) =>
    ["pickedUp", "outForDelivery"].includes(o.orderStatus),
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;

  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (selectedStatusTab === "pending" && order.orderStatus !== "pending") return false;
    if (selectedStatusTab === "accepted" && order.orderStatus !== "accepted") return false;
    if (selectedStatusTab === "preparing" && order.orderStatus !== "preparing") return false;
    if (selectedStatusTab === "ready" && order.orderStatus !== "ready") return false;
    if (
      selectedStatusTab === "transit" &&
      !["pickedUp", "outForDelivery"].includes(order.orderStatus)
    )
      return false;
    if (selectedStatusTab === "delivered" && order.orderStatus !== "delivered") return false;
    if (
      selectedStatusTab === "other" &&
      !["cancelled", "failed", "rejected"].includes(order.orderStatus)
    )
      return false;

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const idMatch = order._id?.toLowerCase().includes(q);
      const customerNameMatch = (
        order.deliveryAddress?.name ||
        order.customerId?.fullName ||
        ""
      )
        .toLowerCase()
        .includes(q);
      const phoneMatch = (
        order.deliveryAddress?.phone ||
        order.customerId?.phone ||
        ""
      ).includes(q);
      return idMatch || customerNameMatch || phoneMatch;
    }

    return true;
  });

  const filterTabs = [
    { key: "all", label: "All Orders", count: orders.length },
    {
      key: "pending",
      label: "Pending",
      count: pendingCount,
      highlight: pendingCount > 0,
    },
    { key: "accepted", label: "Accepted", count: acceptedCount },
    { key: "preparing", label: "Preparing", count: preparingCount },
    { key: "ready", label: "Ready", count: readyCount },
    { key: "transit", label: "Out for Delivery", count: transitCount },
    { key: "delivered", label: "Delivered", count: deliveredCount },
  ];

  if (isLoading) return <Loader height="70vh" width="100%" />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <MdOutlineReceiptLong className="text-[#ea580c]" size={24} />
            Restaurant Orders
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Accept, manage kitchen workflow & monitor order progress
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <MdSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8faea7]"
            />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#041916] border border-teal-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-white placeholder-[#537770]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8faea7] hover:text-white cursor-pointer"
              >
                <MdClose size={14} />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-[#06211c] text-[#8faea7] hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
            title="Refresh Orders"
          >
            <MdRefresh
              size={18}
              className={isRefreshing ? "animate-spin text-orange-400" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatusTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border cursor-pointer ${
              selectedStatusTab === tab.key
                ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white border-orange-500 shadow-md shadow-orange-950/40"
                : tab.highlight
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                : "bg-[#072420] text-[#8faea7] border-teal-800/40 hover:text-white hover:bg-teal-900/40"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedStatusTab === tab.key
                  ? "bg-white/20 text-white"
                  : tab.highlight
                  ? "bg-amber-500 text-white"
                  : "bg-[#041916] text-[#8faea7]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#072420] rounded-2xl border border-teal-800/40 p-12 text-center space-y-3 shadow-xl shadow-black/30">
          <div className="w-16 h-16 rounded-full bg-[#041916] border border-teal-800/40 flex items-center justify-center mx-auto text-[#8faea7]">
            <MdOutlineReceiptLong size={32} />
          </div>
          <h3 className="text-sm font-bold text-white">
            No orders found
          </h3>
          <p className="text-xs text-[#8faea7] max-w-sm mx-auto">
            {selectedStatusTab === "all"
              ? "Your restaurant has not received any orders yet."
              : `There are currently no orders in "${selectedStatusTab}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = statusBadges[order.orderStatus] || {
              label: order.orderStatus,
              bg: "bg-stone-800 text-stone-300 border-stone-700",
            };
            const isExpanded = expandedOrderId === order._id;
            const isActionLoading = actionLoadingId === order._id;
            const createdAtFormatted = order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "N/A";

            return (
              <div
                key={order._id}
                className={`bg-[#072420] rounded-2xl border transition shadow-xl shadow-black/30 overflow-hidden ${
                  order.orderStatus === "pending"
                    ? "border-amber-500/50 ring-1 ring-amber-500/40 shadow-amber-950/20"
                    : "border-teal-800/40"
                }`}
              >
                {/* Order Summary Header */}
                <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Left: ID & Metadata */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-xl shrink-0 ${
                        order.orderStatus === "pending"
                          ? "bg-amber-500/20 text-amber-400"
                          : order.orderStatus === "accepted"
                          ? "bg-blue-500/20 text-blue-400"
                          : order.orderStatus === "preparing"
                          ? "bg-purple-500/20 text-purple-400"
                          : order.orderStatus === "ready"
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {order.orderStatus === "pending" && <MdAccessTime size={22} />}
                      {order.orderStatus === "accepted" && <FaCheckDouble size={20} />}
                      {order.orderStatus === "preparing" && <FaUtensils size={20} />}
                      {order.orderStatus === "ready" && <FaBoxOpen size={20} />}
                      {["pickedUp", "outForDelivery"].includes(order.orderStatus) && (
                        <MdDeliveryDining size={24} />
                      )}
                      {order.orderStatus === "delivered" && <MdCheckCircle size={22} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-white">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                            order.paymentDetails?.paymentStatus === "completed"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {order.paymentDetails?.paymentStatus === "completed"
                            ? `Paid via ${(order.paymentDetails?.paymentMethod || "online").toUpperCase()}`
                            : "Payment Pending"}
                        </span>
                      </div>

                      <p className="text-xs text-[#8faea7] mt-1 flex items-center gap-1">
                        <MdAccessTime size={13} /> {createdAtFormatted}
                      </p>
                    </div>
                  </div>

                  {/* Center/Right: Customer, Items Count & Final Amount */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold text-white">
                        {order.deliveryAddress?.name || order.customerId?.fullName || "Customer"}
                      </p>
                      <p className="text-[11px] text-[#8faea7]">
                        {order.orderItems?.length || 0} items • ₹{order.billDetails?.finalAmount?.toFixed(2)}
                      </p>
                    </div>

                    {/* Action Flow Button */}
                    <div className="flex items-center gap-2">
                      {order.orderStatus === "pending" && (
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          disabled={isActionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isActionLoading ? (
                            <RiLoader4Fill className="animate-spin" />
                          ) : (
                            <FaCheckDouble size={12} />
                          )}
                          Accept Order
                        </button>
                      )}

                      {order.orderStatus === "accepted" && (
                        <button
                          onClick={() => handlePrepareOrder(order._id)}
                          disabled={isActionLoading}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isActionLoading ? (
                            <RiLoader4Fill className="animate-spin" />
                          ) : (
                            <FaUtensils size={12} />
                          )}
                          Start Preparing
                        </button>
                      )}

                      {order.orderStatus === "preparing" && (
                        <button
                          onClick={() => handleReadyOrder(order._id)}
                          disabled={isActionLoading}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isActionLoading ? (
                            <RiLoader4Fill className="animate-spin" />
                          ) : (
                            <FaBoxOpen size={13} />
                          )}
                          Mark Ready
                        </button>
                      )}

                      {order.orderStatus === "ready" && (
                        <span className="px-3 py-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold rounded-xl flex items-center gap-1">
                          <FaBoxOpen size={12} /> Awaiting Rider
                        </span>
                      )}

                      {["pickedUp", "outForDelivery"].includes(order.orderStatus) && (
                        <span className="px-3 py-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-semibold rounded-xl flex items-center gap-1">
                          <MdDeliveryDining size={15} /> In Transit
                        </span>
                      )}

                      {order.orderStatus === "delivered" && (
                        <span className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold rounded-xl flex items-center gap-1">
                          <MdCheckCircle size={14} /> Completed
                        </span>
                      )}

                      {/* Expand/Collapse Toggle */}
                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="p-2 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-[#06211c] text-[#8faea7] hover:text-white transition cursor-pointer"
                        title={isExpanded ? "Hide Details" : "View Details"}
                      >
                        {isExpanded ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-teal-900/50 p-4 md:p-6 bg-[#041916]/80 space-y-6">
                    {/* Grid of details: Items, Customer, Delivery, Bill */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Column 1: Order Items */}
                      <div className="space-y-3 lg:col-span-2 bg-[#072420] p-4 rounded-xl border border-teal-800/40 shadow-inner">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <FaUtensils className="text-[#ea580c]" size={12} /> Ordered Items
                        </h4>
                        <div className="divide-y divide-teal-900/40">
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3">
                                {item.image?.url ? (
                                  <img
                                    src={item.image.url}
                                    alt={item.itemName}
                                    className="w-10 h-10 rounded-lg object-cover border border-teal-800/60"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-[#041916] border border-teal-800/40 flex items-center justify-center text-xs font-bold text-[#ea580c]">
                                    {item.itemName?.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-white">
                                    {item.itemName}
                                  </p>
                                  <p className="text-[10px] text-[#8faea7]">
                                    Qty: {item.quantity} × ₹{item.itemPrice}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-white">
                                ₹{(Number(item.quantity) * Number(item.itemPrice)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Bill Breakdown */}
                        <div className="border-t border-teal-900/50 pt-3 space-y-1.5 text-[11px] text-[#8faea7]">
                          <div className="flex justify-between">
                            <span>Item Total</span>
                            <span className="text-white">₹{order.billDetails?.totalAmount?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxes & Charges (GST 5%)</span>
                            <span className="text-white">₹{order.billDetails?.taxAmount?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span className="text-white">₹{order.billDetails?.platformFee?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Convenience Fee</span>
                            <span className="text-white">₹{order.billDetails?.convenienceFee?.toFixed(2)}</span>
                          </div>
                          {Number(order.billDetails?.deliveryCharge) > 0 && (
                            <div className="flex justify-between">
                              <span>Delivery Charge</span>
                              <span className="text-white">₹{order.billDetails?.deliveryCharge?.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-xs text-white border-t border-teal-900/50 pt-2 mt-1">
                            <span>Total Paid</span>
                            <span className="text-[#f97316] text-sm font-black">
                              ₹{order.billDetails?.finalAmount?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Customer & Delivery Info */}
                      <div className="space-y-4">
                        {/* Customer Details */}
                        <div className="bg-[#072420] p-4 rounded-xl border border-teal-800/40 space-y-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <MdPerson className="text-[#ea580c]" size={14} /> Customer Information
                          </h4>
                          <div className="text-xs space-y-1 text-[#8faea7]">
                            <p className="font-semibold text-white">
                              {order.deliveryAddress?.name || order.customerId?.fullName || "N/A"}
                            </p>
                            {order.customerId?.email && (
                              <p className="text-[11px]">{order.customerId.email}</p>
                            )}
                            {order.customerId?.phone && (
                              <p className="text-[11px] flex items-center gap-1">
                                <MdPhone size={12} /> {order.customerId.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-[#072420] p-4 rounded-xl border border-teal-800/40 space-y-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <MdLocationOn className="text-[#ea580c]" size={14} /> Delivery Address
                          </h4>
                          <div className="text-xs text-[#8faea7] space-y-0.5">
                            <p className="text-white font-medium">
                              {order.deliveryAddress?.address || "No address provided"}
                            </p>
                            <p>
                              {order.deliveryAddress?.city && `${order.deliveryAddress.city}, `}
                              {order.deliveryAddress?.state || ""} {order.deliveryAddress?.pinCode || ""}
                            </p>
                          </div>
                        </div>

                        {/* Rider Information if Assigned */}
                        {order.riderId && (
                          <div className="bg-[#072420] p-4 rounded-xl border border-teal-800/40 space-y-2">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <MdDeliveryDining className="text-[#ea580c]" size={16} /> Assigned Rider
                            </h4>
                            <div className="text-xs text-[#8faea7] space-y-0.5">
                              <p className="text-white font-semibold">
                                {order.riderId?.fullName || "Rider Assigned"}
                              </p>
                              {order.riderId?.phone && <p>{order.riderId.phone}</p>}
                              {order.riderId?.vehicleDetails?.vehicleNumber && (
                                <p className="text-[10px]">
                                  Vehicle: {order.riderId.vehicleDetails.vehicleNumber} (
                                  {order.riderId.vehicleDetails.vehicleModel || "Bike"})
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;