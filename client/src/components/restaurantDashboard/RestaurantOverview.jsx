import { useState, useEffect } from "react";
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
  pending: { label: "Pending", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  accepted: { label: "Accepted", bg: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  preparing: { label: "Preparing", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  ready: { label: "Ready", bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  pickedUp: { label: "Picked Up", bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  outForDelivery: { label: "Out for Delivery", bg: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
  delivered: { label: "Delivered", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  cancelled: { label: "Cancelled", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  failed: { label: "Failed", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  rejected: { label: "Rejected", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
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
    let isMounted = true;
    const loadOverview = async () => {
      try {
        const [restRes, ordersRes, menuRes] = await Promise.allSettled([
          api.get("/restaurant/get-restaurant-data"),
          api.get("/restaurant/orders"),
          api.get("/restaurant/menu-items"),
        ]);

        if (isMounted) {
          if (restRes.status === "fulfilled" && restRes.value.data?.data) {
            setRestaurant(restRes.value.data.data);
          }
          if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value.data?.data)) {
            setOrders(ordersRes.value.data.data);
          }
          if (menuRes.status === "fulfilled" && Array.isArray(menuRes.value.data?.data)) {
            setMenuItems(menuRes.value.data.data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to load restaurant overview",
          );
          setIsLoading(false);
        }
      }
    };
    loadOverview();
    return () => {
      isMounted = false;
    };
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
      {/* Header Banner / Restaurant Information Card */}
      <div className="bg-[#072420] p-6 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#041916] border-2 border-orange-500/40 flex items-center justify-center text-[#ea580c] font-bold overflow-hidden shrink-0 shadow-inner">
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {restaurant?.restaurantName || "My Restaurant"}
              </h1>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  restaurant?.isOpen
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-stone-800/80 text-stone-400 border-stone-700"
                }`}
              >
                {restaurant?.isOpen ? "LIVE & ACCEPTING ORDERS" : "OFFLINE"}
              </span>
            </div>
            <p className="text-xs text-[#8faea7] mt-1">
              {restaurant?.address
                ? `${restaurant.address}, ${restaurant.city || ""}`
                : "Configure your restaurant address in settings"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={fetchOverviewData}
            className="p-2.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-[#06211c] text-[#8faea7] hover:text-white transition cursor-pointer"
            title="Refresh Data"
          >
            <MdRefresh size={18} />
          </button>

          <button
            onClick={handleToggleStoreOpen}
            disabled={isTogglingOpen}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition border cursor-pointer ${
              restaurant?.isOpen
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
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
          className={`cursor-pointer p-5 rounded-2xl border transition hover:shadow-xl hover:scale-[1.01] ${
            pendingOrders.length > 0
              ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-950/20"
              : "bg-[#072420] border-teal-800/40 shadow-lg shadow-black/30"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-[#8faea7]">
                New / Pending
              </p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">
                {pendingOrders.length}
              </h3>
              <p className="text-[10px] text-amber-300 font-medium mt-1">
                {pendingOrders.length > 0 ? "Requires your acceptance" : "No pending orders"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <MdPendingActions size={22} />
            </div>
          </div>
        </div>

        {/* In Kitchen / In Progress */}
        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="cursor-pointer p-5 rounded-2xl bg-[#072420] border border-teal-800/40 transition hover:shadow-xl hover:scale-[1.01] hover:border-orange-500/40 shadow-lg shadow-black/30"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-[#8faea7]">
                Kitchen Active
              </p>
              <h3 className="text-2xl font-black text-[#f97316] mt-1">
                {activeOrders.length}
              </h3>
              <p className="text-[10px] text-[#8faea7] mt-1">
                Accepted, preparing & ready
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-500/15 text-[#f97316]">
              <MdOutdoorGrill size={22} />
            </div>
          </div>
        </div>

        {/* Delivered / Completed Orders */}
        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="cursor-pointer p-5 rounded-2xl bg-[#072420] border border-teal-800/40 transition hover:shadow-xl hover:scale-[1.01] hover:border-emerald-500/40 shadow-lg shadow-black/30"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-[#8faea7]">
                Total Delivered
              </p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">
                {deliveredOrders.length}
              </h3>
              <p className="text-[10px] text-emerald-300 mt-1">
                Completed orders
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <MdCheckCircle size={22} />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#072420] border border-teal-800/40 shadow-lg shadow-black/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-[#8faea7]">
                Total Revenue
              </p>
              <h3 className="text-2xl font-black text-white mt-1">
                ₹{totalRevenue.toFixed(2)}
              </h3>
              <p className="text-[10px] text-[#8faea7] mt-1">
                From delivered orders
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <MdAttachMoney size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="p-4 bg-[#072420] border border-teal-800/40 rounded-2xl flex items-center justify-between hover:border-orange-500/50 hover:bg-[#0a322c] transition group cursor-pointer text-left shadow-md shadow-black/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/15 text-orange-400 rounded-xl">
              <MdOutlineReceiptLong size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                Manage Orders
              </h4>
              <p className="text-[10px] text-[#8faea7]">
                Accept, prepare & track orders
              </p>
            </div>
          </div>
          <MdArrowForward className="text-[#8faea7] group-hover:text-orange-400 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("menu")}
          className="p-4 bg-[#072420] border border-teal-800/40 rounded-2xl flex items-center justify-between hover:border-orange-500/50 hover:bg-[#0a322c] transition group cursor-pointer text-left shadow-md shadow-black/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/15 text-purple-400 rounded-xl">
              <MdRestaurantMenu size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                Manage Menu ({menuItems.length} items)
              </h4>
              <p className="text-[10px] text-[#8faea7]">
                Add, edit items & toggle availability
              </p>
            </div>
          </div>
          <MdArrowForward className="text-[#8faea7] group-hover:text-orange-400 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("settings")}
          className="p-4 bg-[#072420] border border-teal-800/40 rounded-2xl flex items-center justify-between hover:border-orange-500/50 hover:bg-[#0a322c] transition group cursor-pointer text-left shadow-md shadow-black/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl">
              <MdStorefront size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                Restaurant Settings
              </h4>
              <p className="text-[10px] text-[#8faea7]">
                Update profile, timing & address
              </p>
            </div>
          </div>
          <MdArrowForward className="text-[#8faea7] group-hover:text-orange-400 group-hover:translate-x-1 transition" />
        </button>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#072420] p-6 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white">
              Recent Incoming Orders
            </h2>
            <p className="text-[10px] text-[#8faea7]">
              Showing the latest orders received
            </p>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab("orders")}
            className="text-xs text-[#ea580c] hover:text-[#f97316] font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            View All ({orders.length}) <MdArrowForward />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 bg-[#041916] rounded-2xl border border-teal-900/40">
            <MdOutlineReceiptLong className="text-4xl text-[#8faea7] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-white">
              No orders received yet
            </p>
            <p className="text-[10px] text-[#8faea7] mt-0.5">
              New customer orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-teal-900/60 text-[#8faea7] uppercase text-[10px]">
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
              <tbody className="divide-y divide-teal-900/40">
                {orders.slice(0, 5).map((order) => {
                  const badge = statusBadges[order.orderStatus] || {
                    label: order.orderStatus,
                    bg: "bg-stone-800 text-stone-300 border-stone-700",
                  };
                  return (
                    <tr key={order._id} className="hover:bg-teal-900/20 transition">
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">
                          {order.deliveryAddress?.name || order.customerId?.fullName || "Customer"}
                        </div>
                        <div className="text-[10px] text-[#8faea7]">
                          {order.deliveryAddress?.city || ""}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-[#d8eae6]">
                          {order.orderItems?.length || 0} item(s)
                        </span>
                        <div className="text-[10px] text-[#8faea7] truncate max-w-40">
                          {order.orderItems?.map((i) => `${i.quantity}x ${i.itemName}`).join(", ")}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        ₹{order.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            order.paymentDetails?.paymentStatus === "completed"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
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
                          className="px-3 py-1 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition shadow-sm cursor-pointer"
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