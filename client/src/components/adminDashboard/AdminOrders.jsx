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
  pending: { label: "Pending", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  accepted: { label: "Accepted", bg: "bg-blue-100 text-blue-800 border-blue-300" },
  preparing: { label: "Preparing", bg: "bg-purple-100 text-purple-800 border-purple-300" },
  ready: { label: "Food Ready", bg: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  pickedUp: { label: "Picked Up", bg: "bg-cyan-100 text-cyan-800 border-cyan-300" },
  outForDelivery: { label: "Out for Delivery", bg: "bg-teal-100 text-teal-800 border-teal-300" },
  delivered: { label: "Delivered", bg: "bg-green-100 text-green-800 border-green-300" },
  cancelled: { label: "Cancelled", bg: "bg-red-100 text-red-800 border-red-300" },
  failed: { label: "Failed", bg: "bg-rose-100 text-rose-800 border-rose-300" },
  rejected: { label: "Rejected", bg: "bg-rose-100 text-rose-800 border-rose-300" },
  undeliverable: { label: "Undeliverable", bg: "bg-orange-100 text-orange-800 border-orange-300" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-(--color-base-content) flex items-center gap-2">
            <FaShoppingCart className="text-(--color-primary)" size={22} />
            Platform Orders & Dispatch
          </h1>
          <p className="text-xs text-(--color-secondary) mt-0.5">
            Real-time platform-wide order monitor, manual courier dispatch, and status controls
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <MdSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-secondary)"
            />
            <input
              type="text"
              placeholder="Search by Order ID, customer, restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-(--color-base-200) border border-(--color-base-300) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-(--color-base-content)"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <MdClose size={14} />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-(--color-base-300) bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) transition flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Refresh Orders"
          >
            <MdRefresh
              size={18}
              className={isRefreshing ? "animate-spin text-(--color-primary)" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatusTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
              selectedStatusTab === tab.key
                ? "bg-(--color-primary) text-(--color-primary-content) border-(--color-primary) shadow-xs"
                : tab.highlight
                ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                : "bg-(--color-base-100) text-(--color-base-content) border-(--color-base-300) hover:bg-(--color-base-200)"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedStatusTab === tab.key
                  ? "bg-white/20 text-(--color-primary-content)"
                  : tab.highlight
                  ? "bg-amber-500 text-white"
                  : "bg-(--color-base-300) text-(--color-base-content)"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-(--color-base-200) flex items-center justify-center mx-auto text-(--color-secondary)">
            <MdOutlineReceiptLong size={32} />
          </div>
          <h3 className="text-sm font-bold text-(--color-base-content)">
            No orders found
          </h3>
          <p className="text-xs text-(--color-secondary) max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}".`
              : `There are currently no orders in the selected "${selectedStatusTab}" status.`}
          </p>
        </div>
      ) : (
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-(--color-base-200) text-(--color-secondary) font-bold uppercase text-[10px] tracking-wider border-b border-(--color-base-300)">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Assigned Courier</th>
                  <th className="py-3 px-4">Amount & Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/60 text-(--color-base-content)">
                {filteredOrders.map((order) => {
                  const badge = statusBadges[order.orderStatus] || {
                    label: order.orderStatus,
                    bg: "bg-gray-100 text-gray-700 border-gray-300",
                  };
                  const customer = order.customerId?.customerId;
                  const restaurant = order.restaurantId;
                  const rider = order.riderId?.riderId;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-(--color-base-200)/40 transition"
                    >
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-xs text-(--color-base-content)">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-(--color-secondary) flex items-center gap-1 mt-0.5">
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
                        <p className="font-bold text-xs text-(--color-base-content flex items-center gap-1">
                          <MdStore size={13} className="text-(--color-primary)" />
                          {restaurant?.restaurantName || "Restaurant Partner"}
                        </p>
                        <p className="text-[10px] text-(--color-secondary)">
                          {order.orderItems?.length || 0} items ordered
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-xs text-(--color-base-content)">
                          {order.deliveryAddress?.name || customer?.fullName || "Customer"}
                        </p>
                        <p className="text-[10px] text-(--color-secondary)">
                          {order.deliveryAddress?.phone || customer?.phone || "No phone"}
                        </p>
                      </td>

                      {/* Assigned Rider */}
                      <td className="py-3.5 px-4">
                        {rider ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                            <FaMotorcycle size={13} className="text-emerald-600" />
                            <span>{rider.fullName || "Assigned"}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Amount & Payment */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-xs text-(--color-base-content)">
                          ₹{order.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                        </p>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                            order.paymentDetails?.paymentStatus === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
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
                          className="px-2.5 py-1.5 rounded-lg border border-(--color-base-300) hover:bg-(--color-base-200) text-(--color-base-content) font-semibold text-xs transition flex items-center gap-1 ml-auto"
                          title="View Order Details & Dispatch"
                        >
                          <MdVisibility size={14} className="text-(--color-primary)" />
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
