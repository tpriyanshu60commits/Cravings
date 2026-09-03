import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdClose,
  MdDeliveryDining,
  MdPhone,
  MdCheckCircle,
  MdBlock,
  MdStar,
  MdOpenInNew,
  MdAccountBalance,
  MdOutlineReceiptLong,
  MdGpsFixed,
  MdHourglassTop,
  MdPauseCircle,
} from "react-icons/md";
import { FaMotorcycle, FaFileAlt, FaCoins } from "react-icons/fa";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  active: { label: "Active Approved", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  pending: { label: "Pending Verification", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  inactive: { label: "Inactive", bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40" },
  blocked: { label: "Blocked", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const DEFAULT_AVATAR = "https://placehold.co/150x150?text=Rider";

const AdminRiderDetailModal = ({
  isOpen,
  onClose,
  riderId,
  onStatusChange,
}) => {
  const [riderData, setRiderData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [activeOrderLoad, setActiveOrderLoad] = useState(0);
  const [totalCompletedDeliveries, setTotalCompletedDeliveries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("profile");

  useEffect(() => {
    if (!isOpen || !riderId) return;
    let isMounted = true;

    const fetchDetails = async () => {
      try {
        const [resDetails, resEarnings, resOrders] = await Promise.all([
          api.get(`/admin/riders/${riderId}`),
          api.get(`/admin/riders/${riderId}/earnings`).catch(() => ({ data: { data: null } })),
          api.get(`/admin/riders/${riderId}/orders`).catch(() => ({ data: { data: [] } })),
        ]);

        if (isMounted) {
          if (resDetails.data?.data) {
            setRiderData(resDetails.data.data.rider);
            setActiveOrderLoad(resDetails.data.data.activeOrderLoad || 0);
            setTotalCompletedDeliveries(resDetails.data.data.totalCompletedDeliveries || 0);
          }
          if (resEarnings.data?.data) {
            setEarningsData(resEarnings.data.data);
          }
          if (Array.isArray(resOrders.data?.data)) {
            setPastOrders(resOrders.data.data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to load rider details",
          );
          setIsLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
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
    bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-[#072420] text-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-teal-800/60 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-teal-900/40 flex justify-between items-center bg-[#041916]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold">
              <MdDeliveryDining size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Rider Verification & Dossier
              </h3>
              <p className="text-xs text-[#8faea7] font-mono">
                ID: {riderData?._id}
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
            {/* Top Rider Summary Card */}
            <div className="bg-[#041916] p-4 rounded-xl border border-teal-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={user?.fullName || "Rider"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#f97316]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xl">
                    {user?.fullName?.charAt(0) || "R"}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-white">
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
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "bg-teal-900/30 text-[#8faea7] border border-teal-800/40"
                      }`}
                    >
                      {riderData?.isAvailable ? "Online Available" : "Offline"}
                    </span>
                  </div>
                  <p className="text-xs text-[#8faea7] flex items-center gap-1.5">
                    <MdPhone className="text-[#f97316]" size={13} /> {user?.phone || "No phone"} • {user?.email || "No email"}
                  </p>
                  <p className="text-[11px] text-[#8faea7]">
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
                    className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
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

                {riderData?.status !== "inactive" && (
                  <button
                    onClick={() => handleUpdateStatus("inactive")}
                    disabled={isUpdatingStatus}
                    className="px-3.5 py-1.5 bg-teal-900/40 hover:bg-teal-900/60 border border-teal-800/60 text-[#8faea7] rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
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
                    className="px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
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
                    className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
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
            <div className="flex border-b border-teal-900/40 gap-4 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveModalTab("profile")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "profile"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-[#8faea7] hover:text-white"
                }`}
              >
                <FaMotorcycle size={13} /> Profile & Vehicle
              </button>
              <button
                onClick={() => setActiveModalTab("kyc")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "kyc"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-[#8faea7] hover:text-white"
                }`}
              >
                <FaFileAlt size={13} /> KYC Documents
              </button>
              <button
                onClick={() => setActiveModalTab("banking")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "banking"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-[#8faea7] hover:text-white"
                }`}
              >
                <MdAccountBalance size={15} /> Bank Account
              </button>
              <button
                onClick={() => setActiveModalTab("earnings")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "earnings"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-[#8faea7] hover:text-white"
                }`}
              >
                <FaCoins size={13} /> Earnings Summary
              </button>
              <button
                onClick={() => setActiveModalTab("deliveries")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "deliveries"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-[#8faea7] hover:text-white"
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
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Vehicle Specifications
                    </span>
                    <p className="font-bold text-white">
                      {vehicle?.vehicleNumber || "No Number Registered"}
                    </p>
                    <p className="text-[#8faea7]">
                      Type: {vehicle?.vehicleType || "Bike"} • Model: {vehicle?.vehicleModel || "Standard"} • Color: {vehicle?.vehicleColor || "N/A"}
                    </p>
                  </div>

                  {/* Rating & Performance */}
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Performance & Workload
                    </span>
                    <p className="font-bold text-white flex items-center gap-1">
                      <MdStar className="text-amber-400" size={15} /> {riderData?.averageRating?.toFixed(1) || "5.0"} Rating
                    </p>
                    <p className="text-[#8faea7]">
                      Active Load: {activeOrderLoad} orders • Completed: {totalCompletedDeliveries} deliveries
                    </p>
                  </div>

                  {/* Current Address */}
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Residential Address
                    </span>
                    <p className="font-bold text-white">
                      {currentAddress?.address || "No address entered"}
                    </p>
                    <p className="text-[#8faea7]">
                      {currentAddress?.city}, {currentAddress?.state} - {currentAddress?.pinCode}, {currentAddress?.country || "India"}
                    </p>
                  </div>

                  {/* GPS Coordinates */}
                  {riderData?.currentLocation?.lat && (
                    <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1 sm:col-span-2">
                      <span className="text-[11px] font-semibold text-[#8faea7] uppercase flex items-center gap-1">
                        <MdGpsFixed size={13} className="text-[#f97316]" /> Live Coordinates
                      </span>
                      <p className="font-mono text-white">
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
                        className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-2"
                      >
                        <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                          {d.label}
                        </span>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-[#f97316] hover:underline flex items-center gap-1"
                          >
                            View Document <MdOpenInNew size={13} />
                          </a>
                        ) : (
                          <p className="text-xs text-amber-400 font-medium">Not uploaded</p>
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
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Bank Name
                    </span>
                    <p className="font-bold text-white">
                      {bank?.bankName || "Not provided"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      Account Number
                    </span>
                    <p className="font-mono font-bold text-white">
                      {bank?.accountNumber ? `•••• •••• ${bank.accountNumber.slice(-4)}` : "Not provided"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60 space-y-1">
                    <span className="text-[11px] font-semibold text-[#8faea7] uppercase">
                      IFSC Code
                    </span>
                    <p className="font-mono font-bold text-white">
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
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60">
                    <span className="text-[10px] text-[#8faea7] font-bold uppercase">Total Earnings</span>
                    <p className="text-base font-black text-[#f97316] mt-0.5">
                      ₹{earningsData?.totalEarnings || 0}
                    </p>
                  </div>
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60">
                    <span className="text-[10px] text-[#8faea7] font-bold uppercase">Today's Earnings</span>
                    <p className="text-base font-black text-white mt-0.5">
                      ₹{earningsData?.todayEarnings || 0}
                    </p>
                  </div>
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60">
                    <span className="text-[10px] text-[#8faea7] font-bold uppercase">Lifetime Deliveries</span>
                    <p className="text-base font-black text-white mt-0.5">
                      {earningsData?.totalDeliveries || 0}
                    </p>
                  </div>
                  <div className="p-3.5 bg-[#041916] rounded-xl border border-teal-800/60">
                    <span className="text-[10px] text-[#8faea7] font-bold uppercase">Base Fee Rate</span>
                    <p className="text-base font-black text-white mt-0.5">
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
                  <p className="text-xs text-[#8faea7] text-center py-6">
                    No deliveries completed by this rider yet.
                  </p>
                ) : (
                  <div className="divide-y divide-teal-900/40 border border-teal-800/60 rounded-xl overflow-hidden text-xs">
                    {pastOrders.map((ord) => (
                      <div
                        key={ord._id}
                        className="p-3.5 bg-[#041916] hover:bg-teal-900/20 transition flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">
                              #{ord._id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white mt-0.5">
                            {ord.restaurantId?.restaurantName || "Restaurant"} → {ord.customerId?.customerId?.fullName || "Customer"}
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
                          <p className="font-bold text-xs text-white">
                            ₹{ord.billDetails?.finalAmount?.toFixed(2) || "0.00"}
                          </p>
                          <span className="text-[10px] text-emerald-400 font-semibold">
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

export default AdminRiderDetailModal;
