import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdClose,
  MdOutlineReceiptLong,
  MdPerson,
  MdDeliveryDining,
  MdPayment,
  MdCheckCircle,
  MdSwapHoriz,
  MdOutlineShield,
} from "react-icons/md";
import { FaUtensils, FaMotorcycle, FaStore } from "react-icons/fa";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  pending: { label: "Pending", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  accepted: { label: "Accepted", bg: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  preparing: { label: "Preparing", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  ready: { label: "Food Ready", bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  pickedUp: { label: "Picked Up", bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  outForDelivery: { label: "Out for Delivery", bg: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
  delivered: { label: "Delivered", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  cancelled: { label: "Cancelled", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  failed: { label: "Failed", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  rejected: { label: "Rejected", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  undeliverable: { label: "Undeliverable", bg: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
};

const DEFAULT_DISH = "https://placehold.co/100x100?text=Item";

const AdminOrderDetailModal = ({
  isOpen,
  onClose,
  orderId,
  onUpdateSuccess,
}) => {
  const [order, setOrder] = useState(null);
  const [ridersList, setRidersList] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [overrideStatus, setOverrideStatus] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [paymentStatusOverride, setPaymentStatusOverride] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderId) return;
    let isMounted = true;

    const fetchOrderDetails = async () => {
      try {
        const [resOrder, resRiders] = await Promise.all([
          api.get(`/admin/orders/${orderId}`),
          api.get("/admin/riders", { params: { status: "active" } }).catch(() => ({ data: { data: [] } })),
        ]);

        if (isMounted) {
          if (resOrder.data?.data) {
            const ord = resOrder.data.data;
            setOrder(ord);
            setOverrideStatus(ord.orderStatus || "");
            setCancellationReason(ord.cancellationReason || "");
            setPaymentStatusOverride(ord.paymentDetails?.paymentStatus || "pending");
            if (ord.riderId?._id) {
              setSelectedRiderId(ord.riderId._id);
            }
          }

          if (Array.isArray(resRiders.data?.data)) {
            setRidersList(resRiders.data.data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to load order details",
          );
          setIsLoading(false);
        }
      }
    };

    fetchOrderDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  // Handle manual rider assignment
  const handleAssignRider = async () => {
    if (!selectedRiderId) {
      toast.error("Please select a rider to assign");
      return;
    }

    try {
      setIsAssigning(true);
      const res = await api.patch(`/admin/orders/${orderId}/assign-rider`, {
        riderId: selectedRiderId,
      });
      toast.success(res.data?.message || "Rider assigned successfully");
      if (res.data?.data) {
        setOrder(res.data.data);
      }
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to assign rider",
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle emergency status override
  const handleUpdateOrderStatus = async () => {
    if (!overrideStatus) {
      toast.error("Status is required");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const payload = {
        status: overrideStatus,
      };
      if (cancellationReason.trim()) {
        payload.cancellationReason = cancellationReason.trim();
      }
      if (paymentStatusOverride) {
        payload.paymentStatus = paymentStatusOverride;
      }

      const res = await api.patch(`/admin/orders/${orderId}/status`, payload);
      toast.success(res.data?.message || "Order status updated successfully");
      if (res.data?.data) {
        setOrder(res.data.data);
      }
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update order status",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const badge = statusBadges[order?.orderStatus] || {
    label: order?.orderStatus || "Unknown",
    bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
  };

  const isAssignable = ["ready", "accepted", "preparing"].includes(order?.orderStatus);

  const customerUser = order?.customerId?.customerId;
  const restaurant = order?.restaurantId;
  const assignedRider = order?.riderId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-[#072420] text-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-teal-800/60 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-teal-900/40 flex justify-between items-center bg-[#041916]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold">
              <MdOutlineReceiptLong size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Order #{order?._id}
                </h3>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-[#8faea7] font-mono">
                Placed on:{" "}
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8faea7] hover:bg-teal-900/30 hover:text-white transition cursor-pointer"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12">
            <Loader height="30vh" width="100%" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
            {/* Grid 1: Items & Bill */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ordered Items */}
              <div className="space-y-3 bg-[#041916] p-4 rounded-xl border border-teal-800/60">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FaUtensils className="text-[#f97316]" size={12} />
                  Ordered Items ({order?.orderItems?.length || 0})
                </h4>

                <div className="divide-y divide-teal-900/40">
                  {order?.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.image?.url ? (
                          <img
                            src={item.image.url}
                            alt={item.itemName}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_DISH;
                            }}
                            className="w-9 h-9 rounded-xl object-cover border border-teal-800/60"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold">
                            {item.itemName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-xs text-white">
                            {item.itemName}
                          </p>
                          <p className="text-[10px] text-[#8faea7]">
                            Qty: {item.quantity} × ₹{item.itemPrice}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-white">
                        ₹{(Number(item.quantity) * Number(item.itemPrice)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-3 bg-[#041916] p-4 rounded-xl border border-teal-800/60">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MdPayment className="text-[#f97316]" size={14} />
                  Bill & Financial Breakdown
                </h4>

                <div className="space-y-1.5 text-[11px] text-[#8faea7]">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-white font-medium">
                      ₹{order?.billDetails?.totalAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (GST 5%)</span>
                    <span className="text-white font-medium">
                      ₹{order?.billDetails?.taxAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="text-white font-medium">
                      ₹{order?.billDetails?.platformFee?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span className="text-white font-medium">
                      ₹{order?.billDetails?.convenienceFee?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  {Number(order?.billDetails?.deliveryCharge) > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span className="text-white font-medium">
                        ₹{order?.billDetails?.deliveryCharge?.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {Number(order?.billDetails?.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Discount</span>
                      <span>-₹{order?.billDetails?.discountAmount?.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-teal-900/40 pt-2 mt-2 flex justify-between text-xs font-bold text-white">
                    <span>Total Amount Paid</span>
                    <span className="text-sm font-black text-[#f97316]">
                      ₹{order?.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-teal-900/40 flex items-center justify-between text-[11px]">
                    <span className="text-[#8faea7]">Payment:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        order?.paymentDetails?.paymentStatus === "completed"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {(order?.paymentDetails?.paymentMethod || "online").toUpperCase()} •{" "}
                      {order?.paymentDetails?.paymentStatus || "pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2: Parties Involved (Customer, Restaurant, Rider) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Customer */}
              <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1.5">
                <span className="text-[10px] font-bold text-[#8faea7] uppercase flex items-center gap-1">
                  <MdPerson className="text-[#f97316]" size={13} /> Customer
                </span>
                <p className="font-bold text-xs text-white">
                  {order?.deliveryAddress?.name || customerUser?.fullName || "Customer"}
                </p>
                <p className="text-[11px] text-[#8faea7]">
                  {customerUser?.phone || order?.deliveryAddress?.phone || "No phone"}
                </p>
                <p className="text-[11px] text-[#8faea7] line-clamp-2">
                  {order?.deliveryAddress?.address}, {order?.deliveryAddress?.city}
                </p>
              </div>

              {/* Restaurant */}
              <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1.5">
                <span className="text-[10px] font-bold text-[#8faea7] uppercase flex items-center gap-1">
                  <FaStore className="text-[#f97316]" size={11} /> Restaurant
                </span>
                <p className="font-bold text-xs text-white">
                  {restaurant?.restaurantName || "Restaurant Partner"}
                </p>
                <p className="text-[11px] text-[#8faea7]">
                  {restaurant?.contactDetails?.phone || "No contact"}
                </p>
                <p className="text-[11px] text-[#8faea7] line-clamp-2">
                  {restaurant?.address}, {restaurant?.city}
                </p>
              </div>

              {/* Rider */}
              <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1.5">
                <span className="text-[10px] font-bold text-[#8faea7] uppercase flex items-center gap-1">
                  <FaMotorcycle className="text-[#f97316]" size={12} /> Assigned Courier
                </span>
                {assignedRider ? (
                  <>
                    <p className="font-bold text-xs text-white">
                      {assignedRider.riderId?.fullName || "Rider Assigned"}
                    </p>
                    <p className="text-[11px] text-[#8faea7]">
                      {assignedRider.riderId?.phone || "No phone"}
                    </p>
                    <p className="text-[10px] text-emerald-300 font-semibold">
                      Vehicle: {assignedRider.vehicleDetails?.vehicleNumber || "Assigned"}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-amber-400 font-medium pt-1">
                    No rider assigned yet
                  </p>
                )}
              </div>
            </div>

            {/* Admin Management Section: Manual Rider Assignment & Status Override */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Box 1: Dispatch / Rider Assignment */}
              <div className="p-4 bg-[#041916] rounded-xl border border-teal-800/60 space-y-3">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MdDeliveryDining size={18} className="text-[#f97316]" />
                  Dispatch & Assign Rider
                </h4>
                <p className="text-[11px] text-[#8faea7]">
                  Assign or change active courier for this delivery (supported for Ready, Accepted, Preparing).
                </p>

                <div className="space-y-2">
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    disabled={!isAssignable || isAssigning}
                    className="w-full px-3 py-2 text-xs bg-[#072420] border border-teal-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white disabled:opacity-60 cursor-pointer"
                  >
                    <option value="">-- Select Active Rider --</option>
                    {ridersList.map((rdr) => (
                      <option key={rdr._id} value={rdr._id}>
                        {rdr.riderId?.fullName || "Rider"} • {rdr.vehicleDetails?.vehicleNumber || "No plate"} (
                        {rdr.isAvailable ? "Online" : "Offline"})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAssignRider}
                    disabled={!isAssignable || isAssigning || !selectedRiderId}
                    className="w-full px-4 py-2 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-orange-950/40 cursor-pointer"
                  >
                    {isAssigning ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdSwapHoriz size={16} />
                    )}
                    {assignedRider ? "Reassign Rider" : "Assign to Delivery"}
                  </button>

                  {!isAssignable && (
                    <p className="text-[10px] text-amber-400 italic">
                      Note: Rider assignment is available only when order is in "ready", "accepted", or "preparing" status.
                    </p>
                  )}
                </div>
              </div>

              {/* Box 2: Emergency Status Override */}
              <div className="p-4 bg-[#041916] rounded-xl border border-teal-800/60 space-y-3">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MdOutlineShield size={16} className="text-amber-400" />
                  Admin Status Override
                </h4>
                <p className="text-[11px] text-[#8faea7]">
                  Administrative override to mark order status or record emergency cancellation.
                </p>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#8faea7] uppercase block mb-1">
                        Order Status
                      </label>
                      <select
                        value={overrideStatus}
                        onChange={(e) => setOverrideStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#072420] border border-teal-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Food Ready</option>
                        <option value="pickedUp">Picked Up</option>
                        <option value="outForDelivery">Out For Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed">Failed</option>
                        <option value="rejected">Rejected</option>
                        <option value="undeliverable">Undeliverable</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#8faea7] uppercase block mb-1">
                        Payment Status
                      </label>
                      <select
                        value={paymentStatusOverride}
                        onChange={(e) => setPaymentStatusOverride(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#072420] border border-teal-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>

                  {["cancelled", "failed", "rejected", "undeliverable"].includes(overrideStatus) && (
                    <input
                      type="text"
                      placeholder="Cancellation / Failure reason..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#072420] border border-teal-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white placeholder-[#537770]"
                    />
                  )}

                  <button
                    onClick={handleUpdateOrderStatus}
                    disabled={isUpdatingStatus}
                    className="w-full px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdCheckCircle size={15} />
                    )}
                    Save Status Override
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-teal-900/40 bg-[#041916] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-teal-800/60 bg-[#072420] hover:bg-teal-900/30 text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailModal;
