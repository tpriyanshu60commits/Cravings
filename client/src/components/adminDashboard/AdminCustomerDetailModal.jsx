import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdClose,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdCheckCircle,
  MdBlock,
  MdHourglassTop,
} from "react-icons/md";
import { FaMapMarkerAlt, FaShoppingBag } from "react-icons/fa";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  verified: { label: "Verified Active", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  pending: { label: "Pending Verification", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  suspended: { label: "Suspended", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const orderStatusBadges = {
  pending: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  accepted: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  preparing: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  ready: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
  pickedUp: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
  outForDelivery: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
  delivered: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  failed: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
};

const DEFAULT_AVATAR = "https://placehold.co/150x150?text=Customer";

const AdminCustomerDetailModal = ({ isOpen, onClose, customerId, onStatusChange }) => {
  const [customerData, setCustomerData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("profile");

  useEffect(() => {
    if (!isOpen || !customerId) return;
    let isMounted = true;

    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/admin/customers/${customerId}`);
        if (isMounted) {
          if (res.data?.data) {
            setCustomerData(res.data.data.customer);
            setOrders(res.data.data.orders || []);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to load customer details",
          );
          setIsLoading(false);
        }
      }
    };

    fetchCustomer();
    return () => {
      isMounted = false;
    };
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.patch(`/admin/customers/${customerId}/status`, {
        status: newStatus,
      });
      toast.success(res.data?.message || `Customer marked as ${newStatus}`);
      if (res.data?.data) {
        setCustomerData(res.data.data);
      }
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update customer status",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const user = customerData?.customerId;
  const addressBook = customerData?.addressBook || [];
  const statusInfo = statusBadges[customerData?.status] || {
    label: customerData?.status || "Unknown",
    bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
  };

  const getPhotoUrl = () => {
    if (!user?.photo) return null;
    if (typeof user.photo === "string") return user.photo;
    if (typeof user.photo === "object" && user.photo.url) return user.photo.url;
    return null;
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-[#072420] text-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-teal-800/60 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-teal-900/40 flex justify-between items-center bg-[#041916]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold">
              <MdPerson size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Customer Details
              </h3>
              <p className="text-xs text-[#8faea7] font-mono">
                ID: {customerData?._id}
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

        {/* Modal Content */}
        {isLoading ? (
          <div className="p-12">
            <Loader height="30vh" width="100%" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Top Profile Summary Card */}
            <div className="bg-[#041916] p-4 rounded-xl border border-teal-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={user?.fullName || "Customer"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-500/50"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xl">
                    {user?.fullName?.charAt(0) || "C"}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-white">
                      {user?.fullName || "Unnamed Customer"}
                    </h4>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#8faea7] flex items-center gap-1.5">
                    <MdEmail className="text-orange-400" size={13} /> {user?.email || "No email"}
                  </p>
                  <p className="text-xs text-[#8faea7] flex items-center gap-1.5">
                    <MdPhone size={13} /> {user?.phone || "No phone"}
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                {customerData?.status !== "verified" && (
                  <button
                    onClick={() => handleUpdateStatus("verified")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdCheckCircle size={14} />
                    )}
                    Verify
                  </button>
                )}

                {customerData?.status !== "pending" && (
                  <button
                    onClick={() => handleUpdateStatus("pending")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdHourglassTop size={14} />
                    )}
                    Set Pending
                  </button>
                )}

                {customerData?.status !== "suspended" ? (
                  <button
                    onClick={() => handleUpdateStatus("suspended")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdBlock size={14} />
                    )}
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus("verified")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdCheckCircle size={14} />
                    )}
                    Reactivate
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs inside modal */}
            <div className="flex border-b border-teal-900/40 gap-4">
              <button
                onClick={() => setActiveModalTab("profile")}
                className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "profile"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-[#8faea7] hover:text-white"
                }`}
              >
                <MdPerson size={16} /> Profile & Demographics
              </button>
              <button
                onClick={() => setActiveModalTab("addresses")}
                className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "addresses"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-[#8faea7] hover:text-white"
                }`}
              >
                <FaMapMarkerAlt size={13} /> Address Book ({addressBook.length})
              </button>
              <button
                onClick={() => setActiveModalTab("orders")}
                className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "orders"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-[#8faea7] hover:text-white"
                }`}
              >
                <FaShoppingBag size={13} /> Order History ({orders.length})
              </button>
            </div>

            {/* Tab 1: Profile & Demographics */}
            {activeModalTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Gender
                    </span>
                    <p className="text-xs font-bold text-white capitalize">
                      {user?.gender || "Not specified"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Date of Birth
                    </span>
                    <p className="text-xs font-bold text-white">
                      {user?.dob
                        ? new Date(user.dob).toLocaleDateString("en-IN", {
                            dateStyle: "long",
                          })
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Account Registered On
                    </span>
                    <p className="text-xs font-bold text-white">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Total Orders Placed
                    </span>
                    <p className="text-xs font-bold text-white">
                      {orders.length} orders
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Saved Address Book */}
            {activeModalTab === "addresses" && (
              <div className="space-y-3">
                {addressBook.length === 0 ? (
                  <p className="text-xs text-[#8faea7] text-center py-6">
                    Customer has not added any addresses yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addressBook.map((addr, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5 capitalize">
                            <MdLocationOn className="text-[#f97316]" size={15} />
                            {addr.name} ({addr.addressType || "home"})
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                              Default Address
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8faea7]">
                          {addr.address}
                        </p>
                        <p className="text-[11px] text-[#537770]">
                          {addr.city}, {addr.state} - {addr.pinCode}, {addr.country || "India"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Order History */}
            {activeModalTab === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-xs text-[#8faea7] text-center py-6">
                    No orders placed by this customer yet.
                  </p>
                ) : (
                  <div className="divide-y divide-teal-900/40 border border-teal-800/60 rounded-xl overflow-hidden">
                    {orders.map((ord) => {
                      const badgeClass = orderStatusBadges[ord.orderStatus] || "bg-teal-900/30 text-[#8faea7] border border-teal-800/40";
                      return (
                        <div
                          key={ord._id}
                          className="p-3.5 bg-[#041916] hover:bg-teal-900/20 transition flex items-center justify-between gap-4 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">
                                #{ord._id.slice(-6).toUpperCase()}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeClass}`}
                              >
                                {ord.orderStatus}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-white mt-1">
                              {ord.restaurantId?.restaurantName || "Restaurant"}
                            </p>
                            <p className="text-[11px] text-[#8faea7]">
                              {ord.createdAt
                                ? new Date(ord.createdAt).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "N/A"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-bold text-white">
                              ₹{ord.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                            </p>
                            <span
                              className={`text-[10px] font-semibold ${
                                ord.paymentDetails?.paymentStatus === "completed"
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }`}
                            >
                              {ord.paymentDetails?.paymentStatus || "pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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

export default AdminCustomerDetailModal;
