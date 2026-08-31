import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoLocationOutline,
  IoStorefrontOutline,
  IoCallOutline,
  IoBicycleOutline,
  IoRefreshOutline,
  IoReceiptOutline,
} from "react-icons/io5";
import { FaUtensils, FaCheckDouble, FaMotorcycle, FaBoxOpen } from "react-icons/fa";
import { MdOutlineRestaurantMenu, MdErrorOutline } from "react-icons/md";

const ORDER_STEPS = [
  { key: "pending", label: "Order Placed", icon: <IoReceiptOutline /> },
  { key: "accepted", label: "Confirmed", icon: <FaCheckDouble /> },
  { key: "preparing", label: "Preparing Food", icon: <FaUtensils /> },
  { key: "ready", label: "Food Ready", icon: <FaBoxOpen /> },
  { key: "pickedUp", label: "Picked Up", icon: <FaMotorcycle /> },
  { key: "outForDelivery", label: "Out for Delivery", icon: <IoBicycleOutline /> },
  { key: "delivered", label: "Delivered", icon: <IoCheckmarkCircle /> },
];

const getStepIndex = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return 0;
    case "accepted":
      return 1;
    case "preparing":
      return 2;
    case "ready":
      return 3;
    case "pickedup":
      return 4;
    case "outfordelivery":
      return 5;
    case "delivered":
      return 6;
    default:
      return 0;
  }
};

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchOrderDetails = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setIsRefreshing(true);
        const res = await api.get(`/customer/orders/${orderId}`);
        setOrder(res.data.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch order tracking status",
        );
      } finally {
        setIsLoading(false);
        if (isManual) setIsRefreshing(false);
      }
    },
    [orderId]
  );

  const handleConfirmReceived = async () => {
    try {
      setIsConfirming(true);
      const res = await api.patch(`/customer/orders/${orderId}/confirm-delivery`);
      toast.success(res.data?.message || "Order received confirmed!");
      setOrder(res.data?.data);
      await fetchOrderDetails();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to confirm order delivery"
      );
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // Auto-poll every 12 seconds
    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchOrderDetails]);

  if (isLoading) return <Loader height="100vh" width="100%" />;

  if (!order) {
    return (
      <div className="min-h-screen bg-(--color-base-200) flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3 bg-(--color-base-100) p-8 rounded-2xl border border-(--color-base-300) max-w-md">
          <MdErrorOutline className="text-5xl text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-(--color-base-content)">Order Not Found</h2>
          <p className="text-xs text-(--color-secondary)">
            We couldn't retrieve tracking details for this order ID.
          </p>
          <button
            onClick={() => navigate("/customer-dashboard")}
            className="px-4 py-2 bg-(--color-primary) text-(--color-primary-content) text-xs font-semibold rounded-xl hover:opacity-90 transition"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.orderStatus);
  const isFailed = ["cancelled", "failed", "rejected", "undeliverable"].includes(
    order.orderStatus?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-(--color-base-200) py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/customer-dashboard")}
              className="p-2 rounded-full hover:bg-(--color-base-200) text-(--color-base-content) transition"
            >
              <IoArrowBack className="text-xl" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-(--color-base-content) flex items-center gap-2">
                Order Tracking
              </h1>
              <p className="text-xs text-(--color-secondary)">
                Order ID: <span className="font-mono font-semibold text-(--color-base-content)">{order._id}</span> • Placed on{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchOrderDetails(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) rounded-xl transition"
          >
            <IoRefreshOutline className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
        </div>

        {/* Dual Delivery Confirmation Card for Customer */}
        {order.orderStatus === "outForDelivery" && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-2xl shrink-0">
                <IoBicycleOutline />
              </div>
              <div>
                <h3 className="text-base font-bold text-(--color-base-content)">
                  Your Meal is Out for Delivery!
                </h3>
                <p className="text-xs text-(--color-secondary) mt-0.5">
                  {order.deliveryConfirmation?.customerConfirmed
                    ? "✓ You confirmed order receipt. Waiting for rider to complete drop-off confirmation."
                    : order.deliveryConfirmation?.riderConfirmed
                    ? "Rider has arrived and marked delivery! Please confirm you received your food."
                    : "Once your delivery partner arrives with your meal, click below to confirm receipt."}
                </p>
              </div>
            </div>

            {order.deliveryConfirmation?.customerConfirmed ? (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-700 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0">
                <IoCheckmarkCircle className="text-base" /> Order Receipt Confirmed
              </div>
            ) : (
              <button
                onClick={handleConfirmReceived}
                disabled={isConfirming}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isConfirming ? (
                  <IoRefreshOutline className="animate-spin text-sm" />
                ) : (
                  <IoCheckmarkCircle className="text-base" />
                )}
                Confirm Order Received
              </button>
            )}
          </div>
        )}

        {/* Status Stepper / Banner */}
        <div className="bg-(--color-base-100) p-6 rounded-2xl border border-(--color-base-300) shadow-xs space-y-6">
          {isFailed ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800">
              <MdErrorOutline className="text-2xl shrink-0" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  Order Status: {order.orderStatus}
                </h4>
                <p className="text-xs mt-0.5">
                  This order could not be completed. Please contact support if you need assistance.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-(--color-secondary)">
                  Live Delivery Status
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold capitalize bg-orange-100 text-orange-800">
                  ● {order.orderStatus}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {ORDER_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={step.key}
                      className={`flex flex-col items-center text-center p-3 rounded-xl transition ${
                        isCurrent
                          ? "bg-orange-500/10 border border-orange-500/30 text-orange-600 font-bold"
                          : isDone
                          ? "text-green-600 font-medium"
                          : "text-gray-400 opacity-50"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-base mb-2 shadow-xs ${
                          isCurrent
                            ? "bg-(--color-primary) text-white ring-4 ring-(--color-primary)/20"
                            : isDone
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span className="text-[11px] leading-tight">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restaurant & Delivery Location */}
          <div className="space-y-4">
            {/* Restaurant Info */}
            <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-secondary) flex items-center gap-1.5">
                <IoStorefrontOutline /> Restaurant
              </h3>
              <h4 className="text-sm font-bold text-(--color-base-content)">
                {order.restaurantId?.restaurantName || "Restaurant"}
              </h4>
              <p className="text-xs text-(--color-secondary) leading-relaxed">
                {order.restaurantId?.address}, {order.restaurantId?.city}
              </p>
              {order.restaurantId?.contactDetails?.phone && (
                <p className="text-xs text-(--color-primary) font-semibold flex items-center gap-1 pt-1">
                  <IoCallOutline /> {order.restaurantId.contactDetails.phone}
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-secondary) flex items-center gap-1.5">
                <IoLocationOutline /> Delivering To
              </h3>
              <h4 className="text-sm font-bold text-(--color-base-content)">
                {order.deliveryAddress?.name}
              </h4>
              <p className="text-xs text-(--color-secondary) leading-relaxed">
                {order.deliveryAddress?.address}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pinCode}
              </p>
            </div>

            {/* Rider Details (if assigned) */}
            {order.riderId && (
              <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-secondary) flex items-center gap-1.5">
                  <IoBicycleOutline /> Delivery Partner
                </h3>
                <p className="text-xs text-(--color-base-content)">
                  Vehicle: <span className="font-semibold">{order.riderId.vehicleDetails?.vehicleNumber || "Delivery Bike"}</span>
                </p>
                {order.riderId.averageRating > 0 && (
                  <p className="text-xs text-yellow-600 font-bold">
                    ★ {order.riderId.averageRating.toFixed(1)} Rating
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Items & Bill Breakdown */}
          <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-secondary)">
              Ordered Items ({order.orderItems?.length})
            </h3>

            <div className="space-y-3 divide-y divide-(--color-base-300)">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-(--color-primary)/10 text-(--color-primary) font-bold text-[10px] flex items-center justify-center">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-(--color-base-content)">
                      {item.itemName}
                    </span>
                  </div>
                  <span className="font-bold text-(--color-base-content)">
                    ₹{(item.itemPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="border-t border-(--color-base-300) pt-3 space-y-1.5 text-xs text-(--color-secondary)">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-(--color-base-content)">
                  ₹{order.billDetails?.totalAmount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform & Convenience Fee</span>
                <span>
                  ₹{(
                    (order.billDetails?.platformFee || 0) +
                    (order.billDetails?.convenienceFee || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (GST)</span>
                <span>₹{order.billDetails?.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="border-t border-(--color-base-300) pt-2 flex justify-between font-extrabold text-sm text-(--color-base-content)">
                <span>Total Paid</span>
                <span className="text-(--color-primary)">
                  ₹{order.billDetails?.finalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Badge */}
            <div className="pt-2 text-center">
              <span className="inline-block px-3 py-1 text-[11px] font-bold rounded-full bg-green-100 text-green-800">
                Payment: {order.paymentDetails?.paymentStatus?.toUpperCase()} (via {order.paymentDetails?.paymentMethod?.toUpperCase()})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
