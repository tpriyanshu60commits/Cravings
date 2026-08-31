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
  active: { label: "Active Partner", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  inactive: { label: "Pending Approval", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  pending: { label: "Pending Approval", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  blocked: { label: "Blocked", bg: "bg-rose-100 text-rose-800 border-rose-300" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-(--color-base-content) flex items-center gap-2">
            <MdRestaurant className="text-(--color-primary)" size={24} />
            Restaurant Management
          </h1>
          <p className="text-xs text-(--color-secondary) mt-0.5">
            Verify restaurant documents, approve new partner kitchens, and manage listings
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
              placeholder="Search name, city, address..."
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
            onClick={() => fetchRestaurants(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-(--color-base-300) bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) transition flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Refresh Restaurants"
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

      {/* Restaurants Table */}
      {restaurants.length === 0 ? (
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-(--color-base-200) flex items-center justify-center mx-auto text-(--color-secondary)">
            <MdRestaurant size={32} />
          </div>
          <h3 className="text-sm font-bold text-(--color-base-content)">
            No restaurants found
          </h3>
          <p className="text-xs text-(--color-secondary) max-w-sm mx-auto">
            {searchQuery
              ? `No restaurants matching "${searchQuery}".`
              : "No restaurant partners match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-(--color-base-200) text-(--color-secondary) font-bold uppercase text-[10px] tracking-wider border-b border-(--color-base-300)">
                <tr>
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Manager Contact</th>
                  <th className="py-3 px-4">Type & Cuisines</th>
                  <th className="py-3 px-4">Store Open</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/60 text-(--color-base-content)">
                {restaurants.map((rest) => {
                  const manager = rest.managerId;
                  const statusInfo = statusBadges[rest.status] || {
                    label: rest.status || "Unknown",
                    bg: "bg-gray-100 text-gray-800 border-gray-300",
                  };
                  const isActionLoading = actionLoadingId === rest._id;

                  return (
                    <tr
                      key={rest._id}
                      className="hover:bg-(--color-base-200)/40 transition"
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
                              className="w-10 h-10 rounded-xl object-cover border border-(--color-base-300)"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold text-xs">
                              {rest.restaurantName?.charAt(0) || "R"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-(--color-base-content)">
                              {rest.restaurantName}
                            </p>
                            <p className="text-[10px] text-(--color-secondary) flex items-center gap-1">
                              <MdLocationOn size={11} /> {rest.city || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Manager Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-(--color-base-content)">
                            {manager?.fullName || "Manager"}
                          </p>
                          <p className="text-[11px] text-(--color-secondary) flex items-center gap-1">
                            <MdPhone size={11} /> {manager?.phone || rest.contactDetails?.phone || "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* Type & Cuisines */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-xs text-(--color-base-content)">
                          {rest.restaurantType || "All"}
                        </span>
                        <p className="text-[10px] text-(--color-secondary) truncate max-w-[140px]">
                          {rest.cuisinesTypes?.join(", ") || "General"}
                        </p>
                      </td>

                      {/* Store Open/Close */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            rest.isOpen
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-200 text-gray-700"
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
                            className="px-2.5 py-1.5 rounded-lg border border-(--color-base-300) hover:bg-(--color-base-200) text-(--color-base-content) font-medium text-xs transition flex items-center gap-1"
                            title="View Full Profile & Docs"
                          >
                            <MdVisibility size={14} className="text-(--color-primary)" />
                            <span>Details</span>
                          </button>

                          {rest.status !== "active" ? (
                            <button
                              onClick={() => handleUpdateStatus(rest._id, "active")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs transition flex items-center gap-1"
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
                              className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium text-xs transition flex items-center gap-1"
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
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs transition flex items-center gap-1"
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
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs transition flex items-center gap-1"
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
