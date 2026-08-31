import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import {
  MdClose,
  MdRestaurant,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdCheckCircle,
  MdBlock,
  MdAccessTime,
  MdOutlineReceiptLong,
  MdMenuBook,
  MdDescription,
  MdAccountBalance,
  MdOpenInNew,
  MdStar,
  MdHourglassTop,
} from "react-icons/md";
import { FaUtensils, FaStore, FaFileAlt } from "react-icons/fa";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  active: { label: "Active Partner", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  inactive: { label: "Pending Approval", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  pending: { label: "Pending Approval", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  blocked: { label: "Blocked", bg: "bg-rose-100 text-rose-800 border-rose-300" },
};

const DEFAULT_COVER = "https://placehold.co/600x400?text=Restaurant+Cover";
const DEFAULT_DISH = "https://placehold.co/200x200?text=Dish";

const AdminRestaurantDetailModal = ({
  isOpen,
  onClose,
  restaurantId,
  onStatusChange,
}) => {
  const [restaurantData, setRestaurantData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("profile");

  useEffect(() => {
    if (!isOpen || !restaurantId) return;

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const [resDetails, resOrders] = await Promise.all([
          api.get(`/admin/restaurants/${restaurantId}`),
          api.get(`/admin/restaurants/${restaurantId}/orders`).catch(() => ({ data: { data: [] } })),
        ]);

        if (resDetails.data?.data) {
          setRestaurantData(resDetails.data.data.restaurant);
          setMenuItems(resDetails.data.data.menu || []);
        }
        if (Array.isArray(resOrders.data?.data)) {
          setOrders(resOrders.data.data);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load restaurant details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, restaurantId]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.patch(`/admin/restaurants/${restaurantId}/status`, {
        status: newStatus,
      });
      toast.success(res.data?.message || `Restaurant status updated to ${newStatus}`);
      if (res.data?.data) {
        setRestaurantData(res.data.data);
      }
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update restaurant status",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const manager = restaurantData?.managerId;
  const legal = restaurantData?.legal;
  const docs = restaurantData?.documents;
  const bank = restaurantData?.financialDetails;
  const statusInfo = statusBadges[restaurantData?.status] || {
    label: restaurantData?.status || "Unknown",
    bg: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const getDocUrl = (docField) => {
    if (!docField) return null;
    if (typeof docField === "string") return docField;
    if (typeof docField === "object" && docField.url) return docField.url;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-(--color-base-100) rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl border border-(--color-base-300) overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-(--color-base-300) flex justify-between items-center bg-(--color-base-200)/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold">
              <MdRestaurant size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-(--color-base-content)">
                Restaurant Verification & Profile
              </h3>
              <p className="text-xs text-(--color-secondary)">
                ID: {restaurantData?._id}
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
            {/* Top Restaurant Summary Card */}
            <div className="bg-(--color-base-200)/60 p-4 rounded-xl border border-(--color-base-300) flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {restaurantData?.coverImage?.url ? (
                  <img
                    src={restaurantData.coverImage.url}
                    alt={restaurantData.restaurantName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_COVER;
                    }}
                    className="w-16 h-16 rounded-xl object-cover border border-(--color-base-300)"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-(--color-primary)/20 text-(--color-primary) flex items-center justify-center font-bold text-2xl">
                    {restaurantData?.restaurantName?.charAt(0) || "R"}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-(--color-base-content)">
                      {restaurantData?.restaurantName || "Unnamed Restaurant"}
                    </h4>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        restaurantData?.isOpen
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {restaurantData?.isOpen ? "Store Open" : "Store Closed"}
                    </span>
                  </div>
                  <p className="text-xs text-(--color-secondary) flex items-center gap-1.5">
                    <MdLocationOn size={13} /> {restaurantData?.city || ""}, {restaurantData?.state || ""}
                  </p>
                  <p className="text-[11px] text-(--color-secondary)">
                    Manager: {manager?.fullName || "N/A"} ({manager?.phone || "No phone"})
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                {restaurantData?.status !== "active" && (
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

                {restaurantData?.status !== "inactive" && restaurantData?.status !== "pending" && (
                  <button
                    onClick={() => handleUpdateStatus("inactive")}
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

                {restaurantData?.status !== "blocked" ? (
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
                <FaStore size={13} /> Overview & Contact
              </button>
              <button
                onClick={() => setActiveModalTab("legal")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "legal"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <FaFileAlt size={13} /> Legal & KYC Docs
              </button>
              <button
                onClick={() => setActiveModalTab("banking")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "banking"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <MdAccountBalance size={15} /> Banking Details
              </button>
              <button
                onClick={() => setActiveModalTab("menu")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "menu"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <MdMenuBook size={15} /> Menu ({menuItems.length})
              </button>
              <button
                onClick={() => setActiveModalTab("orders")}
                className={`pb-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                  activeModalTab === "orders"
                    ? "border-(--color-primary) text-(--color-primary)"
                    : "border-transparent text-(--color-secondary) hover:text-(--color-base-content)"
                }`}
              >
                <MdOutlineReceiptLong size={15} /> Orders ({orders.length})
              </button>
            </div>

            {/* Tab 1: Overview & Contact */}
            {activeModalTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Restaurant Type & Cuisines
                    </span>
                    <p className="font-bold text-(--color-base-content) capitalize">
                      {restaurantData?.restaurantType || "All"}
                    </p>
                    <p className="text-(--color-secondary)">
                      {restaurantData?.cuisinesTypes?.join(", ") || "No cuisines listed"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Serving Hours & Rating
                    </span>
                    <p className="font-bold text-(--color-base-content) flex items-center gap-1">
                      <MdAccessTime size={14} className="text-(--color-primary)" />
                      {restaurantData?.servingHours?.openingTime || "N/A"} -{" "}
                      {restaurantData?.servingHours?.closingTime || "N/A"}
                    </p>
                    <p className="text-(--color-secondary) flex items-center gap-1">
                      <MdStar className="text-amber-500" size={14} />{" "}
                      {restaurantData?.averageRating?.toFixed(1) || "5.0"} average rating
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Full Address
                    </span>
                    <p className="font-bold text-(--color-base-content)">
                      {restaurantData?.address || "No address entered"}
                    </p>
                    <p className="text-(--color-secondary)">
                      {restaurantData?.city}, {restaurantData?.state} - {restaurantData?.pinCode}, {restaurantData?.country || "India"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Description
                    </span>
                    <p className="text-(--color-base-content)">
                      {restaurantData?.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Gallery Photos */}
                {restaurantData?.restaurantImage?.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-(--color-base-content) uppercase">
                      Gallery Images ({restaurantData.restaurantImage.length})
                    </h5>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {restaurantData.restaurantImage.map((img, idx) => (
                        <a
                          key={idx}
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block aspect-video rounded-lg overflow-hidden border border-(--color-base-300) hover:opacity-80 transition"
                        >
                          <img
                            src={img.url}
                            alt={`Gallery ${idx + 1}`}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_COVER;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Legal & Documents */}
            {activeModalTab === "legal" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Legal Entity Name
                    </span>
                    <p className="font-bold text-(--color-base-content)">
                      {legal?.legalName || "Not provided"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-1">
                    <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                      Company Type
                    </span>
                    <p className="font-bold text-(--color-base-content) capitalize">
                      {legal?.companyType || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-(--color-base-content) uppercase">
                    Uploaded Certificates & Documents
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-2">
                      <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                        GST Certificate
                      </span>
                      {getDocUrl(docs?.gstCertificate) ? (
                        <a
                          href={getDocUrl(docs?.gstCertificate)}
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

                    <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-2">
                      <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                        FSSAI Certificate
                      </span>
                      {getDocUrl(docs?.fssaiCertificate) ? (
                        <a
                          href={getDocUrl(docs?.fssaiCertificate)}
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

                    <div className="p-3.5 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) space-y-2">
                      <span className="text-[11px] font-semibold text-(--color-secondary) uppercase">
                        PAN Card
                      </span>
                      {getDocUrl(docs?.panCard) ? (
                        <a
                          href={getDocUrl(docs?.panCard)}
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
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Banking Details */}
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

            {/* Tab 4: Menu Items */}
            {activeModalTab === "menu" && (
              <div className="space-y-3">
                {menuItems.length === 0 ? (
                  <p className="text-xs text-(--color-secondary) text-center py-6">
                    No menu items listed by this restaurant.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {menuItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-(--color-base-200)/40 rounded-xl border border-(--color-base-300) flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {item.image?.url ? (
                            <img
                              src={item.image.url}
                              alt={item.itemName}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_DISH;
                              }}
                              className="w-11 h-11 rounded-lg object-cover border border-(--color-base-300)"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold">
                              {item.itemName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-(--color-base-content)">
                              {item.itemName}
                            </p>
                            <p className="text-[11px] text-(--color-secondary)">
                              {item.category} • {item.foodType}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-xs text-(--color-primary)">
                            ₹{item.itemPrice}
                          </p>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                              item.status === "available"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Restaurant Orders */}
            {activeModalTab === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-xs text-(--color-secondary) text-center py-6">
                    No orders placed with this restaurant yet.
                  </p>
                ) : (
                  <div className="divide-y divide-(--color-base-300) border border-(--color-base-300) rounded-xl overflow-hidden text-xs">
                    {orders.map((ord) => (
                      <div
                        key={ord._id}
                        className="p-3.5 bg-(--color-base-100) hover:bg-(--color-base-200)/40 transition flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-(--color-base-content)">
                              #{ord._id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-(--color-base-content) mt-0.5">
                            Customer: {ord.customerId?.customerId?.fullName || "Customer"}
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
                          <span className="text-[10px] text-(--color-secondary)">
                            {ord.orderItems?.length || 0} items
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

export default AdminRestaurantDetailModal;
