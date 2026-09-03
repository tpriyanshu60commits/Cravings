import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import {
  IoReceiptOutline,
  IoLocationOutline,
  IoFastFoodOutline,
  IoTimeOutline,
  IoChevronForward,
  IoStorefrontOutline,
} from "react-icons/io5";
import { FaMotorcycle } from "react-icons/fa";

const CustomerOverview = ({ setActiveTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [ordersRes, addressRes] = await Promise.all([
          api.get("/customer/all-orders"),
          api.get("/customer/address-book"),
        ]);
        if (isMounted) {
          setOrders(ordersRes.data?.data || []);
          setAddresses(addressRes.data?.data || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Overview data fetch error:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) return <Loader height="300px" width="100%" />;

  const activeOrders = orders.filter((o) =>
    ["pending", "accepted", "preparing", "ready", "pickedup", "outfordelivery"].includes(
      o.orderStatus?.toLowerCase()
    )
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-h-[88vh] overflow-y-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#072420] to-[#041916] text-white p-6 rounded-3xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full inline-block">
          Customer Portal
        </span>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
          Welcome back, {user?.fullName || "Foodie"}!
        </h1>
        <p className="text-xs sm:text-sm text-[#8faea7] max-w-xl leading-relaxed">
          Track your live food deliveries, manage delivery addresses, and browse your favorite restaurants.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 hover:border-orange-500/50 transition cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            <IoReceiptOutline />
          </div>
          <div>
            <p className="text-2xl font-black text-white">
              {orders.length}
            </p>
            <p className="text-xs text-[#8faea7] font-medium">
              Total Orders
            </p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 hover:border-blue-500/50 transition cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            <FaMotorcycle />
          </div>
          <div>
            <p className="text-2xl font-black text-white">
              {activeOrders.length}
            </p>
            <p className="text-xs text-[#8faea7] font-medium">
              Active Orders
            </p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab && setActiveTab("address-book")}
          className="bg-[#072420] p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 hover:border-emerald-500/50 transition cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            <IoLocationOutline />
          </div>
          <div>
            <p className="text-2xl font-black text-white">
              {addresses.length}
            </p>
            <p className="text-xs text-[#8faea7] font-medium">
              Saved Addresses
            </p>
          </div>
        </div>
      </div>

      {/* Active Orders Highlight */}
      {activeOrders.length > 0 && (
        <div className="bg-[#041916] border border-orange-500/40 p-5 rounded-2xl space-y-3 shadow-xl shadow-orange-950/20">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
              <IoTimeOutline className="text-lg text-[#f97316]" />
              Live In-Progress Order
            </h3>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {activeOrders[0].orderStatus}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-1">
            <div>
              <p className="text-xs font-bold text-white">
                {activeOrders[0].restaurantId?.restaurantName || "Restaurant Order"}
              </p>
              <p className="text-[11px] text-[#8faea7] mt-0.5">
                {activeOrders[0].orderItems?.map((it) => `${it.quantity}x ${it.itemName}`).join(", ")}
              </p>
            </div>
            <button
              onClick={() => navigate(`/order-tracking/${activeOrders[0]._id}`)}
              className="px-4 py-2 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-bold rounded-xl hover:opacity-95 transition self-start sm:self-auto shadow-md shadow-orange-950/40 cursor-pointer"
            >
              Track Live Order →
            </button>
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-[#072420] p-5 sm:p-6 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm sm:text-base font-bold text-white">
            Recent Orders
          </h3>
          {orders.length > 0 && (
            <button
              onClick={() => setActiveTab && setActiveTab("orders")}
              className="text-xs font-semibold text-[#f97316] hover:text-orange-300 transition cursor-pointer"
            >
              View All ({orders.length}) →
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <IoFastFoodOutline className="text-4xl text-[#8faea7]/40 mx-auto" />
            <p className="text-xs text-[#8faea7]">
              You have not placed any orders yet.
            </p>
            <Link
              to="/order-now"
              className="inline-block px-4 py-2 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-semibold rounded-xl hover:opacity-95 transition shadow-md shadow-orange-950/40"
            >
              Order Food Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/order-tracking/${order._id}`)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#041916] border border-teal-900/60 hover:border-teal-800/80 hover:bg-teal-900/20 transition cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <IoStorefrontOutline className="text-[#f97316]" />
                    {order.restaurantId?.restaurantName || "Restaurant"}
                  </p>
                  <p className="text-[11px] text-[#8faea7]">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })} • ₹{order.billDetails?.finalAmount?.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {order.orderStatus}
                  </span>
                  <IoChevronForward className="text-xs text-[#8faea7]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOverview;
