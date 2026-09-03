import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import {
  MdAttachMoney,
  MdCheckCircle,
  MdDateRange,
  MdPayment,
  MdRefresh,
} from "react-icons/md";
import { RiEBike2Fill, RiLoader4Fill } from "react-icons/ri";

const RiderEarnings = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEarnings = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      const res = await api.get("/rider/earnings");
      setEarningsData(res.data?.data || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch earnings");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialEarnings = async () => {
      try {
        const res = await api.get("/rider/earnings");
        if (isMounted) {
          setEarningsData(res.data?.data || null);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.message || "Failed to fetch earnings");
          setIsLoading(false);
        }
      }
    };
    loadInitialEarnings();
    return () => {
      isMounted = false;
    };
  }, []);

  const summary = earningsData?.summary || {};
  const transactions = earningsData?.transactions || [];

  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            My Earnings & Payouts
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Track daily, weekly, and lifetime payouts from completed deliveries.
          </p>
        </div>

        <button
          onClick={() => fetchEarnings()}
          disabled={isRefreshing || isLoading}
          className="self-start sm:self-auto bg-[#041916] hover:bg-teal-900/30 text-white border border-teal-800/60 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
        >
          <MdRefresh className={isRefreshing ? "animate-spin text-sm text-[#f97316]" : "text-sm"} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Payouts"}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex items-center gap-4 hover:border-emerald-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <MdAttachMoney size={26} />
          </div>
          <div>
            <p className="text-xs text-[#8faea7] font-medium">Today's Payout</p>
            <h3 className="text-2xl font-extrabold text-white">
              ₹{summary.todayEarnings ?? 0}
            </h3>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              {summary.todayDeliveriesCount ?? 0} deliveries completed
            </p>
          </div>
        </div>

        <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex items-center gap-4 hover:border-blue-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold shrink-0">
            <MdDateRange size={24} />
          </div>
          <div>
            <p className="text-xs text-[#8faea7] font-medium">Last 7 Days</p>
            <h3 className="text-2xl font-extrabold text-white">
              ₹{summary.weeklyEarnings ?? 0}
            </h3>
            <p className="text-[11px] text-blue-400 font-semibold mt-0.5">
              {summary.weeklyDeliveriesCount ?? 0} weekly trips
            </p>
          </div>
        </div>

        <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex items-center gap-4 hover:border-purple-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <RiEBike2Fill size={24} />
          </div>
          <div>
            <p className="text-xs text-[#8faea7] font-medium">Total Lifetime</p>
            <h3 className="text-2xl font-extrabold text-white">
              ₹{summary.totalEarnings ?? 0}
            </h3>
            <p className="text-[11px] text-purple-400 font-semibold mt-0.5">
              {summary.totalDeliveriesCount ?? 0} total deliveries
            </p>
          </div>
        </div>

        <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex items-center gap-4 hover:border-amber-500/40 transition">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <MdCheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-[#8faea7] font-medium">Delivery Rate</p>
            <h3 className="text-2xl font-extrabold text-white">
              ₹{summary.perDeliveryFee ?? 40}
            </h3>
            <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
              Fixed rate per order
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 overflow-hidden space-y-3">
        <div className="p-4 border-b border-teal-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Payout History ({transactions.length})
            </h3>
            <p className="text-xs text-[#8faea7]">
              Detailed log of completed deliveries with payout credits.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <RiLoader4Fill className="animate-spin text-3xl text-[#f97316]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8faea7]">
            No completed delivery transactions logged yet.
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="md:hidden p-4 space-y-3">
              {transactions.map((tx, idx) => (
                <div
                  key={tx.orderId || idx}
                  className="bg-[#041916] p-4 rounded-xl border border-teal-800/60 space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs font-bold text-white">#{tx.orderId}</p>
                      <p className="text-[10px] text-[#8faea7] mt-0.5">
                        {new Date(tx.deliveredAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="font-mono font-extrabold text-emerald-400 text-sm">
                      +₹{tx.deliveryFee || 40}.00
                    </span>
                  </div>

                  <div className="pt-2 border-t border-teal-900/40 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-white">{tx.deliveryAddress?.name || "Customer"}</p>
                      <p className="text-[10px] text-[#8faea7]">{tx.deliveryAddress?.city || "—"}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 uppercase font-bold text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      <MdPayment size={11} /> {tx.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#041916] text-[#8faea7] uppercase text-[10px] font-bold border-b border-teal-900/60">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Delivered At</th>
                    <th className="py-3.5 px-4">Customer & City</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4 text-right">Rider Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-900/40">
                  {transactions.map((tx, idx) => (
                    <tr key={tx.orderId || idx} className="hover:bg-teal-900/20 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        #{tx.orderId}
                      </td>
                      <td className="py-3.5 px-4 text-[#8faea7]">
                        {new Date(tx.deliveredAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        •{" "}
                        {new Date(tx.deliveredAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">
                          {tx.deliveryAddress?.name || "Customer"}
                        </p>
                        <p className="text-[11px] text-[#8faea7]">
                          {tx.deliveryAddress?.city || tx.deliveryAddress?.address || "—"}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 uppercase font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          <MdPayment size={12} /> {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400 text-sm font-mono">
                        +₹{tx.deliveryFee || 40}.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiderEarnings;
