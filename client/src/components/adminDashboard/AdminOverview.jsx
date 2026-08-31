import React, { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdDashboard,
  MdRefresh,
  MdPeople,
  MdRestaurant,
  MdDeliveryDining,
  MdCheckCircle,
  MdPendingActions,
  MdCancel,
  MdTrendingUp,
  MdAttachMoney,
  MdOutlineReceiptLong,
  MdHourglassTop,
  MdArrowForward,
  MdStorefront,
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
    fetchStats();
    // Poll stats every 15 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);
    return () => clearInterval(interval);
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs">
        <div>
          <h1 className="text-xl font-black text-(--color-base-content) flex items-center gap-2">
            <MdDashboard className="text-(--color-primary)" size={24} />
            Admin Overview & Analytics
          </h1>
          <p className="text-xs text-(--color-secondary) mt-0.5">
            Real-time platform metrics, revenue tracking, and ecosystem health
          </p>
        </div>

        <button
          onClick={() => fetchStats(true)}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl border border-(--color-base-300) bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) transition flex items-center gap-2 text-xs font-semibold shrink-0"
        >
          <MdRefresh
            size={18}
            className={isRefreshing ? "animate-spin text-(--color-primary)" : ""}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Stats"}</span>
        </button>
      </div>

      {/* Pending Action Alerts Banner (if any pending) */}
      {totalPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                <MdPendingActions size={22} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Action Required ({totalPending} Pending Approvals)
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Accounts and partners awaiting administrative verification and review.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {pendingApprovals.restaurants > 0 && (
                <button
                  onClick={() => navigateTab("restaurants", "inactive")}
                  className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <span>{pendingApprovals.restaurants} Restaurants</span>
                  <MdArrowForward size={14} />
                </button>
              )}
              {pendingApprovals.riders > 0 && (
                <button
                  onClick={() => navigateTab("riders", "pending")}
                  className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <span>{pendingApprovals.riders} Riders</span>
                  <MdArrowForward size={14} />
                </button>
              )}
              {pendingApprovals.customers > 0 && (
                <button
                  onClick={() => navigateTab("customers", "pending")}
                  className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
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
        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-2">
          <div className="flex justify-between items-center text-(--color-secondary)">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <FaCoins size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-(--color-base-content)">
              ₹{Number(revenue.totalRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-(--color-secondary)">
            From completed platform transactions
          </p>
        </div>

        {/* Today's Revenue */}
        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-2">
          <div className="flex justify-between items-center text-(--color-secondary)">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <MdTrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-(--color-base-content)">
              ₹{Number(revenue.todayRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-(--color-secondary)">
            Earned today (since midnight)
          </p>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => navigateTab("orders", "all")}
          className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-2 cursor-pointer hover:border-(--color-primary)/50 transition"
        >
          <div className="flex justify-between items-center text-(--color-secondary)">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <FaShoppingCart size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-(--color-base-content)">
              {orders.total || 0}
            </span>
          </div>
          <p className="text-[11px] text-(--color-secondary)">
            Lifetime orders placed
          </p>
        </div>

        {/* Active Deliveries */}
        <div
          onClick={() => navigateTab("orders", "preparing")}
          className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-2 cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex justify-between items-center text-(--color-secondary)">
            <span className="text-xs font-bold uppercase tracking-wider">Active In-Flight</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <MdDeliveryDining size={22} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {orders.activeDeliveries || 0}
            </span>
          </div>
          <p className="text-[11px] text-(--color-secondary)">
            Accepted, preparing or out for delivery
          </p>
        </div>
      </div>

      {/* Ecosystem Breakdown Sections: Customers, Restaurants, Riders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Customer Ecosystem */}
        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <FaUsers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--color-base-content)">Customers</h3>
                <p className="text-[11px] text-(--color-secondary)">Registered customer accounts</p>
              </div>
            </div>
            <button
              onClick={() => navigateTab("customers", "all")}
              className="text-xs font-semibold text-(--color-primary) hover:underline flex items-center gap-1"
            >
              Manage <MdArrowForward size={14} />
            </button>
          </div>

          <div className="space-y-2.5 border-t border-(--color-base-300) pt-3">
            <div
              onClick={() => navigateTab("customers", "all")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-(--color-base-200)/40 p-1.5 rounded-lg transition"
            >
              <span className="text-(--color-secondary)">Total Accounts</span>
              <span className="font-bold text-(--color-base-content)">{customers.total}</span>
            </div>
            <div
              onClick={() => navigateTab("customers", "verified")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-emerald-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Active
              </span>
              <span className="font-bold text-emerald-700">{customers.verified}</span>
            </div>
            <div
              onClick={() => navigateTab("customers", "pending")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-amber-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
              </span>
              <span className="font-bold text-amber-700">{customers.pending}</span>
            </div>
            <div
              onClick={() => navigateTab("customers", "suspended")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-rose-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-red-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Suspended
              </span>
              <span className="font-bold text-red-700">{customers.suspended}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Restaurant Partners */}
        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                <MdRestaurant size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--color-base-content)">Restaurants</h3>
                <p className="text-[11px] text-(--color-secondary)">Kitchen partners & listings</p>
              </div>
            </div>
            <button
              onClick={() => navigateTab("restaurants", "all")}
              className="text-xs font-semibold text-(--color-primary) hover:underline flex items-center gap-1"
            >
              Manage <MdArrowForward size={14} />
            </button>
          </div>

          <div className="space-y-2.5 border-t border-(--color-base-300) pt-3">
            <div
              onClick={() => navigateTab("restaurants", "all")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-(--color-base-200)/40 p-1.5 rounded-lg transition"
            >
              <span className="text-(--color-secondary)">Total Restaurants</span>
              <span className="font-bold text-(--color-base-content)">{restaurants.total}</span>
            </div>
            <div
              onClick={() => navigateTab("restaurants", "active")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-emerald-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Verified
              </span>
              <span className="font-bold text-emerald-700">{restaurants.active}</span>
            </div>
            <div
              onClick={() => navigateTab("restaurants", "inactive")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-amber-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending Approval
              </span>
              <span className="font-bold text-amber-700">{restaurants.pendingApproval}</span>
            </div>
            <div
              onClick={() => navigateTab("restaurants", "blocked")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-rose-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Blocked
              </span>
              <span className="font-bold text-rose-700">{restaurants.blocked}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Delivery Fleet (Riders) */}
        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                <FaMotorcycle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--color-base-content)">Delivery Fleet</h3>
                <p className="text-[11px] text-(--color-secondary)">Delivery riders & couriers</p>
              </div>
            </div>
            <button
              onClick={() => navigateTab("riders", "all")}
              className="text-xs font-semibold text-(--color-primary) hover:underline flex items-center gap-1"
            >
              Manage <MdArrowForward size={14} />
            </button>
          </div>

          <div className="space-y-2.5 border-t border-(--color-base-300) pt-3">
            <div
              onClick={() => navigateTab("riders", "all")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-(--color-base-200)/40 p-1.5 rounded-lg transition"
            >
              <span className="text-(--color-secondary)">Total Riders</span>
              <span className="font-bold text-(--color-base-content)">{riders.total}</span>
            </div>
            <div
              onClick={() => navigateTab("riders", "active")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-emerald-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Approved
              </span>
              <span className="font-bold text-emerald-700">{riders.active}</span>
            </div>
            <div
              onClick={() => navigateTab("riders", "all")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-cyan-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-cyan-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Online & Available
              </span>
              <span className="font-bold text-cyan-700">{riders.available}</span>
            </div>
            <div
              onClick={() => navigateTab("riders", "pending")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-amber-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending Verification
              </span>
              <span className="font-bold text-amber-700">{riders.pendingApproval}</span>
            </div>
            <div
              onClick={() => navigateTab("riders", "blocked")}
              className="flex justify-between text-xs items-center cursor-pointer hover:bg-rose-50/60 p-1.5 rounded-lg transition"
            >
              <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Blocked
              </span>
              <span className="font-bold text-rose-700">{riders.blocked}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Distribution Bar */}
      <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-(--color-base-content) flex items-center gap-2">
            <MdOutlineReceiptLong className="text-(--color-primary)" size={18} />
            Orders Breakdown & Fulfillment
          </h3>
          <button
            onClick={() => navigateTab("orders", "all")}
            className="text-xs font-semibold text-(--color-primary) hover:underline flex items-center gap-1"
          >
            All Orders <MdArrowForward size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div
            onClick={() => navigateTab("orders", "all")}
            className="bg-(--color-base-200) p-3 rounded-xl cursor-pointer hover:bg-(--color-base-300) transition"
          >
            <p className="text-[11px] text-(--color-secondary) font-medium">Total Orders</p>
            <p className="text-lg font-bold text-(--color-base-content) mt-0.5">{orders.total}</p>
          </div>
          <div
            onClick={() => navigateTab("orders", "preparing")}
            className="bg-amber-50 border border-amber-200 p-3 rounded-xl cursor-pointer hover:bg-amber-100 transition"
          >
            <p className="text-[11px] text-amber-800 font-medium">Active In-Flight</p>
            <p className="text-lg font-bold text-amber-900 mt-0.5">{orders.activeDeliveries}</p>
          </div>
          <div
            onClick={() => navigateTab("orders", "delivered")}
            className="bg-green-50 border border-green-200 p-3 rounded-xl cursor-pointer hover:bg-green-100 transition"
          >
            <p className="text-[11px] text-green-800 font-medium">Successfully Delivered</p>
            <p className="text-lg font-bold text-green-900 mt-0.5">{orders.delivered}</p>
          </div>
          <div
            onClick={() => navigateTab("orders", "cancelled")}
            className="bg-rose-50 border border-rose-200 p-3 rounded-xl cursor-pointer hover:bg-rose-100 transition"
          >
            <p className="text-[11px] text-rose-800 font-medium">Cancelled / Failed</p>
            <p className="text-lg font-bold text-rose-900 mt-0.5">{orders.cancelled}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;