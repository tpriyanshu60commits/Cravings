import React, { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import AdminRiderDetailModal from "./AdminRiderDetailModal";
import {
  MdDeliveryDining,
  MdRefresh,
  MdSearch,
  MdCheckCircle,
  MdBlock,
  MdVisibility,
  MdClose,
  MdPhone,
  MdEmail,
  MdHourglassTop,
  MdPauseCircle,
} from "react-icons/md";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  active: { label: "Active Approved", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  pending: { label: "Pending Verification", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  inactive: { label: "Inactive", bg: "bg-gray-100 text-gray-800 border-gray-300" },
  blocked: { label: "Blocked", bg: "bg-rose-100 text-rose-800 border-rose-300" },
};

const DEFAULT_AVATAR = "https://placehold.co/150x150?text=Rider";

const AdminRiders = ({ initialFilter = "all" }) => {
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(initialFilter || "all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [selectedRiderId, setSelectedRiderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (initialFilter) {
      setSelectedStatus(initialFilter);
    }
  }, [initialFilter]);

  const fetchRiders = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const params = {};
      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      if (selectedAvailability !== "all") {
        params.isAvailable = selectedAvailability === "online";
      }
      if (searchQuery.trim() !== "") {
        params.search = searchQuery.trim();
      }

      const res = await api.get("/admin/riders", { params });
      if (Array.isArray(res.data?.data)) {
        setRiders(res.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch riders",
      );
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [selectedStatus, selectedAvailability, searchQuery]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const handleUpdateStatus = async (riderId, newStatus) => {
    try {
      setActionLoadingId(riderId);
      const res = await api.patch(`/admin/riders/${riderId}/status`, {
        status: newStatus,
      });
      toast.success(res.data?.message || `Rider status updated to ${newStatus}`);
      await fetchRiders();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update rider status",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDetail = (riderId) => {
    setSelectedRiderId(riderId);
    setIsDetailModalOpen(true);
  };

  const statusFilters = [
    { key: "all", label: "All Riders" },
    { key: "active", label: "Active Approved" },
    { key: "pending", label: "Pending Verification" },
    { key: "inactive", label: "Inactive" },
    { key: "blocked", label: "Blocked" },
  ];

  if (isLoading) return <Loader height="70vh" width="100%" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-(--color-base-content) flex items-center gap-2">
            <MdDeliveryDining className="text-(--color-primary)" size={24} />
            Rider Fleet Management
          </h1>
          <p className="text-xs text-(--color-secondary) mt-0.5">
            Verify driver KYC documents, monitor active couriers, and manage delivery personnel
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <MdSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-secondary)"
            />
            <input
              type="text"
              placeholder="Search name, phone, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-(--color-base-200) border border-(--color-base-300) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-(--color-base-content)"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <MdClose size={14} />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchRiders(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-(--color-base-300) bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) transition flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Refresh Riders"
          >
            <MdRefresh
              size={18}
              className={isRefreshing ? "animate-spin text-(--color-primary)" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin">
          {statusFilters.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedStatus === tab.key
                  ? "bg-(--color-primary) text-(--color-primary-content) border-(--color-primary) shadow-xs"
                  : "bg-(--color-base-100) text-(--color-base-content) border-(--color-base-300) hover:bg-(--color-base-200)"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Online / Offline Quick Toggle */}
        <div className="flex items-center gap-1 bg-(--color-base-100) p-1 rounded-xl border border-(--color-base-300) text-xs font-semibold">
          <button
            onClick={() => setSelectedAvailability("all")}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedAvailability === "all"
                ? "bg-(--color-base-300) text-(--color-base-content)"
                : "text-(--color-secondary) hover:text-(--color-base-content)"
            }`}
          >
            All Availability
          </button>
          <button
            onClick={() => setSelectedAvailability("online")}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedAvailability === "online"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-cyan-800 hover:text-cyan-900"
            }`}
          >
            Online Only
          </button>
          <button
            onClick={() => setSelectedAvailability("offline")}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedAvailability === "offline"
                ? "bg-gray-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Offline Only
          </button>
        </div>
      </div>

      {/* Riders Table */}
      {riders.length === 0 ? (
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-(--color-base-200) flex items-center justify-center mx-auto text-(--color-secondary)">
            <MdDeliveryDining size={32} />
          </div>
          <h3 className="text-sm font-bold text-(--color-base-content)">
            No riders found
          </h3>
          <p className="text-xs text-(--color-secondary) max-w-sm mx-auto">
            {searchQuery
              ? `No delivery couriers matching "${searchQuery}".`
              : "No riders match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-(--color-base-200) text-(--color-secondary) font-bold uppercase text-[10px] tracking-wider border-b border-(--color-base-300)">
                <tr>
                  <th className="py-3 px-4">Rider</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Online Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/60 text-(--color-base-content)">
                {riders.map((rdr) => {
                  const user = rdr.riderId;
                  const vehicle = rdr.vehicleDetails;
                  const statusInfo = statusBadges[rdr.status] || {
                    label: rdr.status || "Unknown",
                    bg: "bg-gray-100 text-gray-800 border-gray-300",
                  };
                  const isActionLoading = actionLoadingId === rdr._id;

                  const getPhotoUrl = () => {
                    if (!user?.photo) return null;
                    if (typeof user.photo === "string") return user.photo;
                    if (typeof user.photo === "object" && user.photo.url) return user.photo.url;
                    return null;
                  };

                  const photoUrl = getPhotoUrl();

                  return (
                    <tr
                      key={rdr._id}
                      className="hover:bg-(--color-base-200)/40 transition"
                    >
                      {/* Rider Photo & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={user?.fullName || "Rider"}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_AVATAR;
                              }}
                              className="w-10 h-10 rounded-full object-cover border border-(--color-base-300)"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold text-xs">
                              {user?.fullName?.charAt(0) || "R"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-(--color-base-content)">
                              {user?.fullName || "Rider"}
                            </p>
                            <p className="text-[10px] text-(--color-secondary)">
                              Rating: ★ {rdr.averageRating?.toFixed(1) || "5.0"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-xs text-(--color-base-content)">
                            <MdPhone className="text-(--color-secondary)" size={12} />
                            {user?.phone || "N/A"}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-(--color-secondary)">
                            <MdEmail size={11} /> {user?.email || "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* Vehicle Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-xs text-(--color-base-content)">
                          {vehicle?.vehicleNumber || "No Plate Number"}
                        </p>
                        <p className="text-[10px] text-(--color-secondary)">
                          {vehicle?.vehicleType || "Bike"} • {vehicle?.vehicleModel || "Standard"}
                        </p>
                      </td>

                      {/* Online Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            rdr.isAvailable
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {rdr.isAvailable ? "Online" : "Offline"}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border inline-block ${statusInfo.bg}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleOpenDetail(rdr._id)}
                            className="px-2.5 py-1.5 rounded-lg border border-(--color-base-300) hover:bg-(--color-base-200) text-(--color-base-content) font-medium text-xs transition flex items-center gap-1"
                            title="View KYC & Details"
                          >
                            <MdVisibility size={14} className="text-(--color-primary)" />
                            <span>Details</span>
                          </button>

                          {rdr.status !== "active" ? (
                            <button
                              onClick={() => handleUpdateStatus(rdr._id, "active")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs transition flex items-center gap-1"
                              title="Approve Rider"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdCheckCircle size={13} />
                              )}
                              <span>Approve</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(rdr._id, "inactive")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium text-xs transition flex items-center gap-1"
                              title="Mark Inactive"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdPauseCircle size={13} />
                              )}
                              <span>Inactive</span>
                            </button>
                          )}

                          {rdr.status !== "blocked" ? (
                            <button
                              onClick={() => handleUpdateStatus(rdr._id, "blocked")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs transition flex items-center gap-1"
                              title="Block Rider"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdBlock size={13} />
                              )}
                              <span>Block</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(rdr._id, "active")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs transition flex items-center gap-1"
                              title="Unblock Rider"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdCheckCircle size={13} />
                              )}
                              <span>Unblock</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rider Detail Modal */}
      {isDetailModalOpen && (
        <AdminRiderDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRiderId(null);
          }}
          riderId={selectedRiderId}
          onStatusChange={fetchRiders}
        />
      )}
    </div>
  );
};

export default AdminRiders;
