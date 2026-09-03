import { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdDashboard,
  MdRefresh,
  MdRestaurant,
  MdDeliveryDining,
  MdPendingActions,
  MdTrendingUp,
  MdOutlineReceiptLong,
  MdArrowForward,
} from "react-icons/md";
import { FaShoppingCart, FaMotorcycle, FaUsers, FaCoins } from "react-icons/fa";

const AdminOverview = ({ setActiveTab, setTabWithFilter }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigateTab = (tab, filter = "all") => {
    if (setTabWithFilter) {
      setTabWithFilter(tab, filter);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  const fetchStats = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const res = await api.get("/admin/dashboard");
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load dashboard metrics",
      );
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialStats = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        if (isMounted && res.data?.data) {
          setStats(res.data.data);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to load dashboard metrics",
          );
          setIsLoading(false);
        }
      }
    };
    loadInitialStats();
    // Poll stats every 15 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchStats]);

  if (isLoading) return <Loader height="70vh" width="100%" />;

  const customers = stats?.customers || { total: 0, verified: 0, pending: 0, suspended: 0 };
  const restaurants = stats?.restaurants || { total: 0, active: 0, pendingApproval: 0, blocked: 0 };
  const riders = stats?.riders || { total: 0, active: 0, available: 0, pendingApproval: 0, blocked: 0 };
  const orders = stats?.orders || { total: 0, activeDeliveries: 0, delivered: 0, cancelled: 0 };
  const revenue = stats?.revenue || { totalRevenue: 0, todayRevenue: 0 };
  const pendingApprovals = stats?.pendingApprovals || { riders: 0, restaurants: 0, customers: 0 };

  const totalPending =
    (pendingApprovals.restaurants || 0) +
    (pendingApprovals.riders || 0) +
    (pendingApprovals.customers || 0);

  return (
    <div className="space-y-6 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <MdDashboard className="text-[#f97316]" size={24} />
            Admin Overview & Analytics
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Real-time platform metrics, revenue tracking, and ecosystem health
          </p>
        </div>

        <button
          onClick={() => fetchStats(true)}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white transition flex items-center gap-2 text-xs font-semibold shrink-0 cursor-pointer"
        >
          <MdRefresh
            size={18}
            className={isRefreshing ? "animate-spin text-[#f97316]" : ""}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Stats"}</span>
        </button>
      </div>

      {/* Pending Action Alerts Banner (if any pending) */}
      {totalPending > 0 && (
        <div className="bg-[#041916] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl shadow-amber-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl shadow-xs">
                <MdPendingActions size={22} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Action Required ({totalPending} Pending Approvals)
                </h3>
                <p className="text-xs text-[#8faea7] mt-0.5">
                  Accounts and partners awaiting administrative verification and review.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {pendingApprovals.restaurants > 0 && (
                <button
                  onClick={() => navigateTab("restaurants", "inactive")}
                  className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{pendingApprovals.restaurants} Restaurants</span>
                  <MdArrowForward size={14} />
                </button>
              )}
              {pendingApprovals.riders > 0 && (
                <button
                  onClick={() => navigateTab("riders", "pending")}
                  className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{pendingApprovals.riders} Riders</span>
                  <MdArrowForward size={14} />
                </button>
              )}
              {pendingApprovals.customers > 0 && (
                <button
                  onClick={() => navigateTab("customers", "pending")}
                  className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{pendingApprovals.customers} Customers</span>
                  <MdArrowForward size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid: Revenue & Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-2 hover:border-emerald-500/40 transition">
          <div className="flex justify-between items-center text-[#8faea7]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <FaCoins size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              ₹{Number(revenue.totalRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-[#8faea7]">
            From completed platform transactions
          </p>
        </div>

        {/* Today's Revenue */}
        <div className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-2 hover:border-indigo-500/40 transition">
          <div className="flex justify-between items-center text-[#8faea7]">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <MdTrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              ₹{Number(revenue.todayRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-[#8faea7]">
            Earned today (since midnight)
          </p>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => navigateTab("orders", "all")}
          className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-2 cursor-pointer hover:border-blue-500/40 transition"
        >
          <div className="flex justify-between items-center text-[#8faea7]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <FaShoppingCart size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {orders.total || 0}
            </span>
          </div>
          <p className="text-[11px] text-[#8faea7]">
            Lifetime orders placed
          </p>
        </div>

        {/* Active Deliveries */}
        <div
          onClick={() => navigateTab("orders", "preparing")}
          className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-2 cursor-pointer hover:border-amber-500/40 transition"
        >
          <div className="flex justify-between items-center text-[#8faea7]">
            <span className="text-xs font-bold uppercase tracking-wider">Active In-Flight</span>
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <MdDeliveryDining size={22} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {orders.activeDeliveries || 0}
            </span>
          </div>
          <p className="text-[11px] text-[#8faea7]">
            Accepted, preparing or out for delivery
          </p>
        </div>
      </div>

      {/* Ecosystem Breakdown Sections: Customers, Restaurants, Riders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Customer Ecosystem */}
        <div className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl">
                <FaUsers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Customers</h3>
                <p className="text-[11px] text-[#8faea7]">Registered customer accounts</p>
              </div>
            </div>
            <button
              onClick={() => navigateTab("customers", "all")}
              className="text-xs font-bold text-[#f97316] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage <MdArrowForward size={14} />
            </button>
          </div>

          <div className="space-y-2 border-t border-teal-900/40 pt-3">
            <div
              onClick={() => navigateTab("customers", "all")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-teal-900/30 p-2 rounded-xl transition"
            >
              <span className="text-[#8faea7]">Total Accounts</span>
              <span className="font-bold text-white">{customers.total}</span>
            </div>
            <div
              onClick={() => navigateTab("customers", "verified")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-emerald-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Verified Active
              </span>
              <span className="font-bold text-emerald-400">{customers.verified}</span>
            </div>
            <div
              onClick={() => navigateTab("customers", "pending")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-amber-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending
              </span>
              <span className="font-bold text-amber-400">{customers.pending}</span>
            </div>
            <div
              onClick={() => navigateTab("customers", "suspended")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-rose-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Suspended
              </span>
              <span className="font-bold text-rose-400">{customers.suspended}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Restaurant Partners */}
        <div className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-xl">
                <MdRestaurant size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Restaurants</h3>
                <p className="text-[11px] text-[#8faea7]">Kitchen partners & listings</p>
              </div>
            </div>
            <button
              onClick={() => navigateTab("restaurants", "all")}
              className="text-xs font-bold text-[#f97316] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage <MdArrowForward size={14} />
            </button>
          </div>

          <div className="space-y-2 border-t border-teal-900/40 pt-3">
            <div
              onClick={() => navigateTab("restaurants", "all")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-teal-900/30 p-2 rounded-xl transition"
            >
              <span className="text-[#8faea7]">Total Restaurants</span>
              <span className="font-bold text-white">{restaurants.total}</span>
            </div>
            <div
              onClick={() => navigateTab("restaurants", "active")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-emerald-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active Verified
              </span>
              <span className="font-bold text-emerald-400">{restaurants.active}</span>
            </div>
            <div
              onClick={() => navigateTab("restaurants", "inactive")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-amber-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending Approval
              </span>
              <span className="font-bold text-amber-400">{restaurants.pendingApproval}</span>
            </div>
            <div
              onClick={() => navigateTab("restaurants", "blocked")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-rose-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Blocked
              </span>
              <span className="font-bold text-rose-400">{restaurants.blocked}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Delivery Fleet (Riders) */}
        <div className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <FaMotorcycle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delivery Fleet</h3>
                <p className="text-[11px] text-[#8faea7]">Delivery riders & couriers</p>
              </div>
            </div>
            <button
              onClick={() => navigateTab("riders", "all")}
              className="text-xs font-bold text-[#f97316] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage <MdArrowForward size={14} />
            </button>
          </div>

          <div className="space-y-2 border-t border-teal-900/40 pt-3">
            <div
              onClick={() => navigateTab("riders", "all")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-teal-900/30 p-2 rounded-xl transition"
            >
              <span className="text-[#8faea7]">Total Riders</span>
              <span className="font-bold text-white">{riders.total}</span>
            </div>
            <div
              onClick={() => navigateTab("riders", "active")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-emerald-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active Approved
              </span>
              <span className="font-bold text-emerald-400">{riders.active}</span>
            </div>
            <div
              onClick={() => navigateTab("riders", "all")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-cyan-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Online & Available
              </span>
              <span className="font-bold text-cyan-400">{riders.available}</span>
            </div>
            <div
              onClick={() => navigateTab("riders", "pending")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-amber-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending Verification
              </span>
              <span className="font-bold text-amber-400">{riders.pendingApproval}</span>
            </div>
            <div
              onClick={() => navigateTab("riders", "blocked")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-rose-500/10 p-2 rounded-xl transition"
            >
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Blocked
              </span>
              <span className="font-bold text-rose-400">{riders.blocked}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Distribution Bar */}
      <div className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MdOutlineReceiptLong className="text-[#f97316]" size={18} />
            Orders Breakdown & Fulfillment
          </h3>
          <button
            onClick={() => navigateTab("orders", "all")}
            className="text-xs font-bold text-[#f97316] hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Orders <MdArrowForward size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div
            onClick={() => navigateTab("orders", "all")}
            className="bg-[#041916] border border-teal-800/60 p-3.5 rounded-xl cursor-pointer hover:bg-teal-900/30 transition"
          >
            <p className="text-[11px] text-[#8faea7] font-medium">Total Orders</p>
            <p className="text-lg font-bold text-white mt-0.5">{orders.total}</p>
          </div>
          <div
            onClick={() => navigateTab("orders", "preparing")}
            className="bg-[#041916] border border-amber-500/40 p-3.5 rounded-xl cursor-pointer hover:bg-amber-950/20 transition"
          >
            <p className="text-[11px] text-amber-400 font-medium">Active In-Flight</p>
            <p className="text-lg font-bold text-amber-300 mt-0.5">{orders.activeDeliveries}</p>
          </div>
          <div
            onClick={() => navigateTab("orders", "delivered")}
            className="bg-[#041916] border border-emerald-500/40 p-3.5 rounded-xl cursor-pointer hover:bg-emerald-950/20 transition"
          >
            <p className="text-[11px] text-emerald-400 font-medium">Successfully Delivered</p>
            <p className="text-lg font-bold text-emerald-300 mt-0.5">{orders.delivered}</p>
          </div>
          <div
            onClick={() => navigateTab("orders", "cancelled")}
            className="bg-[#041916] border border-rose-500/40 p-3.5 rounded-xl cursor-pointer hover:bg-rose-950/20 transition"
          >
            <p className="text-[11px] text-rose-400 font-medium">Cancelled / Failed</p>
            <p className="text-lg font-bold text-rose-300 mt-0.5">{orders.cancelled}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;