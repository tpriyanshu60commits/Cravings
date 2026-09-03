import { useState, useEffect, useCallback } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";
import AdminCustomerDetailModal from "./AdminCustomerDetailModal";
import {
  MdPeople,
  MdRefresh,
  MdSearch,
  MdCheckCircle,
  MdBlock,
  MdVisibility,
  MdClose,
  MdPhone,
  MdEmail,
  MdHourglassTop,
} from "react-icons/md";
import { RiLoader4Fill } from "react-icons/ri";

const statusBadges = {
  verified: { label: "Verified Active", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  pending: { label: "Pending Verification", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  suspended: { label: "Suspended", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const DEFAULT_AVATAR = "https://placehold.co/150x150?text=Customer";

const AdminCustomers = ({ initialFilter = "all" }) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(initialFilter || "all");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [prevFilter, setPrevFilter] = useState(initialFilter);
  if (initialFilter !== prevFilter) {
    setPrevFilter(initialFilter);
    setSelectedStatus(initialFilter || "all");
  }

  const fetchCustomers = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const params = {};
      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      if (searchQuery.trim() !== "") {
        params.search = searchQuery.trim();
      }

      const res = await api.get("/admin/customers", { params });
      if (Array.isArray(res.data?.data)) {
        setCustomers(res.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch customers",
      );
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const loadInitialCustomers = async () => {
      try {
        const params = {};
        if (selectedStatus !== "all") {
          params.status = selectedStatus;
        }
        if (searchQuery.trim() !== "") {
          params.search = searchQuery.trim();
        }
        const res = await api.get("/admin/customers", { params });
        if (isMounted) {
          if (Array.isArray(res.data?.data)) {
            setCustomers(res.data.data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to fetch customers",
          );
          setIsLoading(false);
        }
      }
    };
    loadInitialCustomers();
    return () => {
      isMounted = false;
    };
  }, [selectedStatus, searchQuery]);

  const handleUpdateStatus = async (customerId, newStatus) => {
    try {
      setActionLoadingId(customerId);
      const res = await api.patch(`/admin/customers/${customerId}/status`, {
        status: newStatus,
      });
      toast.success(res.data?.message || `Customer marked as ${newStatus}`);
      await fetchCustomers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update customer status",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDetail = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsDetailModalOpen(true);
  };

  const statusFilters = [
    { key: "all", label: "All Customers" },
    { key: "verified", label: "Verified Active" },
    { key: "pending", label: "Pending Verification" },
    { key: "suspended", label: "Suspended" },
  ];

  if (isLoading) return <Loader height="70vh" width="100%" />;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <MdPeople className="text-[#f97316]" size={24} />
            Customer Management
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Monitor registered customers, verify identities, and manage account statuses
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
              placeholder="Search name, email, phone..."
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
            onClick={() => fetchCustomers(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
            title="Refresh Customers"
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

      {/* Customers Table / List */}
      {customers.length === 0 ? (
        <div className="bg-[#072420] rounded-2xl border border-dashed border-teal-800/60 p-12 text-center space-y-3 shadow-xl shadow-black/40">
          <div className="w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
            <MdPeople size={32} />
          </div>
          <h3 className="text-sm font-bold text-white">
            No customers found
          </h3>
          <p className="text-xs text-[#8faea7] max-w-sm mx-auto">
            {searchQuery
              ? `No customer accounts matching "${searchQuery}".`
              : "No customer accounts match the selected status filter."}
          </p>
        </div>
      ) : (
        <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-3">
            {customers.map((cust) => {
              const user = cust.customerId;
              const statusInfo = statusBadges[cust.status] || {
                label: cust.status || "Unknown",
                bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
              };
              const isActionLoading = actionLoadingId === cust._id;

              const getPhotoUrl = () => {
                if (!user?.photo) return null;
                if (typeof user.photo === "string") return user.photo;
                if (typeof user.photo === "object" && user.photo.url) return user.photo.url;
                return null;
              };

              const photoUrl = getPhotoUrl();

              return (
                <div
                  key={cust._id}
                  className="bg-[#041916] p-4 rounded-xl border border-teal-800/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={user?.fullName || "Customer"}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                          className="w-10 h-10 rounded-full object-cover border border-teal-800/60"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-sm">
                          {user?.fullName?.charAt(0) || "C"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-xs text-white">
                          {user?.fullName || "Customer"}
                        </p>
                        <p className="text-[10px] text-[#8faea7] font-mono">
                          ID: #{cust._id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#8faea7] pt-2 border-t border-teal-900/40">
                    <p className="flex items-center gap-1.5 text-white">
                      <MdEmail className="text-orange-400" size={13} /> {user?.email || "N/A"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MdPhone size={13} /> {user?.phone || "N/A"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-900/40">
                    <button
                      onClick={() => handleOpenDetail(cust._id)}
                      className="px-3 py-1.5 rounded-xl border border-teal-800/60 bg-[#072420] hover:bg-teal-900/30 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <MdVisibility size={14} className="text-[#f97316]" />
                      <span>Details</span>
                    </button>

                    {cust.status !== "verified" ? (
                      <button
                        onClick={() => handleUpdateStatus(cust._id, "verified")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdCheckCircle size={13} />}
                        <span>Verify</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(cust._id, "pending")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdHourglassTop size={13} />}
                        <span>Pending</span>
                      </button>
                    )}

                    {cust.status !== "suspended" ? (
                      <button
                        onClick={() => handleUpdateStatus(cust._id, "suspended")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdBlock size={13} />}
                        <span>Suspend</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(cust._id, "verified")}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        {isActionLoading ? <RiLoader4Fill className="animate-spin" /> : <MdCheckCircle size={13} />}
                        <span>Reactivate</span>
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
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/40 text-white">
                {customers.map((cust) => {
                  const user = cust.customerId;
                  const statusInfo = statusBadges[cust.status] || {
                    label: cust.status || "Unknown",
                    bg: "bg-teal-900/30 text-[#8faea7] border border-teal-800/40",
                  };
                  const isActionLoading = actionLoadingId === cust._id;

                  const getPhotoUrl = () => {
                    if (!user?.photo) return null;
                    if (typeof user.photo === "string") return user.photo;
                    if (typeof user.photo === "object" && user.photo.url) return user.photo.url;
                    return null;
                  };

                  const photoUrl = getPhotoUrl();

                  return (
                    <tr
                      key={cust._id}
                      className="hover:bg-teal-900/20 transition"
                    >
                      {/* Customer Photo & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={user?.fullName || "Customer"}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_AVATAR;
                              }}
                              className="w-9 h-9 rounded-full object-cover border border-teal-800/60"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs">
                              {user?.fullName?.charAt(0) || "C"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-white">
                              {user?.fullName || "Customer"}
                            </p>
                            <p className="text-[10px] text-[#8faea7] font-mono">
                              ID: #{cust._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-xs text-white">
                            <MdEmail className="text-[#8faea7]" size={12} />
                            {user?.email || "N/A"}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-[#8faea7]">
                            <MdPhone size={12} />
                            {user?.phone || "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border inline-block ${statusInfo.bg}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="py-3.5 px-4 text-[11px] text-[#8faea7]">
                        {cust.createdAt
                          ? new Date(cust.createdAt).toLocaleDateString("en-IN", {
                              dateStyle: "medium",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleOpenDetail(cust._id)}
                            className="px-2.5 py-1.5 rounded-xl border border-teal-800/60 bg-[#041916] hover:bg-teal-900/30 text-white font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                            title="View Customer Details"
                          >
                            <MdVisibility size={14} className="text-[#f97316]" />
                            <span>Details</span>
                          </button>

                          {cust.status !== "verified" ? (
                            <button
                              onClick={() => handleUpdateStatus(cust._id, "verified")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Verify Customer"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdCheckCircle size={13} />
                              )}
                              <span>Verify</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(cust._id, "pending")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Mark as Pending"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdHourglassTop size={13} />
                              )}
                              <span>Pending</span>
                            </button>
                          )}

                          {cust.status !== "suspended" ? (
                            <button
                              onClick={() => handleUpdateStatus(cust._id, "suspended")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Suspend Customer"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdBlock size={13} />
                              )}
                              <span>Suspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(cust._id, "verified")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                              title="Reactivate Customer"
                            >
                              {isActionLoading ? (
                                <RiLoader4Fill className="animate-spin" />
                              ) : (
                                <MdCheckCircle size={13} />
                              )}
                              <span>Reactivate</span>
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

      {/* Customer Detail Modal */}
      {isDetailModalOpen && (
        <AdminCustomerDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCustomerId(null);
          }}
          customerId={selectedCustomerId}
          onStatusChange={fetchCustomers}
        />
      )}
    </div>
  );
};

export default AdminCustomers;
