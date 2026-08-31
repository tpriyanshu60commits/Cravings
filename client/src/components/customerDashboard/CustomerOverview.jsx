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
    <div className="p-6 space-y-6 max-h-[88vh] overflow-y-auto">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-orange-500 to-amber-500 text-white p-6 rounded-3xl shadow-sm space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
          Customer Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Welcome back, {user?.fullName || "Foodie"}!
        </h1>
        <p className="text-xs sm:text-sm text-white/90 max-w-xl">
          Track your live food deliveries, manage delivery addresses, and browse your favorite restaurants.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs hover:border-(--color-primary) transition cursor-pointer flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-(--color-primary) flex items-center justify-center text-2xl">
            <IoReceiptOutline />
          </div>
          <div>
            <p className="text-2xl font-black text-(--color-base-content)">
              {orders.length}
            </p>
            <p className="text-xs text-(--color-secondary) font-medium">
              Total Orders
            </p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab && setActiveTab("orders")}
          className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs hover:border-(--color-primary) transition cursor-pointer flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
            <FaMotorcycle />
          </div>
          <div>
            <p className="text-2xl font-black text-(--color-base-content)">
              {activeOrders.length}
            </p>
            <p className="text-xs text-(--color-secondary) font-medium">
              Active Orders
            </p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab && setActiveTab("address-book")}
          className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs hover:border-(--color-primary) transition cursor-pointer flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl">
            <IoLocationOutline />
          </div>
          <div>
            <p className="text-2xl font-black text-(--color-base-content)">
              {addresses.length}
            </p>
            <p className="text-xs text-(--color-secondary) font-medium">
              Saved Addresses
            </p>
          </div>
        </div>
      </div>

      {/* Active Orders Highlight */}
      {activeOrders.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-orange-900 flex items-center gap-2">
              <IoTimeOutline className="text-lg text-(--color-primary)" />
              Live In-Progress Order
            </h3>
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-(--color-primary) text-(--color-primary-content)">
              {activeOrders[0].orderStatus}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <p className="text-xs font-bold text-orange-950">
                {activeOrders[0].restaurantId?.restaurantName || "Restaurant Order"}
              </p>
              <p className="text-[11px] text-orange-800">
                {activeOrders[0].orderItems?.map((it) => `${it.quantity}x ${it.itemName}`).join(", ")}
              </p>
            </div>
            <button
              onClick={() => navigate(`/order-tracking/${activeOrders[0]._id}`)}
              className="px-4 py-2 bg-(--color-primary) text-(--color-primary-content) text-xs font-bold rounded-xl hover:opacity-90 transition self-start sm:self-auto shadow-xs"
            >
              Track Live Order →
            </button>
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-(--color-base-100) p-6 rounded-2xl border border-(--color-base-300) shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-(--color-base-content)">
            Recent Orders
          </h3>
          {orders.length > 0 && (
            <button
              onClick={() => setActiveTab && setActiveTab("orders")}
              className="text-xs font-semibold text-(--color-primary) hover:underline"
            >
              View All ({orders.length}) →
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <IoFastFoodOutline className="text-4xl text-gray-300 mx-auto" />
            <p className="text-xs text-(--color-secondary)">
              You have not placed any orders yet.
            </p>
            <Link
              to="/order-now"
              className="inline-block px-4 py-2 bg-(--color-primary) text-(--color-primary-content) text-xs font-semibold rounded-xl hover:opacity-90 transition"
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
                className="flex items-center justify-between p-3.5 rounded-xl border border-(--color-base-300) hover:border-gray-400 hover:bg-(--color-base-200)/50 transition cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-(--color-base-content) flex items-center gap-1.5">
                    <IoStorefrontOutline className="text-(--color-primary)" />
                    {order.restaurantId?.restaurantName || "Restaurant"}
                  </p>
                  <p className="text-[11px] text-(--color-secondary)">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })} • ₹{order.billDetails?.finalAmount?.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                    {order.orderStatus}
                  </span>
                  <IoChevronForward className="text-xs text-gray-400" />
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
