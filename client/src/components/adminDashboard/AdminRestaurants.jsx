import { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import AdminRestaurantDetailModal from "./AdminRestaurantDetailModal";
import {
  MdRestaurant,
  MdRefresh,
  MdSearch,
  MdCheckCircle,
  MdBlock,
  MdVisibility,
  MdClose,
  MdPhone,
  MdLocationOn,
  MdHourglassTop,
} from "react-icons/md";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  active: { label: "Active Partner", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  inactive: { label: "Pending Approval", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  pending: { label: "Pending Approval", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  blocked: { label: "Blocked", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const DEFAULT_COVER = "https://placehold.co/400x300?text=Restaurant";

const AdminRestaurants = ({ initialFilter = "all" }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(initialFilter || "all");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [prevFilter, setPrevFilter] = useState(initialFilter);
  if (initialFilter !== prevFilter) {
    setPrevFilter(initialFilter);
    setSelectedStatus(initialFilter || "all");
  }

  const fetchRestaurants = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const params = {};
      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      if (searchQuery.trim() !== "") {
        params.search = searchQuery.trim();
      }

      const res = await api.get("/admin/restaurants", { params });
      if (Array.isArray(res.data?.data)) {
        setRestaurants(res.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch restaurants",
      );
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const loadInitialRestaurants = async () => {
      try {
        const params = {};
        if (selectedStatus !== "all") {
          params.status = selectedStatus;
        }
        if (searchQuery.trim() !== "") {
          params.search = searchQuery.trim();
        }
        const res = await api.get("/admin/restaurants", { params });
        if (isMounted) {
          if (Array.isArray(res.data?.data)) {
            setRestaurants(res.data.data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to fetch restaurants",
          );
          setIsLoading(false);
        }
      }
    };
    loadInitialRestaurants();
    return () => {
      isMounted = false;
    };
  }, [selectedStatus, searchQuery]);

  const handleUpdateStatus = async (restaurantId, newStatus) => {
    try {
      setActionLoadingId(restaurantId);
      const res = await api.patch(`/admin/restaurants/${restaurantId}/status`, {
        status: newStatus,
      });
      toast.success(res.data?.message || `Restaurant marked as ${newStatus}`);
      await fetchRestaurants();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update restaurant status",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDetail = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setIsDetailModalOpen(true);
  };

  const statusFilters = [
    { key: "all", label: "All Restaurants" },
    { key: "active", label: "Active Partners" },
    { key: "inactive", label: "Pending Approval" },
    { key: "blocked", label: "Blocked" },
  ];

  if (isLoading) return <Loader height="70vh" width="100%" />;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <MdRestaurant className="text-[#f97316]" size={24} />
            Restaurant Management
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Verify restaurant documents, approve new partner kitchens, and manage listings
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
              placeholder="Search name, city, address..."
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
            onClick={() => fetchRestaurants(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
            title="Refresh Restaurants"
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

      {/* Restaurants Table */}
      {restaurants.length === 0 ? (
        <div className="bg-[#072420] rounded-2xl border border-dashed border-teal-800/60 p-12 text-center space-y-3 shadow-xl shadow-black/40">
          <div className="w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
            <MdRestaurant size={32} />
          </div>
          <h3 className="text-sm font-bold text-white">
            No restaurants found
          </h3>
          <p className="text-xs text-[#8faea7] max-w-sm mx-auto">
            {searchQuery
              ? `No restaurants matching "${searchQuery}".`
              : "No restaurant partners match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-3">
            {restaurants.map((rest) => {
              const manager = rest.managerId;
              const statusInfo = statusBadges[rest.status] || {
                label: rest.status || "Unknown",
                bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
              };
              const isActionLoading = actionLoadingId === rest._id;

              return (
                <div
                  key={rest._id}
                  className="bg-[#041916] p-4 rounded-xl border border-teal-800/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {rest.coverImage?.url ? (
                        <img
                          src={rest.coverImage.url}
                          alt={rest.restaurantName}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_COVER;
                          }}
                          className="w-11 h-11 rounded-xl object-cover border border-teal-800/60"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-sm">
                          {rest.restaurantName?.charAt(0) || "R"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-xs text-white">
                          {rest.restaurantName}
                        </p>
                        <p className="text-[10px] text-[#8faea7] flex items-center gap-1">
                          <MdLocationOn size={12} className="text-orange-400" /> {rest.city || "N/A"}
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
                      <p className="text-[10px] text-[#8faea7]">Manager</p>
                      <p className="font-semibold text-white truncate">{manager?.fullName || "Manager"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Contact</p>
                      <p className="text-white truncate">{manager?.phone || rest.contactDetails?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Type</p>
                      <p className="font-semibold text-white capitalize">{rest.restaurantType || "All"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8faea7]">Store Status</p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block ${
                          rest.isOpen
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-teal-900/30 text-[#8faea7] border border-teal-800/40"
                        }`}
                      >
                        {rest.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-900/40">
                    <button
                      onClick={() => handleOpenDetail(rest._id)}
                      className="px-3 py-1.5 rounded-xl border border-teal-800/60 bg-[#072420] hover:bg-teal-900/30 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <MdVisibility size={14} className="text-[#f97316]" />
                      <span>Details</span>
                    </button>

                    {rest.status !== "active" ? (
                      <button
                        onClick={() => handleUpdateStatus(rest._id, "active")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdCheckCircle size={13} />}
                        <span>Approve</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(rest._id, "inactive")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdHourglassTop size={13} />}
                        <span>Set Pending</span>
                      </button>
                    )}

                    {rest.status !== "blocked" ? (
                      <button
                        onClick={() => handleUpdateStatus(rest._id, "blocked")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdBlock size={13} />}
                        <span>Block</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(rest._id, "active")}
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
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Manager Contact</th>
                  <th className="py-3.5 px-4">Type & Cuisines</th>
                  <th className="py-3.5 px-4">Store Open</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/40 text-white">
                {restaurants.map((rest) => {
                  const manager = rest.managerId;
                  const statusInfo = statusBadges[rest.status] || {
                    label: rest.status || "Unknown",
                    bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
                  };
                  const isActionLoading = actionLoadingId === rest._id;

                  return (
                    <tr
                      key={rest._id}
                      className="hover:bg-teal-900/20 transition"
                    >
                      {/* Restaurant Image & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {rest.coverImage?.url ? (
                            <img
                              src={rest.coverImage.url}
                              alt={rest.restaurantName}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_COVER;
                              }}
                              className="w-10 h-10 rounded-xl object-cover border border-teal-800/60"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs">
                              {rest.restaurantName?.charAt(0) || "R"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-white">
                              {rest.restaurantName}
                            </p>
                            <p className="text-[10px] text-[#8faea7] flex items-center gap-1">
                              <MdLocationOn size={11} /> {rest.city || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Manager Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-white">
                            {manager?.fullName || "Manager"}
                          </p>
                          <p className="text-[11px] text-[#8faea7] flex items-center gap-1">
                            <MdPhone size={11} /> {manager?.phone || rest.contactDetails?.phone || "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* Type & Cuisines */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-xs text-white">
                          {rest.restaurantType || "All"}
                        </span>
                        <p className="text-[10px] text-[#8faea7] truncate max-w-[140px]">
                          {rest.cuisinesTypes?.join(", ") || "General"}
                        </p>
                      </td>

                      {/* Store Open/Close */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            rest.isOpen
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-teal-900/30 text-[#8faea7] border border-teal-800/40"
                          }`}
                        >
                          {rest.isOpen ? "Open" : "Closed"}
                        </span>
                      </td>

                      {/* Approval Status */}
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
                            onClick={() => handleOpenDetail(rest._id)}
                            className="px-2.5 py-1.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                            title="View Full Profile & Docs"
                          >
                            <MdVisibility size={14} className="text-[#f97316]" />
                            <span>Details</span>
                          </button>

                          {rest.status !== "active" ? (
                            <button
                              onClick={() => handleUpdateStatus(rest._id, "active")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Approve Restaurant"
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
                              onClick={() => handleUpdateStatus(rest._id, "inactive")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Move to Pending Approval"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdHourglassTop size={13} />
                              )}
                              <span>Set Pending</span>
                            </button>
                          )}

                          {rest.status !== "blocked" ? (
                            <button
                              onClick={() => handleUpdateStatus(rest._id, "blocked")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Block Restaurant"
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
                              onClick={() => handleUpdateStatus(rest._id, "active")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Unblock Restaurant"
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

      {/* Restaurant Detail Modal */}
      {isDetailModalOpen && (
        <AdminRestaurantDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRestaurantId(null);
          }}
          restaurantId={selectedRestaurantId}
          onStatusChange={fetchRestaurants}
        />
      )}
    </div>
  );
};

export default AdminRestaurants;
