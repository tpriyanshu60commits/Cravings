import { useState, useEffect } from "react";
import { FaAward } from "react-icons/fa";
import { LuPencilLine, LuTrash2, LuEye, LuChevronDown } from "react-icons/lu";
import { AiTwotoneLike } from "react-icons/ai";
import { IoMdAddCircleOutline } from "react-icons/io";
import ConfirmModal from "./menuItems/ConfirmModal";
import AddNewItemModal from "./menuItems/AddNewItemModal";
import EditOrViewItem from "./menuItems/EditOrViewItem";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../Loader";

const statusChipStyles = {
  available: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  unavailable: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  discontinued: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
};
const statusLabels = {
  available: "Available",
  unavailable: "Unavailable",
  discontinued: "Discontinued",
};

const RestaurantMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isAddNewItemModalOpen, setIsAddNewItemModalOpen] = useState(false);
  const [isEditViewItemModalOpen, setIsEditViewItemModalOpen] = useState(false);
  const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/restaurant/menu-items");
      setMenuItems(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred while fetching menu items. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    let isMounted = true;
    const loadInitialMenuItems = async () => {
      try {
        const response = await api.get("/restaurant/menu-items");
        if (isMounted) {
          setMenuItems(Array.isArray(response.data?.data) ? response.data.data : []);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Unknown error occurred while fetching menu items. Please try again.",
          );
          setIsLoading(false);
        }
      }
    };
    loadInitialMenuItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (itemId, status) => {
    try {
      const response = await api.patch(
        `/restaurant/menu-item/${itemId}/status?status=${encodeURIComponent(status)}`,
      );
      toast.success(response.data?.message || "Item status updated");
      await fetchMenuItems();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update item status. Please try again.",
      );
    }
  };
  if (isLoading) {
    return <Loader height="100%" width="100%" />;
  }
  return (
    <>
      <div className="overflow-y-auto h-full space-y-4 sm:space-y-6">
        {/* Menu Management Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Menu Management</h2>
            <p className="text-xs text-[#8faea7] mt-0.5">
              Add new dishes, update pricing, availability & promotions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
            <button
              className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-orange-950/40 hover:opacity-95 cursor-pointer shrink-0"
              onClick={() => setIsAddNewItemModalOpen(true)}
            >
              <IoMdAddCircleOutline className="text-base" />
              <span>Add New Item</span>
            </button>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-teal-800/60 bg-[#041916] text-white placeholder-[#537770] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors w-full sm:w-56"
            />
          </div>
        </div>

        {/* Menu Items Container */}
        <div className="bg-[#072420] p-3.5 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40">
          {/* Desktop Table Header */}
          <div className="hidden md:grid text-[#8faea7] grid-cols-7 gap-4 font-bold text-xs uppercase tracking-wider border-b border-teal-900/60 pb-3">
            <div className="col-span-2">Item Name & Description</div>
            <div className="text-center">Price</div>
            <div>Category & Type</div>
            <div>Status</div>
            <div>Badges</div>
            <div>Actions</div>
          </div>

          <div className="overflow-y-auto max-h-[70vh]">
            {menuItems.filter((i) =>
              searchQuery
                ? i.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  i.category?.toLowerCase().includes(searchQuery.toLowerCase())
                : true,
            ).length === 0 ? (
              <div className="text-center py-12 text-[#8faea7] text-xs">
                No menu items found.
              </div>
            ) : (
              <>
                {/* 1. Desktop Table Rows (hidden on mobile) */}
                <div className="hidden md:block">
                  {menuItems
                    .filter((i) =>
                      searchQuery
                        ? i.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.category?.toLowerCase().includes(searchQuery.toLowerCase())
                        : true,
                    )
                    .map((item, index) => (
                      <div
                        key={item._id || index}
                        className="grid grid-cols-7 gap-4 border-b border-teal-900/40 py-3 items-center hover:bg-teal-900/20 transition"
                      >
                        {/* Item Name & Description */}
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#041916] border border-teal-800/60 shrink-0">
                            {item.image?.url ? (
                              <img
                                src={item.image.url}
                                alt={item.itemName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#ea580c]">
                                {item.itemName?.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{item.itemName}</div>
                            <div className="text-[11px] text-[#8faea7] line-clamp-1 mt-0.5">
                              {item.description || "No description provided"}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-center font-bold text-sm text-[#f97316]">
                          ₹{item.itemPrice?.toFixed(2)}
                        </div>

                        {/* Category & Type */}
                        <div>
                          <div className="text-xs font-semibold text-white">{item.category}</div>
                          <div className="text-[10px] text-[#8faea7]">{item.foodType}</div>
                        </div>

                        {/* Status */}
                        <div className="relative inline-flex items-center">
                          <select
                            value={item.status}
                            className={`appearance-none rounded-lg pl-2.5 pr-7 py-1.5 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 bg-[#041916] ${
                              statusChipStyles[item.status]
                            }`}
                            onChange={(e) => {
                              handleStatusChange(item._id, e.target.value);
                            }}
                          >
                            <option value="available" className="bg-[#072420] text-emerald-300">
                              {statusLabels.available}
                            </option>
                            <option value="unavailable" className="bg-[#072420] text-amber-300">
                              {statusLabels.unavailable}
                            </option>
                            <option value="discontinued" className="bg-[#072420] text-rose-300">
                              {statusLabels.discontinued}
                            </option>
                          </select>

                          <LuChevronDown className="pointer-events-none absolute right-2 text-xs opacity-70 text-[#8faea7]" />
                        </div>

                        {/* Controls */}
                        <div className="flex gap-1.5 items-center">
                          <button
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              item.isTopRated
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                : "text-[#8faea7] border-teal-800/40 hover:text-white hover:bg-teal-900/30"
                            }`}
                            title={
                              item.isTopRated ? "Top Rated" : "Mark as Top Rated"
                            }
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("topRated");
                              setIsControlsModalOpen(true);
                            }}
                          >
                            <FaAward size={14} />
                          </button>

                          <button
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              item.isRecommended
                                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                                : "text-[#8faea7] border-teal-800/40 hover:text-white hover:bg-teal-900/30"
                            }`}
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("recommended");
                              setIsControlsModalOpen(true);
                            }}
                            title={
                              item.isRecommended
                                ? "Recommended"
                                : "Mark as Recommended"
                            }
                          >
                            <AiTwotoneLike size={14} />
                          </button>

                          <button
                            className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                              item.isNew
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : "text-[#8faea7] border-teal-800/40 hover:text-white hover:bg-teal-900/30"
                            }`}
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("new");
                              setIsControlsModalOpen(true);
                            }}
                            title={item.isNew ? "New Item" : "Mark as New"}
                          >
                            New
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 items-center">
                          <button
                            className="p-1.5 border border-teal-800/60 bg-[#041916] text-[#8faea7] hover:text-white hover:border-orange-500/60 rounded-lg transition cursor-pointer"
                            title="Edit Item"
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("edit");
                              setIsEditViewItemModalOpen(true);
                            }}
                          >
                            <LuPencilLine size={14} />
                          </button>

                          <button
                            className="p-1.5 border border-teal-800/60 bg-[#041916] text-[#8faea7] hover:text-white hover:border-blue-500/60 rounded-lg transition cursor-pointer"
                            title="View Item Details"
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("view");
                              setIsEditViewItemModalOpen(true);
                            }}
                          >
                            <LuEye size={14} />
                          </button>

                          <button
                            className="p-1.5 border border-teal-800/60 bg-[#041916] text-rose-400 hover:text-rose-300 hover:border-rose-500/60 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                            title="Delete Item"
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("delete");
                              setIsControlsModalOpen(true);
                            }}
                          >
                            <LuTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* 2. Mobile Card List (visible only on screens < md) */}
                <div className="md:hidden space-y-3 pt-1">
                  {menuItems
                    .filter((i) =>
                      searchQuery
                        ? i.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.category?.toLowerCase().includes(searchQuery.toLowerCase())
                        : true,
                    )
                    .map((item, index) => (
                      <div
                        key={item._id || index}
                        className="bg-[#041916] border border-teal-800/60 rounded-xl p-3.5 space-y-3 shadow-md"
                      >
                        {/* Top: Image + Info + Price */}
                        <div className="flex gap-3 items-start">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#072420] border border-teal-800/60 shrink-0">
                            {item.image?.url ? (
                              <img
                                src={item.image.url}
                                alt={item.itemName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#ea580c]">
                                {item.itemName?.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-white truncate">{item.itemName}</h4>
                              <span className="text-sm font-bold text-[#f97316] shrink-0">
                                ₹{item.itemPrice?.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-[#8faea7] line-clamp-2 mt-0.5 leading-relaxed">
                              {item.description || "No description provided"}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[11px] font-semibold text-white bg-[#072420] border border-teal-800/40 px-2 py-0.5 rounded-md">
                                {item.category}
                              </span>
                              <span className="text-[11px] text-[#8faea7]">
                                • {item.foodType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Status Dropdown + Promo Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-teal-900/40">
                          {/* Status select */}
                          <div className="relative inline-flex items-center">
                            <select
                              value={item.status}
                              className={`appearance-none rounded-lg pl-2.5 pr-7 py-1 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 bg-[#072420] ${
                                statusChipStyles[item.status]
                              }`}
                              onChange={(e) => {
                                handleStatusChange(item._id, e.target.value);
                              }}
                            >
                              <option value="available" className="bg-[#072420] text-emerald-300">
                                {statusLabels.available}
                              </option>
                              <option value="unavailable" className="bg-[#072420] text-amber-300">
                                {statusLabels.unavailable}
                              </option>
                              <option value="discontinued" className="bg-[#072420] text-rose-300">
                                {statusLabels.discontinued}
                              </option>
                            </select>
                            <LuChevronDown className="pointer-events-none absolute right-2 text-xs opacity-70 text-[#8faea7]" />
                          </div>

                          {/* Promo Badges */}
                          <div className="flex gap-1.5 items-center">
                            <button
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                item.isTopRated
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                  : "text-[#8faea7] border-teal-800/40 hover:text-white hover:bg-teal-900/30"
                              }`}
                              title={item.isTopRated ? "Top Rated" : "Mark as Top Rated"}
                              onClick={() => {
                                setSelectedItem(item);
                                setModalMode("topRated");
                                setIsControlsModalOpen(true);
                              }}
                            >
                              <FaAward size={14} />
                            </button>

                            <button
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                item.isRecommended
                                  ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                                  : "text-[#8faea7] border-teal-800/40 hover:text-white hover:bg-teal-900/30"
                              }`}
                              onClick={() => {
                                setSelectedItem(item);
                                setModalMode("recommended");
                                setIsControlsModalOpen(true);
                              }}
                              title={item.isRecommended ? "Recommended" : "Mark as Recommended"}
                            >
                              <AiTwotoneLike size={14} />
                            </button>

                            <button
                              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                                item.isNew
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                  : "text-[#8faea7] border-teal-800/40 hover:text-white hover:bg-teal-900/30"
                              }`}
                              onClick={() => {
                                setSelectedItem(item);
                                setModalMode("new");
                                setIsControlsModalOpen(true);
                              }}
                              title={item.isNew ? "New Item" : "Mark as New"}
                            >
                              New
                            </button>
                          </div>
                        </div>

                        {/* Bottom: Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-900/40">
                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-teal-800/60 bg-[#072420] text-xs font-semibold text-[#8faea7] hover:text-white hover:border-orange-500/60 rounded-xl transition cursor-pointer"
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("edit");
                              setIsEditViewItemModalOpen(true);
                            }}
                          >
                            <LuPencilLine size={13} className="text-orange-400" />
                            <span>Edit</span>
                          </button>

                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-teal-800/60 bg-[#072420] text-xs font-semibold text-[#8faea7] hover:text-white hover:border-blue-500/60 rounded-xl transition cursor-pointer"
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("view");
                              setIsEditViewItemModalOpen(true);
                            }}
                          >
                            <LuEye size={13} className="text-blue-400" />
                            <span>View</span>
                          </button>

                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                            onClick={() => {
                              setSelectedItem(item);
                              setModalMode("delete");
                              setIsControlsModalOpen(true);
                            }}
                          >
                            <LuTrash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {isControlsModalOpen && (
        <ConfirmModal
          selectedItem={selectedItem}
          modalMode={modalMode}
          isOpen={isControlsModalOpen}
          onClose={() => setIsControlsModalOpen(false)}
          onActionSuccess={fetchMenuItems}
        />
      )}

      {isAddNewItemModalOpen && (
        <AddNewItemModal
          isOpen={isAddNewItemModalOpen}
          onClose={() => setIsAddNewItemModalOpen(false)}
          onActionSuccess={fetchMenuItems}
        />
      )}

      {isEditViewItemModalOpen && (
        <EditOrViewItem
          selectedItem={selectedItem}
          modalMode={modalMode}
          isOpen={isEditViewItemModalOpen}
          onClose={() => setIsEditViewItemModalOpen(false)}
          onActionSuccess={fetchMenuItems}
        />
      )}
    </>
  );
};

export default RestaurantMenu;

