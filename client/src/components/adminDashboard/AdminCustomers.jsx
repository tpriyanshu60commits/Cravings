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
  verified: { label: "Verified Active", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  pending: { label: "Pending Verification", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  suspended: { label: "Suspended", bg: "bg-rose-100 text-rose-800 border-rose-300" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-(--color-base-content) flex items-center gap-2">
            <MdPeople className="text-(--color-primary)" size={24} />
            Customer Management
          </h1>
          <p className="text-xs text-(--color-secondary) mt-0.5">
            Monitor registered customers, verify identities, and manage account statuses
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
              placeholder="Search name, email, phone..."
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
            onClick={() => fetchCustomers(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-(--color-base-300) bg-(--color-base-200) hover:bg-(--color-base-300) text-(--color-base-content) transition flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Refresh Customers"
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

      {/* Customers Table / List */}
      {customers.length === 0 ? (
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-(--color-base-200) flex items-center justify-center mx-auto text-(--color-secondary)">
            <MdPeople size={32} />
          </div>
          <h3 className="text-sm font-bold text-(--color-base-content)">
            No customers found
          </h3>
          <p className="text-xs text-(--color-secondary) max-w-sm mx-auto">
            {searchQuery
              ? `No customer accounts matching "${searchQuery}".`
              : "No customer accounts match the selected status filter."}
          </p>
        </div>
      ) : (
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-(--color-base-200) text-(--color-secondary) font-bold uppercase text-[10px] tracking-wider border-b border-(--color-base-300)">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-base-300)/60 text-(--color-base-content)">
                {customers.map((cust) => {
                  const user = cust.customerId;
                  const statusInfo = statusBadges[cust.status] || {
                    label: cust.status || "Unknown",
                    bg: "bg-gray-100 text-gray-800 border-gray-300",
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
                      className="hover:bg-(--color-base-200)/40 transition"
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
                              className="w-9 h-9 rounded-full object-cover border border-(--color-base-300)"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold text-xs">
                              {user?.fullName?.charAt(0) || "C"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-(--color-base-content)">
                              {user?.fullName || "Customer"}
                            </p>
                            <p className="text-[10px] text-(--color-secondary)">
                              ID: #{cust._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-xs text-(--color-base-content)">
                            <MdEmail className="text-(--color-secondary)" size={12} />
                            {user?.email || "N/A"}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-(--color-secondary)">
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
                      <td className="py-3.5 px-4 text-[11px] text-(--color-secondary)">
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
                            className="px-2.5 py-1.5 rounded-lg border border-(--color-base-300) hover:bg-(--color-base-200) text-(--color-base-content) font-medium text-xs transition flex items-center gap-1"
                            title="View Customer Details"
                          >
                            <MdVisibility size={14} className="text-(--color-primary)" />
                            <span>Details</span>
                          </button>

                          {cust.status !== "verified" ? (
                            <button
                              onClick={() => handleUpdateStatus(cust._id, "verified")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs transition flex items-center gap-1"
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
                              className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium text-xs transition flex items-center gap-1"
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
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs transition flex items-center gap-1"
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
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs transition flex items-center gap-1"
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
