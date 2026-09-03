import { useMemo, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import toast from "react-hot-toast";
import api from "../../../config/ApiConfig";

const itemCategories = [
  "Appetizer",
  "Main Course",
  "Dessert",
  "Beverage",
  "Salad",
  "Soup",
  "Side Dish",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Pizza",
  "Pasta",
  "Burger",
  "Sandwich",
  "Seafood",
  "Rice",
  "Wrap",
  "Starter",
  "Drink",
  "Other",
];

const foodTypes = [
  "Vegetarian",
  "Non-Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Egg-Free",
  "Other",
];

const statusOptions = ["available", "unavailable", "discontinued"];

const getDefaultFormData = (item) => ({
  itemName: item?.itemName || "",
  description: item?.description || "",
  itemPrice: item?.itemPrice ?? item?.price ?? "",
  category: item?.category || "",
  foodType: item?.foodType || "",
  status: item?.status || "available",
  isTopRated: !!item?.isTopRated,
  isRecommended: !!item?.isRecommended,
  isNew: !!item?.isNew,
});

const EditOrViewItem = ({
  selectedItem,
  modalMode,
  isOpen,
  onClose,
  onActionSuccess,
}) => {
  const isViewMode = modalMode === "view";
  const [formData, setFormData] = useState(getDefaultFormData(selectedItem));
  const [itemImage, setItemImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(
    selectedItem?.image?.url || null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevItem, setPrevItem] = useState(selectedItem);
  if (selectedItem !== prevItem) {
    setPrevItem(selectedItem);
    setFormData(getDefaultFormData(selectedItem));
    setItemImage(null);
    setPreviewImage(selectedItem?.image?.url || null);
  }

  const modalTitle = useMemo(
    () => (isViewMode ? "View Menu Item" : "Edit Menu Item"),
    [isViewMode],
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateItem = async () => {
    if (!selectedItem?._id) {
      toast.error("Invalid menu item selected.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("itemName", formData.itemName);
      payload.append("description", formData.description);
      payload.append("itemPrice", formData.itemPrice);
      payload.append("category", formData.category);
      payload.append("foodType", formData.foodType);
      payload.append("status", formData.status);
      payload.append("isTopRated", formData.isTopRated);
      payload.append("isRecommended", formData.isRecommended);
      payload.append("isNew", formData.isNew);

      if (itemImage) {
        payload.append("itemImage", itemImage);
      }

      const response = await api.put(
        `/restaurant/menu-item/${selectedItem._id}`,
        payload,
      );

      toast.success(response.data.message || "Menu item updated successfully");

      if (onActionSuccess) {
        await onActionSuccess();
      }

      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update item details. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#072420] border border-teal-800/60 p-6 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto text-white shadow-2xl shadow-black/80">
        <header className="flex justify-between items-center border-b border-teal-900/60 pb-3 mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">{modalTitle}</h2>
          <button
            className="text-[#8faea7] hover:text-white transition cursor-pointer"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <IoMdCloseCircleOutline size={24} />
          </button>
        </header>

        <main className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center flex flex-col items-center">
              <div className="h-52 w-52 mx-auto border-2 border-dashed border-teal-800/80 bg-[#041916] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              {!isViewMode && (
                <div className="mt-2.5">
                  <label htmlFor="editItemImage" className="cursor-pointer text-xs font-semibold text-orange-400 hover:text-orange-300 transition">
                    Click to Change Image
                  </label>
                  <input
                    type="file"
                    id="editItemImage"
                    name="itemImage"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setItemImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                    }}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <label
                  className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                  htmlFor="editItemName"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="editItemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                  htmlFor="editItemPrice"
                >
                  Item Price (₹)
                </label>
                <input
                  type="number"
                  id="editItemPrice"
                  name="itemPrice"
                  value={formData.itemPrice}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                    htmlFor="editItemCategory"
                  >
                    Item Category
                  </label>
                  <select
                    id="editItemCategory"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-60"
                  >
                    <option value="" className="bg-[#072420] text-[#8faea7]">Select Category</option>
                    {itemCategories.map((category) => (
                      <option key={category} value={category} className="bg-[#072420] text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                    htmlFor="editFoodType"
                  >
                    Food Type
                  </label>
                  <select
                    id="editFoodType"
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-60"
                  >
                    <option value="" className="bg-[#072420] text-[#8faea7]">Select Food Type</option>
                    {foodTypes.map((type) => (
                      <option key={type} value={type} className="bg-[#072420] text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                    htmlFor="editStatus"
                  >
                    Status
                  </label>
                  <select
                    id="editStatus"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-60"
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-[#072420] text-white capitalize"
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <label
                className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                htmlFor="editItemDescription"
              >
                Item Description
              </label>
              <textarea
                id="editItemDescription"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-60"
                rows={3}
              />
            </div>

            <div className="md:col-span-3">
              <div className="flex flex-wrap gap-6 items-center">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                  <input
                    type="checkbox"
                    name="isTopRated"
                    checked={formData.isTopRated}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="accent-[#ea580c] w-4 h-4 rounded"
                  />
                  <span>Top Rated</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                  <input
                    type="checkbox"
                    name="isRecommended"
                    checked={formData.isRecommended}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="accent-[#ea580c] w-4 h-4 rounded"
                  />
                  <span>Recommended</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="accent-[#ea580c] w-4 h-4 rounded"
                  />
                  <span>New</span>
                </label>
              </div>
            </div>
          </div>
        </main>

        <footer className="flex justify-end border-t border-teal-900/60 pt-4 mt-6 gap-3">
          <button
            className="bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {isViewMode ? "Close" : "Cancel"}
          </button>

          {!isViewMode && (
            <button
              className="bg-gradient-to-r from-[#f97316] to-[#ea580c] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-orange-950/40 hover:opacity-95 cursor-pointer"
              onClick={handleUpdateItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default EditOrViewItem;
