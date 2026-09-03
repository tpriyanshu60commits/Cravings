import { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import AdminOrderDetailModal from "./AdminOrderDetailModal";
import {
  MdOutlineReceiptLong,
  MdRefresh,
  MdSearch,
  MdVisibility,
  MdClose,
  MdAccessTime,
  MdStore,
} from "react-icons/md";
import { FaShoppingCart, FaMotorcycle } from "react-icons/fa";

const statusBadges = {
  pending: { label: "Pending", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  accepted: { label: "Accepted", bg: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  preparing: { label: "Preparing", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  ready: { label: "Food Ready", bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  pickedUp: { label: "Picked Up", bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  outForDelivery: { label: "Out for Delivery", bg: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
  delivered: { label: "Delivered", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  cancelled: { label: "Cancelled", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  failed: { label: "Failed", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  rejected: { label: "Rejected", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  undeliverable: { label: "Undeliverable", bg: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
};

const AdminOrders = ({ initialFilter = "all" }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState(initialFilter || "all");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [prevFilter, setPrevFilter] = useState(initialFilter);
  if (initialFilter !== prevFilter) {
    setPrevFilter(initialFilter);
    setSelectedStatusTab(initialFilter || "all");
  }

  const fetchOrders = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const params = {};
      if (searchQuery.trim() !== "") {
        params.search = searchQuery.trim();
      }

      const res = await api.get("/admin/orders", { params });
      if (Array.isArray(res.data?.data)) {
        setOrders(res.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch platform orders",
      );
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const loadInitialOrders = async () => {
      try {
        const params = {};
        if (searchQuery.trim() !== "") {
          params.search = searchQuery.trim();
        }
        const res = await api.get("/admin/orders", { params });
        if (isMounted) {
          if (Array.isArray(res.data?.data)) {
            setOrders(res.data.data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to fetch platform orders",
          );
          setIsLoading(false);
        }
      }
    };
    loadInitialOrders();
    // Auto-poll orders every 15 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchOrders, searchQuery]);

  const handleOpenDetail = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  // Filter calculations
  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;
  const acceptedCount = orders.filter((o) => o.orderStatus === "accepted").length;
  const preparingCount = orders.filter((o) => o.orderStatus === "preparing").length;
  const readyCount = orders.filter((o) => o.orderStatus === "ready").length;
  const transitCount = orders.filter((o) =>
    ["pickedUp", "outForDelivery"].includes(o.orderStatus),
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;
  const cancelledCount = orders.filter((o) =>
    ["cancelled", "failed", "rejected", "undeliverable"].includes(o.orderStatus),
  ).length;

  const filteredOrders = orders.filter((order) => {
    // Status Tab Filtering
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
      selectedStatusTab === "cancelled" &&
      !["cancelled", "failed", "rejected", "undeliverable"].includes(order.orderStatus)
    )
      return false;

    // Search Query Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const idMatch = order._id?.toLowerCase().includes(q);
      const customerMatch = (
        order.deliveryAddress?.name ||
        order.customerId?.customerId?.fullName ||
        ""
      )
        .toLowerCase()
        .includes(q);
      const restaurantMatch = (
        order.restaurantId?.restaurantName || ""
      )
        .toLowerCase()
        .includes(q);
      const riderMatch = (
        order.riderId?.riderId?.fullName || ""
      )
        .toLowerCase()
        .includes(q);
      const phoneMatch = (
        order.deliveryAddress?.phone ||
        order.customerId?.customerId?.phone ||
        ""
      ).includes(q);
      const addressMatch = (
        order.deliveryAddress?.address ||
        order.deliveryAddress?.city ||
        ""
      )
        .toLowerCase()
        .includes(q);

      return idMatch || customerMatch || restaurantMatch || riderMatch || phoneMatch || addressMatch;
    }

    return true;
  });

  const filterTabs = [
    { key: "all", label: "All Orders", count: orders.length },
    { key: "pending", label: "Pending", count: pendingCount, highlight: pendingCount > 0 },
    { key: "accepted", label: "Accepted", count: acceptedCount },
    { key: "preparing", label: "Preparing", count: preparingCount },
    { key: "ready", label: "Ready", count: readyCount, highlight: readyCount > 0 },
    { key: "transit", label: "In Transit", count: transitCount },
    { key: "delivered", label: "Delivered", count: deliveredCount },
    { key: "cancelled", label: "Cancelled / Failed", count: cancelledCount },
  ];

  if (isLoading) return <Loader height="70vh" width="100%" />;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <FaShoppingCart className="text-[#f97316]" size={22} />
            Platform Orders & Dispatch
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Real-time platform-wide order monitor, manual courier dispatch, and status controls
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <MdSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#537770]"
            />
            <input
              type="text"
              placeholder="Search by Order ID, customer, restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#041916] border border-teal-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white placeholder-[#537770] transition-colors"
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
            className="p-2.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
            title="Refresh Orders"
          >
            <MdRefresh
              size={18}
              className={isRefreshing ? "animate-spin text-[#f97316]" : ""}
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
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
              selectedStatusTab === tab.key
                ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
                : tab.highlight
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
                : "bg-[#041916] text-[#8faea7] hover:text-white border border-teal-800/60 hover:bg-teal-900/30"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedStatusTab === tab.key
                  ? "bg-white/20 text-white"
                  : tab.highlight
                  ? "bg-amber-500 text-white"
                  : "bg-teal-900/60 text-white"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#072420] rounded-2xl border border-dashed border-teal-800/60 p-12 text-center space-y-3 shadow-xl shadow-black/40">
          <div className="w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
            <MdOutlineReceiptLong size={32} />
          </div>
          <h3 className="text-sm font-bold text-white">
            No orders found
          </h3>
          <p className="text-xs text-[#8faea7] max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}".`
              : `There are currently no orders in the selected "${selectedStatusTab}" status.`}
          </p>
        </div>
      ) : (
        <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-3">
            {filteredOrders.map((order) => {
              const badge = statusBadges[order.orderStatus] || {
                label: order.orderStatus,
                bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
              };
              const customer = order.customerId?.customerId;
              const restaurant = order.restaurantId;
              const rider = order.riderId?.riderId;

              return (
                <div
                  key={order._id}
                  className="bg-[#041916] p-4 rounded-xl border border-teal-800/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-mono font-bold text-xs text-white">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-[#8faea7] flex items-center gap-1 mt-0.5">
                        <MdAccessTime size={11} />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-IN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-teal-900/40">
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Restaurant</p>
                      <p className="font-bold text-white truncate flex items-center gap-1">
                        <MdStore size={12} className="text-[#f97316] shrink-0" />
                        {restaurant?.restaurantName || "Restaurant"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Customer</p>
                      <p className="font-semibold text-white truncate">
                        {order.deliveryAddress?.name || customer?.fullName || "Customer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Assigned Courier</p>
                      {rider ? (
                        <p className="text-xs text-emerald-300 font-semibold truncate flex items-center gap-1">
                          <FaMotorcycle size={11} /> {rider.fullName}
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-400 italic">Unassigned</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Amount</p>
                      <p className="font-bold text-white">
                        ₹{order.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-teal-900/40">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                        order.paymentDetails?.paymentStatus === "completed"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {(order.paymentDetails?.paymentMethod || "online").toUpperCase()} •{" "}
                      {order.paymentDetails?.paymentStatus || "pending"}
                    </span>
                    <button
                      onClick={() => handleOpenDetail(order._id)}
                      className="px-3 py-1.5 rounded-xl border border-teal-800/60 bg-[#072420] hover:bg-teal-900/30 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <MdVisibility size={14} className="text-[#f97316]" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#041916] text-[#8faea7] font-bold uppercase text-[10px] tracking-wider border-b border-teal-900/60">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Assigned Courier</th>
                  <th className="py-3.5 px-4">Amount & Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/40 text-white">
                {filteredOrders.map((order) => {
                  const badge = statusBadges[order.orderStatus] || {
                    label: order.orderStatus,
                    bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
                  };
                  const customer = order.customerId?.customerId;
                  const restaurant = order.restaurantId;
                  const rider = order.riderId?.riderId;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-teal-900/20 transition"
                    >
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-xs text-white">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-[#8faea7] flex items-center gap-1 mt-0.5">
                          <MdAccessTime size={11} />
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "N/A"}
                        </p>
                      </td>

                      {/* Restaurant */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-xs text-white flex items-center gap-1">
                          <MdStore size={13} className="text-[#f97316]" />
                          {restaurant?.restaurantName || "Restaurant Partner"}
                        </p>
                        <p className="text-[10px] text-[#8faea7]">
                          {order.orderItems?.length || 0} items ordered
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-xs text-white">
                          {order.deliveryAddress?.name || customer?.fullName || "Customer"}
                        </p>
                        <p className="text-[10px] text-[#8faea7]">
                          {order.deliveryAddress?.phone || customer?.phone || "No phone"}
                        </p>
                      </td>

                      {/* Assigned Rider */}
                      <td className="py-3.5 px-4">
                        {rider ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                            <FaMotorcycle size={13} className="text-emerald-400" />
                            <span>{rider.fullName || "Assigned"}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Amount & Payment */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-xs text-white">
                          ₹{order.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                        </p>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                            order.paymentDetails?.paymentStatus === "completed"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {(order.paymentDetails?.paymentMethod || "online").toUpperCase()} •{" "}
                          {order.paymentDetails?.paymentStatus || "pending"}
                        </span>
                      </td>

                      {/* Order Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border inline-block ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(order._id)}
                          className="px-2.5 py-1.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white font-semibold text-xs transition flex items-center gap-1 ml-auto cursor-pointer"
                          title="View Order Details & Dispatch"
                        >
                          <MdVisibility size={14} className="text-[#f97316]" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {isDetailModalOpen && (
        <AdminOrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          onUpdateSuccess={fetchOrders}
        />
      )}
    </div>
  );
};

export default AdminOrders;
