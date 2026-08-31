import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdClose,
  MdDeliveryDining,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdCheckCircle,
  MdBlock,
  MdStar,
  MdOpenInNew,
  MdAccountBalance,
  MdOutlineReceiptLong,
  MdDirectionsBike,
  MdAttachMoney,
  MdGpsFixed,
  MdHourglassTop,
  MdPauseCircle,
} from "react-icons/md";
import { FaMotorcycle, FaFileAlt, FaCoins } from "react-icons/fa";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  active: { label: "Active Approved", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  pending: { label: "Pending Verification", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  inactive: { label: "Inactive", bg: "bg-gray-100 text-gray-800 border-gray-300" },
  blocked: { label: "Blocked", bg: "bg-rose-100 text-rose-800 border-rose-300" },
};

const DEFAULT_AVATAR = "https://placehold.co/150x150?text=Rider";

const AdminRiderDetailModal = ({
  isOpen,
  onClose,
  riderId,
  onStatusChange,
}) => {
  const [riderData, setRiderData] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [activeOrderLoad, setActiveOrderLoad] = useState(0);
  const [totalCompletedDeliveries, setTotalCompletedDeliveries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("profile");

  useEffect(() => {
    if (!isOpen || !riderId) return;

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const [resDetails, resEarnings, resOrders] = await Promise.all([
          api.get(`/admin/riders/${riderId}`),
          api.get(`/admin/riders/${riderId}/earnings`).catch(() => ({ data: { data: null } })),
          api.get(`/admin/riders/${riderId}/orders`).catch(() => ({ data: { data: [] } })),
        ]);

        if (resDetails.data?.data) {
          setRiderData(resDetails.data.data.rider);
          setActiveOrders(resDetails.data.data.activeOrders || []);
          setActiveOrderLoad(resDetails.data.data.activeOrderLoad || 0);
          setTotalCompletedDeliveries(resDetails.data.data.totalCompletedDeliveries || 0);
        }
        if (resEarnings.data?.data) {
          setEarningsData(resEarnings.data.data);
        }
        if (Array.isArray(resOrders.data?.data)) {
          setPastOrders(resOrders.data.data);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load rider details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, riderId]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.patch(`/admin/riders/${riderId}/status`, {
        status: newStatus,
      });
      toast.success(res.data?.message || `Rider status updated to ${newStatus}`);
      if (res.data?.data) {
        setRiderData(res.data.data);
      }
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update rider status",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const user = riderData?.riderId;
  const vehicle = riderData?.vehicleDetails;
  const docs = riderData?.documents;
  const bank = riderData?.financialDetails;
  const currentAddress = riderData?.currentAddress;
  const statusInfo = statusBadges[riderData?.status] || {
    label: riderData?.status || "Unknown",
    bg: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const getPhotoUrl = () => {
    if (!user?.photo) return null;
    if (typeof user.photo === "string") return user.photo;
    if (typeof user.photo === "object" && user.photo.url) return user.photo.url;
    return null;
  };

  const getDocUrl = (docField) => {
    if (!docField) return null;
    if (typeof docField === "string") return docField;
    if (typeof docField === "object" && docField.url) return docField.url;
    return null;
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-(--color-base-100) rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl border border-(--color-base-300) overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-(--color-base-300) flex justify-between items-center bg-(--color-base-200)/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold">
              <MdDeliveryDining size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-(--color-base-content)">
                Rider Verification & Dossier
              </h3>
              <p className="text-xs text-(--color-secondary)">
                ID: {riderData?._id}
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
            {/* Top Rider Summary Card */}
            <div className="bg-(--color-base-200)/60 p-4 rounded-xl border border-(--color-base-300) flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={user?.fullName || "Rider"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                    className="w-14 h-14 rounded-full object-cover border-2 border-(--color-primary)"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-(--color-primary)/20 text-(--color-primary) flex items-center justify-center font-bold text-xl">
                    {user?.fullName?.charAt(0) || "R"}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-(--color-base-content)">
                      {user?.fullName || "Unnamed Rider"}
                    </h4>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        riderData?.isAvailable
                          ? "bg-cyan-100 text-cyan-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {riderData?.isAvailable ? "Online Available" : "Offline"}
                    </span>
                  </div>
                  <p className="text-xs text-(--color-secondary) flex items-center gap-1.5">
                    <MdPhone size={13} /> {user?.phone || "No phone"} • {user?.email || "No email"}
                  </p>
                  <p className="text-[11px] text-(--color-secondary)">
                    Vehicle: {vehicle?.vehicleNumber || "Not entered"} ({vehicle?.vehicleType || "Bike"})
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                {riderData?.status !== "active" && (
                  <button
                    onClick={() => handleUpdateStatus("active")}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdCheckCircle size={14} />
                    )}
                    Approve
                  </button>
                )}

                {riderData?.status !== "pending" && (
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

                {riderData?.status !== "inactive" && (
                  <button
                    onClick={() => handleUpdateStatus("inactive")}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdPauseCircle size={14} />
                    )}
                    Set Inactive
                  </button>
                )}

                {riderData?.status !== "blocked" ? (
                  <button
                    onClick={() => handleUpdateStatus("blocked")}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdBlock size={14} />
                    )}
                    Block
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus("active")}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? (
                      <RiLoader4Fill className="animate-spin" />
                    ) : (
                      <MdCheckCircle size={14} />
                    )}
                    Unblock
                  </button>
                )}
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-(--color-base-300) gap-4 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setActiveModalTab("profile")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "profile"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <FaMotorcycle size={13} /> Profile & Vehicle
              </button>
              <button
                onClick={() => setActiveModalTab("kyc")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "kyc"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <FaFileAlt size={13} /> KYC Documents
              </button>
              <button
                onClick={() => setActiveModalTab("banking")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "banking"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <MdAccountBalance size={15} /> Bank Account
              </button>
              <button
                onClick={() => setActiveModalTab("earnings")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "earnings"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <FaCoins size={13} /> Earnings Summary
              </button>
              <button
                onClick={() => setActiveModalTab("deliveries")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "deliveries"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <MdOutlineReceiptLong size={15} /> Deliveries ({pastOrders.length})
              </button>
            </div>

            {/* Tab 1: Profile & Vehicle */}
            {activeModalTab === "profile" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehicle Details */}
                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Vehicle Specifications
                    </span>
                    <p className="font-bold text-(--color-base-content)">
                      {vehicle?.vehicleNumber || "No Number Registered"}
                    </p>
                    <p className="text-(--color-secondary)">
                      Type: {vehicle?.vehicleType || "Bike"} • Model: {vehicle?.vehicleModel || "Standard"} • Color: {vehicle?.vehicleColor || "N/A"}
                    </p>
                  </div>

                  {/* Rating & Performance */}
                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Performance & Workload
                    </span>
                    <p className="font-bold text-(--color-base-content) flex items-center gap-1">
                      <MdStar className="text-amber-500" size={15} /> {riderData?.averageRating?.toFixed(1) || "5.0"} Rating
                    </p>
                    <p className="text-(--color-secondary)">
                      Active Load: {activeOrderLoad} orders • Completed: {totalCompletedDeliveries} deliveries
                    </p>
                  </div>

                  {/* Current Address */}
                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Residential Address
                    </span>
                    <p className="font-bold text-(--color-base-content)">
                      {currentAddress?.address || "No address entered"}
                    </p>
                    <p className="text-(--color-secondary)">
                      {currentAddress?.city}, {currentAddress?.state} - {currentAddress?.pinCode}, {currentAddress?.country || "India"}
                    </p>
                  </div>

                  {/* GPS Coordinates */}
                  {riderData?.currentLocation?.lat && (
                    <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1 sm:col-span-2">
                      <span className="text-[11px] font-semibold text-(--color-secondary) uppercase flex items-center gap-1">
                        <MdGpsFixed size={13} className="text-(--color-primary)" /> Live Coordinates
                      </span>
                      <p className="font-mono text-(--color-base-content)">
                        Lat: {riderData.currentLocation.lat}, Lon: {riderData.currentLocation.lon}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: KYC Documents */}
            {activeModalTab === "kyc" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Driving License", val: docs?.drivingLicense },
                    { label: "Vehicle RC", val: docs?.vehicleRegistrationCertificate },
                    { label: "Insurance Certificate", val: docs?.insuranceCertificate },
                    { label: "Aadhar Card", val: docs?.aadharCard },
                    { label: "PAN Card", val: docs?.panCard },
                  ].map((d, idx) => {
                    const url = getDocUrl(d.val);
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-2"
                      >
                        <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                          {d.label}
                        </span>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-(--color-primary) hover:underline flex items-center gap-1"
                          >
                            View Document <MdOpenInNew size={13} />
                          </a>
                        ) : (
                          <p className="text-xs text-amber-700 font-medium">Not uploaded</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Bank Account */}
            {activeModalTab === "banking" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Bank Name
                    </span>
                    <p className="font-bold text-(--color-base-content)">
                      {bank?.bankName || "Not provided"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Account Number
                    </span>
                    <p className="font-mono font-bold text-(--color-base-content)">
                      {bank?.accountNumber ? `•••• •••• ${bank.accountNumber.slice(-4)}` : "Not provided"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      IFSC Code
                    </span>
                    <p className="font-mono font-bold text-(--color-base-content)">
                      {bank?.ifscCode || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Earnings Summary */}
            {activeModalTab === "earnings" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300)">
                    <span className="text-[10px] text-(--color-secondary) font-bold uppercase">Total Earnings</span>
                    <p className="text-base font-black text-(--color-primary) mt-0.5">
                      ₹{earningsData?.totalEarnings || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300)">
                    <span className="text-[10px] text-(--color-secondary) font-bold uppercase">Today's Earnings</span>
                    <p className="text-base font-black text-(--color-base-content) mt-0.5">
                      ₹{earningsData?.todayEarnings || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300)">
                    <span className="text-[10px] text-(--color-secondary) font-bold uppercase">Lifetime Deliveries</span>
                    <p className="text-base font-black text-(--color-base-content) mt-0.5">
                      {earningsData?.totalDeliveries || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300)">
                    <span className="text-[10px] text-(--color-secondary) font-bold uppercase">Base Fee Rate</span>
                    <p className="text-base font-black text-(--color-base-content) mt-0.5">
                      ₹{earningsData?.perDeliveryFee || 40} / order
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Deliveries History */}
            {activeModalTab === "deliveries" && (
              <div className="space-y-3">
                {pastOrders.length === 0 ? (
                  <p className="text-xs text-(--color-secondary) text-center py-6">
                    No deliveries completed by this rider yet.
                  </p>
                ) : (
                  <div className="divide-y divide-(--color-base-300) border border-(--color-base-300) rounded-xl overflow-hidden text-xs">
                    {pastOrders.map((ord) => (
                      <div
                        key={ord._id}
                        className="p-3.5 bg-(--color-base-100) hover:bg-(--color-base-200)/40 transition flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-(--color-base-content)">
                              #{ord._id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-800">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-(--color-base-content) mt-0.5">
                            {ord.restaurantId?.restaurantName || "Restaurant"} → {ord.customerId?.customerId?.fullName || "Customer"}
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
                          <p className="font-bold text-xs text-(--color-base-content)">
                            ₹{ord.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                          </p>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            +₹40.00 Fee
                          </span>
                        </div>
                      </div>
                    ))}
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

export default AdminRiderDetailModal;
