import { useState, useEffect, useCallback } from "react";
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
  MdPauseCircle,
} from "react-icons/md";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  active: { label: "Active Approved", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  pending: { label: "Pending Verification", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  inactive: { label: "Inactive", bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40" },
  blocked: { label: "Blocked", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
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

  const [prevFilter, setPrevFilter] = useState(initialFilter);
  if (initialFilter !== prevFilter) {
    setPrevFilter(initialFilter);
    setSelectedStatus(initialFilter || "all");
  }

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
    let isMounted = true;
    const loadInitialRiders = async () => {
      try {
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
        if (isMounted) {
          if (Array.isArray(res.data?.data)) {
            setRiders(res.data.data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to fetch riders",
          );
          setIsLoading(false);
        }
      }
    };
    loadInitialRiders();
    return () => {
      isMounted = false;
    };
  }, [selectedStatus, selectedAvailability, searchQuery]);

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
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <MdDeliveryDining className="text-[#f97316]" size={24} />
            Rider Fleet Management
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Verify driver KYC documents, monitor active couriers, and manage delivery personnel
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <MdSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#537770]"
            />
            <input
              type="text"
              placeholder="Search name, phone, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#041916] border border-teal-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white placeholder-[#537770] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8faea7] hover:text-white cursor-pointer"
              >
                <MdClose size={14} />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchRiders(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
            title="Refresh Riders"
          >
            <MdRefresh
              size={18}
              className={isRefreshing ? "animate-spin text-[#f97316]" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
          {statusFilters.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === tab.key
                  ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-950/40"
                  : "bg-[#041916] text-[#8faea7] hover:text-white border border-teal-800/60 hover:bg-teal-900/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Online / Offline Quick Toggle */}
        <div className="flex items-center gap-1 bg-[#041916] p-1 rounded-xl border border-teal-800/60 text-xs font-semibold">
          <button
            onClick={() => setSelectedAvailability("all")}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              selectedAvailability === "all"
                ? "bg-[#072420] text-white border border-teal-800/60 shadow-xs"
                : "text-[#8faea7] hover:text-white"
            }`}
          >
            All Availability
          </button>
          <button
            onClick={() => setSelectedAvailability("online")}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              selectedAvailability === "online"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                : "text-[#8faea7] hover:text-cyan-300"
            }`}
          >
            Online Only
          </button>
          <button
            onClick={() => setSelectedAvailability("offline")}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              selectedAvailability === "offline"
                ? "bg-teal-900/40 text-gray-300 border border-teal-800/40 shadow-xs"
                : "text-[#8faea7] hover:text-gray-300"
            }`}
          >
            Offline Only
          </button>
        </div>
      </div>

      {/* Riders Table */}
      {riders.length === 0 ? (
        <div className="bg-[#072420] rounded-2xl border border-dashed border-teal-800/60 p-12 text-center space-y-3 shadow-xl shadow-black/40">
          <div className="w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
            <MdDeliveryDining size={32} />
          </div>
          <h3 className="text-sm font-bold text-white">
            No riders found
          </h3>
          <p className="text-xs text-[#8faea7] max-w-sm mx-auto">
            {searchQuery
              ? `No delivery couriers matching "${searchQuery}".`
              : "No riders match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-3">
            {riders.map((rdr) => {
              const user = rdr.riderId;
              const vehicle = rdr.vehicleDetails;
              const statusInfo = statusBadges[rdr.status] || {
                label: rdr.status || "Unknown",
                bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
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
                <div
                  key={rdr._id}
                  className="bg-[#041916] p-4 rounded-xl border border-teal-800/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={user?.fullName || "Rider"}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                          className="w-10 h-10 rounded-full object-cover border border-teal-800/60"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs">
                          {user?.fullName?.charAt(0) || "R"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-xs text-white">
                          {user?.fullName || "Rider"}
                        </p>
                        <p className="text-[10px] text-[#8faea7]">
                          Rating: ★ {rdr.averageRating?.toFixed(1) || "5.0"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-teal-900/40">
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Phone</p>
                      <p className="font-semibold text-white truncate">{user?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Vehicle No.</p>
                      <p className="text-white truncate font-mono">{vehicle?.vehicleNumber || "No Plate"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Vehicle Type</p>
                      <p className="text-white capitalize">{vehicle?.vehicleType || "Bike"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Duty Status</p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block ${
                          rdr.isAvailable
                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                            : "bg-teal-900/30 text-[#8faea7] border border-teal-800/40"
                        }`}
                      >
                        {rdr.isAvailable ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-900/40">
                    <button
                      onClick={() => handleOpenDetail(rdr._id)}
                      className="px-3 py-1.5 rounded-xl border border-teal-800/60 bg-[#072420] hover:bg-teal-900/30 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <MdVisibility size={14} className="text-[#f97316]" />
                      <span>Details</span>
                    </button>

                    {rdr.status !== "active" ? (
                      <button
                        onClick={() => handleUpdateStatus(rdr._id, "active")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdCheckCircle size={13} />}
                        <span>Approve</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(rdr._id, "inactive")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdPauseCircle size={13} />}
                        <span>Inactive</span>
                      </button>
                    )}

                    {rdr.status !== "blocked" ? (
                      <button
                        onClick={() => handleUpdateStatus(rdr._id, "blocked")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdBlock size={13} />}
                        <span>Block</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(rdr._id, "active")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdCheckCircle size={13} />}
                        <span>Unblock</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#041916] text-[#8faea7] font-bold uppercase text-[10px] tracking-wider border-b border-teal-900/60">
                <tr>
                  <th className="py-3.5 px-4">Rider</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Vehicle Details</th>
                  <th className="py-3.5 px-4">Online Status</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/40 text-white">
                {riders.map((rdr) => {
                  const user = rdr.riderId;
                  const vehicle = rdr.vehicleDetails;
                  const statusInfo = statusBadges[rdr.status] || {
                    label: rdr.status || "Unknown",
                    bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
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
                      className="hover:bg-teal-900/20 transition"
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
                              className="w-10 h-10 rounded-full object-cover border border-teal-800/60"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs">
                              {user?.fullName?.charAt(0) || "R"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-white">
                              {user?.fullName || "Rider"}
                            </p>
                            <p className="text-[10px] text-[#8faea7]">
                              Rating: ★ {rdr.averageRating?.toFixed(1) || "5.0"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-xs text-white">
                            <MdPhone className="text-[#8faea7]" size={12} />
                            {user?.phone || "N/A"}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-[#8faea7]">
                            <MdEmail size={11} /> {user?.email || "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* Vehicle Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-xs text-white">
                          {vehicle?.vehicleNumber || "No Plate Number"}
                        </p>
                        <p className="text-[10px] text-[#8faea7]">
                          {vehicle?.vehicleType || "Bike"} • {vehicle?.vehicleModel || "Standard"}
                        </p>
                      </td>

                      {/* Online Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                            rdr.isAvailable
                              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                              : "bg-teal-900/30 text-[#8faea7] border border-teal-800/40"
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
                            className="px-2.5 py-1.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                            title="View KYC & Details"
                          >
                            <MdVisibility size={14} className="text-[#f97316]" />
                            <span>Details</span>
                          </button>

                          {rdr.status !== "active" ? (
                            <button
                              onClick={() => handleUpdateStatus(rdr._id, "active")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
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
                              className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
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
                              className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
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
                              className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
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
