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
  verified: { label: "Verified Active", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  pending: { label: "Pending Verification", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  suspended: { label: "Suspended", bg: "bg-rose-100 text-rose-800 border-rose-300" },
};

const orderStatusBadges = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-indigo-100 text-indigo-800",
  pickedUp: "bg-cyan-100 text-cyan-800",
  outForDelivery: "bg-teal-100 text-teal-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-rose-100 text-rose-800",
  rejected: "bg-rose-100 text-rose-800",
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
    bg: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const getPhotoUrl = () => {
    if (!user?.photo) return null;
    if (typeof user.photo === "string") return user.photo;
    if (typeof user.photo === "object" && user.photo.url) return user.photo.url;
    return null;
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-(--color-base-100) rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl border border-(--color-base-300) overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-(--color-base-300) flex justify-between items-center bg-(--color-base-200)/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold">
              <MdPerson size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-(--color-base-content)">
                Customer Details
              </h3>
              <p className="text-xs text-(--color-secondary)">
                ID: {customerData?._id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-(--color-secondary) hover:bg-(--color-base-300) hover:text-(--color-base-content) transition"
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
            <div className="bg-(--color-base-200)/60 p-4 rounded-xl border border-(--color-base-300) flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={user?.fullName || "Customer"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                    className="w-14 h-14 rounded-full object-cover border-2 border-(--color-primary)"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-(--color-primary)/20 text-(--color-primary) flex items-center justify-center font-bold text-xl">
                    {user?.fullName?.charAt(0) || "C"}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-(--color-base-content)">
                      {user?.fullName || "Unnamed Customer"}
                    </h4>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-(--color-secondary) flex items-center gap-1.5">
                    <MdEmail size={13} /> {user?.email || "No email"}
                  </p>
                  <p className="text-xs text-(--color-secondary) flex items-center gap-1.5">
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
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
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
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
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
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
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
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
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
            <div className="flex border-b border-(--color-base-300) gap-4">
              <button
                onClick={() => setActiveModalTab("profile")}
                className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "profile"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <MdPerson size={16} /> Profile & Demographics
              </button>
              <button
                onClick={() => setActiveModalTab("addresses")}
                className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "addresses"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <FaMapMarkerAlt size={13} /> Address Book ({addressBook.length})
              </button>
              <button
                onClick={() => setActiveModalTab("orders")}
                className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "orders"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <FaShoppingBag size={13} /> Order History ({orders.length})
              </button>
            </div>

            {/* Tab 1: Profile & Demographics */}
            {activeModalTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Gender
                    </span>
                    <p className="text-xs font-bold text-(--color-base-content) capitalize">
                      {user?.gender || "Not specified"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Date of Birth
                    </span>
                    <p className="text-xs font-bold text-(--color-base-content)">
                      {user?.dob
                        ? new Date(user.dob).toLocaleDateString("en-IN", {
                            dateStyle: "long",
                          })
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Account Registered On
                    </span>
                    <p className="text-xs font-bold text-(--color-base-content)">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Total Orders Placed
                    </span>
                    <p className="text-xs font-bold text-(--color-base-content)">
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
                  <p className="text-xs text-(--color-secondary) text-center py-6">
                    Customer has not added any addresses yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addressBook.map((addr, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-(--color-base-content) flex items-center gap-1.5 capitalize">
                            <MdLocationOn className="text-(--color-primary)" size={15} />
                            {addr.name} ({addr.addressType || "home"})
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                              Default Address
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-(--color-base-content)">
                          {addr.address}
                        </p>
                        <p className="text-[11px] text-(--color-secondary)">
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
                  <p className="text-xs text-(--color-secondary) text-center py-6">
                    No orders placed by this customer yet.
                  </p>
                ) : (
                  <div className="divide-y divide-(--color-base-300) border border-(--color-base-300) rounded-xl overflow-hidden">
                    {orders.map((ord) => {
                      const badgeClass = orderStatusBadges[ord.orderStatus] || "bg-gray-100 text-gray-800";
                      return (
                        <div
                          key={ord._id}
                          className="p-3.5 bg-(--color-base-100) hover:bg-(--color-base-200)/40 transition flex items-center justify-between gap-4 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-(--color-base-content)">
                                #{ord._id.slice(-6).toUpperCase()}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeClass}`}
                              >
                                {ord.orderStatus}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-(--color-base-content) mt-1">
                              {ord.restaurantId?.restaurantName || "Restaurant"}
                            </p>
                            <p className="text-[11px] text-(--color-secondary)">
                              {ord.createdAt
                                ? new Date(ord.createdAt).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "N/A"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-bold text-(--color-base-content)">
                              ₹{ord.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                            </p>
                            <span
                              className={`text-[10px] font-medium ${
                                ord.paymentDetails?.paymentStatus === "completed"
                                  ? "text-emerald-600"
                                  : "text-amber-600"
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
        <div className="p-4 border-t border-(--color-base-300) bg-(--color-base-200)/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-(--color-base-300) bg-(--color-base-100) hover:bg-(--color-base-200) text-(--color-base-content) transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerDetailModal;
