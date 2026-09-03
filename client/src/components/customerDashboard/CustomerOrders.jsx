import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import CustomerOrderDetailsModal from "./CustomerOrderDetailsModal";
import {
  IoReceiptOutline,
  IoStorefrontOutline,
  IoChevronForward,
  IoRefreshOutline,
} from "react-icons/io5";

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "outfordelivery":
    case "pickedup":
      return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
    case "preparing":
    case "ready":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "accepted":
      return "bg-purple-500/15 text-purple-300 border border-purple-500/30";
    case "pending":
      return "bg-orange-500/15 text-orange-300 border border-orange-500/30";
    case "cancelled":
    case "failed":
    case "rejected":
      return "bg-rose-500/15 text-rose-300 border border-rose-500/30";
    default:
      return "bg-teal-500/15 text-teal-300 border border-teal-500/30";
  }
};

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchOrders = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);

      const res = await api.get("/customer/all-orders");
      setOrders(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      try {
        const res = await api.get("/customer/all-orders");
        if (isMounted) {
          setOrders(res.data.data || []);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.message || "Failed to fetch orders");
          setIsLoading(false);
        }
      }
    };
    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-h-[88vh] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">My Orders</h2>
          <p className="text-xs text-[#8faea7] mt-0.5">
            View your current active orders and past ordering history.
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#041916] hover:bg-teal-900/30 text-white text-xs font-semibold rounded-xl border border-teal-800/60 transition cursor-pointer"
        >
          <IoRefreshOutline className={`text-sm ${isRefreshing ? "animate-spin text-orange-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <Loader height="300px" width="100%" />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-[#072420] rounded-2xl border border-teal-800/40 space-y-3 shadow-xl shadow-black/40">
          <IoReceiptOutline className="text-5xl mx-auto text-[#8faea7] opacity-40" />
          <p className="text-sm font-semibold text-white">
            No orders placed yet
          </p>
          <p className="text-xs text-[#8faea7] max-w-sm mx-auto">
            Explore our curated selection of local restaurants and satisfy your cravings today.
          </p>
          <Link
            to="/order-now"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-bold rounded-xl hover:opacity-95 transition shadow-md shadow-orange-950/40"
          >
            Order Food Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemsSummary =
              order.orderItems?.map((it) => `${it.quantity}x ${it.itemName}`).join(", ") ||
              "Food items";

            return (
              <div
                key={order._id}
                className="bg-[#072420] rounded-2xl border border-teal-800/40 p-4 sm:p-5 shadow-xl shadow-black/40 hover:border-teal-700/60 transition flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                {/* Left section: Restaurant & items */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <IoStorefrontOutline className="text-[#f97316]" />
                      {order.restaurantId?.restaurantName || "Restaurant"}
                    </span>
                    <span className="text-teal-700">•</span>
                    <span className="text-[11px] text-[#8faea7]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#8faea7] line-clamp-1">
                    {itemsSummary}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      ● {order.orderStatus}
                    </span>

                    <span className="text-sm font-bold text-[#f97316]">
                      ₹{order.billDetails?.finalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right section: Action buttons */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-teal-900/40">
                  <button
                    onClick={() => handleOpenDetails(order._id)}
                    className="px-3.5 py-2 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-xs font-semibold text-[#8faea7] hover:text-white transition cursor-pointer"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => navigate(`/order-tracking/${order._id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-bold hover:opacity-95 transition shadow-md shadow-orange-950/40 cursor-pointer"
                  >
                    <span>Track Order</span>
                    <IoChevronForward className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isDetailsModalOpen && (
        <CustomerOrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};

export default CustomerOrders;
