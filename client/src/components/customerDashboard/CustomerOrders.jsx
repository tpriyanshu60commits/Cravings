import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import CustomerOrderDetailsModal from "./CustomerOrderDetailsModal";
import {
  IoReceiptOutline,
  IoStorefrontOutline,
  IoLocationOutline,
  IoChevronForward,
  IoRefreshOutline,
} from "react-icons/io5";

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "outfordelivery":
    case "pickedup":
      return "bg-blue-100 text-blue-800";
    case "preparing":
    case "ready":
      return "bg-amber-100 text-amber-800";
    case "accepted":
      return "bg-purple-100 text-purple-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
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
    fetchOrders();
  }, []);

  const handleOpenDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-h-[88vh] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-(--color-base-content)">My Orders</h2>
          <p className="text-xs text-(--color-secondary) mt-0.5">
            View your current active orders and past ordering history.
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) text-xs font-semibold rounded-xl transition"
        >
          <IoRefreshOutline className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <Loader height="300px" width="100%" />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-(--color-base-100) rounded-2xl border border-(--color-base-300) space-y-3">
          <IoReceiptOutline className="text-5xl mx-auto text-(--color-secondary) opacity-40" />
          <p className="text-sm font-semibold text-(--color-base-content)">
            No orders placed yet
          </p>
          <p className="text-xs text-(--color-secondary) max-w-sm mx-auto">
            Explore our curated selection of local restaurants and satisfy your cravings today.
          </p>
          <Link
            to="/order-now"
            className="inline-block px-5 py-2 bg-(--color-primary) text-(--color-primary-content) text-xs font-semibold rounded-xl hover:opacity-90 transition"
          >
            Order Food Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount =
              order.orderItems?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0;
            const itemsSummary =
              order.orderItems?.map((it) => `${it.quantity}x ${it.itemName}`).join(", ") ||
              "Food items";

            return (
              <div
                key={order._id}
                className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) p-5 shadow-xs hover:border-gray-400 transition flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                {/* Left section: Restaurant & items */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-(--color-base-content) flex items-center gap-1">
                      <IoStorefrontOutline className="text-(--color-primary)" />
                      {order.restaurantId?.restaurantName || "Restaurant"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] text-(--color-secondary)">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-(--color-secondary) line-clamp-1">
                    {itemsSummary}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      ● {order.orderStatus}
                    </span>

                    <span className="text-xs font-bold text-(--color-base-content)">
                      ₹{order.billDetails?.finalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right section: Action buttons */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-(--color-base-300)">
                  <button
                    onClick={() => handleOpenDetails(order._id)}
                    className="px-3 py-1.5 rounded-xl border border-(--color-base-300) hover:bg-(--color-base-200) text-xs font-semibold text-(--color-base-content) transition"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => navigate(`/order-tracking/${order._id}`)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-(--color-primary) text-(--color-primary-content) text-xs font-semibold hover:opacity-90 transition shadow-xs"
                  >
                    Track Order <IoChevronForward className="text-xs" />
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
