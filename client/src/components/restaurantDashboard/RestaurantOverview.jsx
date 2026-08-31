import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdOutlineReceiptLong,
  MdPendingActions,
  MdOutdoorGrill,
  MdCheckCircle,
  MdAttachMoney,
  MdRestaurantMenu,
  MdRefresh,
  MdArrowForward,
  MdStorefront,
} from "react-icons/md";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  pending: { label: "Pending", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  accepted: { label: "Accepted", bg: "bg-blue-100 text-blue-800 border-blue-300" },
  preparing: { label: "Preparing", bg: "bg-purple-100 text-purple-800 border-purple-300" },
  ready: { label: "Ready", bg: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  pickedUp: { label: "Picked Up", bg: "bg-cyan-100 text-cyan-800 border-cyan-300" },
  outForDelivery: { label: "Out for Delivery", bg: "bg-teal-100 text-teal-800 border-teal-300" },
  delivered: { label: "Delivered", bg: "bg-green-100 text-green-800 border-green-300" },
  cancelled: { label: "Cancelled", bg: "bg-red-100 text-red-800 border-red-300" },
  failed: { label: "Failed", bg: "bg-rose-100 text-rose-800 border-rose-300" },
  rejected: { label: "Rejected", bg: "bg-rose-100 text-rose-800 border-rose-300" },
};

const RestaurantOverview = ({ setActiveTab }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);

  const fetchOverviewData = async () => {
    try {
      setIsLoading(true);
      const [restRes, ordersRes, menuRes] = await Promise.allSettled([
        api.get("/restaurant/get-restaurant-data"),
        api.get("/restaurant/orders"),
        api.get("/restaurant/menu-items"),
      ]);

      if (restRes.status === "fulfilled" && restRes.value.data?.data) {
        setRestaurant(restRes.value.data.data);
      }
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data?.data)) {
        setOrders(ordersRes.value.data.data);
      }
      if (menuRes.status === "fulfilled" && Array.isArray(menuRes.value.data?.data)) {
        setMenuItems(menuRes.value.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load restaurant overview",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleToggleStoreOpen = async () => {
    if (!restaurant) return;
    try {
      setIsTogglingOpen(true);
      const nextStatus = !restaurant.isOpen;
      const res = await api.patch(`/restaurant/change-open-status/${nextStatus}`);
      setRestaurant((prev) => ({ ...prev, isOpen: nextStatus }));
      toast.success(res.data?.message || `Restaurant is now ${nextStatus ? "open" : "offline"}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change store status",
      );
    } finally {
      setIsTogglingOpen(false);
    }
  };

  if (isLoading) return <Loader height="70vh" width="100%" />;

  const pendingOrders = orders.filter((o) => o.orderStatus === "pending");
  const activeOrders = orders.filter((o) =>
    ["accepted", "preparing", "ready"].includes(o.orderStatus),
  );
  const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered");
  const totalRevenue = deliveredOrders.reduce(
    (sum, o) => sum + (Number(o.billDetails?.finalAmount) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-(--color-base-100) p-6 rounded-2xl border border-(--color-base-300) shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-(--color-primary)/10 border-2 border-(--color-primary) flex items-center justify-center text-(--color-primary) font-bold overflow-hidden shrink-0">
            {restaurant?.coverImage?.url ? (
              <img
                src={restaurant.coverImage.url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <MdStorefront size={32} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-(--color-base-content)">
                {restaurant?.restaurantName || "My Restaurant"}
              </h1>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  restaurant?.isOpen
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                {restaurant?.isOpen ? "LIVE & ACCEPTING ORDERS" : "OFFLINE"}
              </span>
            </div>
            <p className="text-xs text-(--color-secondary) mt-1">
              {restaurant?.address
                ? `${restaurant.address}, ${restaurant.city || ""}`
                : "Configure your restaurant address in settings"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={fetchOverviewData}
            className="p-2.5 rounded-xl border border-(--color-base-300) hover:bg-(--color-base-200) text-(--color-base-content) transition"
            title="Refresh Data"
          >
            <MdRefresh size={18} />
          </button>

          <button
            onClick={handleToggleStoreOpen}
            disabled={isTogglingOpen}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
              restaurant?.isOpen
                ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
            }`}
          >
            {isTogglingOpen && <RiLoader4Fill className="animate-spin" />}
            {restaurant?.isOpen ? "Go Offline" : "Open Restaurant (Go Live)"}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Orders */}
        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className={`cursor-pointer p-5 rounded-2xl border transition hover:shadow-md ${
            pendingOrders.length > 0
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-(--color-base-100) border-(--color-base-300)"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-(--color-secondary)">
                New / Pending
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {pendingOrders.length}
              </h3>
              <p className="text-[10px] text-amber-700 font-medium mt-1">
                {pendingOrders.length > 0 ? "Requires your acceptance" : "No pending orders"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600">
              <MdPendingActions size={22} />
            </div>
          </div>
        </div>

        {/* In Kitchen / In Progress */}
        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="cursor-pointer p-5 rounded-2xl bg-(--color-base-100) border border-(--color-base-300) transition hover:shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-(--color-secondary)">
                Kitchen Active
              </p>
              <h3 className="text-2xl font-black text-(--color-primary) mt-1">
                {activeOrders.length}
              </h3>
              <p className="text-[10px] text-(--color-secondary) mt-1">
                Accepted, preparing & ready
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-(--color-primary)/10 text-(--color-primary)">
              <MdOutdoorGrill size={22} />
            </div>
          </div>
        </div>

        {/* Delivered / Completed Orders */}
        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="cursor-pointer p-5 rounded-2xl bg-(--color-base-100) border border-(--color-base-300) transition hover:shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-(--color-secondary)">
                Total Delivered
              </p>
              <h3 className="text-2xl font-black text-green-600 mt-1">
                {deliveredOrders.length}
              </h3>
              <p className="text-[10px] text-green-700 mt-1">
                Completed orders
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-600">
              <MdCheckCircle size={22} />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-(--color-base-100) border border-(--color-base-300)">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-(--color-secondary)">
                Total Revenue
              </p>
              <h3 className="text-2xl font-black text-(--color-base-content) mt-1">
                ₹{totalRevenue.toFixed(2)}
              </h3>
              <p className="text-[10px] text-(--color-secondary) mt-1">
                From delivered orders
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <MdAttachMoney size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="p-4 bg-(--color-base-100) border border-(--color-base-300) rounded-2xl flex items-center justify-between hover:border-(--color-primary) hover:bg-(--color-primary)/5 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-(--color-primary) rounded-xl">
              <MdOutlineReceiptLong size={20} />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-(--color-base-content)">
                Manage Orders
              </h4>
              <p className="text-[10px] text-(--color-secondary)">
                Accept, prepare & track orders
              </p>
            </div>
          </div>
          <MdArrowForward className="text-(--color-secondary) group-hover:text-(--color-primary) group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("menu")}
          className="p-4 bg-(--color-base-100) border border-(--color-base-300) rounded-2xl flex items-center justify-between hover:border-(--color-primary) hover:bg-(--color-primary)/5 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
              <MdRestaurantMenu size={20} />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-(--color-base-content)">
                Manage Menu ({menuItems.length} items)
              </h4>
              <p className="text-[10px] text-(--color-secondary)">
                Add, edit items & toggle availability
              </p>
            </div>
          </div>
          <MdArrowForward className="text-(--color-secondary) group-hover:text-(--color-primary) group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("settings")}
          className="p-4 bg-(--color-base-100) border border-(--color-base-300) rounded-2xl flex items-center justify-between hover:border-(--color-primary) hover:bg-(--color-primary)/5 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <MdStorefront size={20} />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-(--color-base-content)">
                Restaurant Settings
              </h4>
              <p className="text-[10px] text-(--color-secondary)">
                Update profile, timing & address
              </p>
            </div>
          </div>
          <MdArrowForward className="text-(--color-secondary) group-hover:text-(--color-primary) group-hover:translate-x-1 transition" />
        </button>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-(--color-base-100) p-6 rounded-2xl border border-(--color-base-300) shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-(--color-base-content)">
              Recent Incoming Orders
            </h2>
            <p className="text-[10px] text-(--color-secondary)">
              Showing the latest orders received
            </p>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab("orders")}
            className="text-xs text-(--color-primary) font-semibold hover:underline flex items-center gap-1"
          >
            View All ({orders.length}) <MdArrowForward />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 bg-(--color-base-200) rounded-xl">
            <MdOutlineReceiptLong className="text-4xl text-(--color-secondary) mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-(--color-base-content)">
              No orders received yet
            </p>
            <p className="text-[10px] text-(--color-secondary) mt-0.5">
              New customer orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-(--color-base-300) text-(--color-secondary) uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/50">
                {orders.slice(0, 5).map((order) => {
                  const badge = statusBadges[order.orderStatus] || {
                    label: order.orderStatus,
                    bg: "bg-gray-100 text-gray-700 border-gray-300",
                  };
                  return (
                    <tr key={order._id} className="hover:bg-(--color-base-200)/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-(--color-base-content)">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-(--color-base-content)">
                          {order.deliveryAddress?.name || order.customerId?.fullName || "Customer"}
                        </div>
                        <div className="text-[10px] text-(--color-secondary)">
                          {order.deliveryAddress?.city || ""}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-(--color-base-content)">
                          {order.orderItems?.length || 0} item(s)
                        </span>
                        <div className="text-[10px] text-(--color-secondary) truncate max-w-40">
                          {order.orderItems?.map((i) => `${i.quantity}x ${i.itemName}`).join(", ")}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-(--color-base-content)">
                        ₹{order.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.paymentDetails?.paymentStatus === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {order.paymentDetails?.paymentStatus === "completed" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setActiveTab && setActiveTab("orders")}
                          className="px-3 py-1 bg-(--color-primary) text-(--color-primary-content) text-[11px] font-semibold rounded-lg hover:opacity-90 transition"
                        >
                          {order.orderStatus === "pending"
                            ? "Accept"
                            : order.orderStatus === "accepted"
                            ? "Prepare"
                            : order.orderStatus === "preparing"
                            ? "Mark Ready"
                            : "Details"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOverview;