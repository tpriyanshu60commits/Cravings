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
    <div className="overflow-y-auto h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-base-content)">
            My Earnings & Payouts
          </h1>
          <p className="text-xs text-(--color-secondary) mt-1">
            Track daily, weekly, and lifetime payouts from completed deliveries.
          </p>
        </div>

        <button
          onClick={() => fetchEarnings()}
          disabled={isRefreshing || isLoading}
          className="self-start sm:self-auto bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
        >
          <MdRefresh className={isRefreshing ? "animate-spin text-sm" : "text-sm"} />
          {isRefreshing ? "Refreshing..." : "Refresh Payouts"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-secondary)/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
            <MdAttachMoney size={28} />
          </div>
          <div>
            <p className="text-xs text-(--color-secondary) font-medium">Today's Payout</p>
            <h3 className="text-2xl font-extrabold text-(--color-base-content)">
              ₹{summary.todayEarnings ?? 0}
            </h3>
            <p className="text-[11px] text-green-600 font-semibold mt-0.5">
              {summary.todayDeliveriesCount ?? 0} deliveries completed
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-secondary)/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <MdDateRange size={26} />
          </div>
          <div>
            <p className="text-xs text-(--color-secondary) font-medium">Last 7 Days</p>
            <h3 className="text-2xl font-extrabold text-(--color-base-content)">
              ₹{summary.weeklyEarnings ?? 0}
            </h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
              {summary.weeklyDeliveriesCount ?? 0} weekly trips
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-secondary)/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <RiEBike2Fill size={26} />
          </div>
          <div>
            <p className="text-xs text-(--color-secondary) font-medium">Total Lifetime</p>
            <h3 className="text-2xl font-extrabold text-(--color-base-content)">
              ₹{summary.totalEarnings ?? 0}
            </h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
              {summary.totalDeliveriesCount ?? 0} total deliveries
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-secondary)/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <MdCheckCircle size={26} />
          </div>
          <div>
            <p className="text-xs text-(--color-secondary) font-medium">Delivery Rate</p>
            <h3 className="text-2xl font-extrabold text-(--color-base-content)">
              ₹{summary.perDeliveryFee ?? 40}
            </h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
              Fixed rate per order
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-(--color-base-100) rounded-2xl border border-(--color-secondary)/30 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-(--color-secondary)/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-(--color-base-content)">
              Payout History ({transactions.length})
            </h3>
            <p className="text-xs text-(--color-secondary)">
              Detailed log of completed deliveries with payout credits.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <RiLoader4Fill className="animate-spin text-3xl text-(--color-primary)" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-(--color-secondary)">
            No completed delivery transactions logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-(--color-base-200) text-(--color-secondary) uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Delivered At</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Rider Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-secondary)/10">
                {transactions.map((tx, idx) => (
                  <tr key={tx.orderId || idx} className="hover:bg-(--color-base-200)/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-(--color-base-content)">
                      {tx.orderId}
                    </td>
                    <td className="py-3 px-4 text-(--color-secondary)">
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
                    <td className="py-3 px-4">
                      <p className="font-semibold text-(--color-base-content)">
                        {tx.deliveryAddress?.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-(--color-secondary)">
                        {tx.deliveryAddress?.city || tx.deliveryAddress?.address || "—"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 uppercase font-bold text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        <MdPayment size={12} /> {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-green-600 text-sm font-mono">
                      +₹{tx.deliveryFee || 40}.00
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderEarnings;
