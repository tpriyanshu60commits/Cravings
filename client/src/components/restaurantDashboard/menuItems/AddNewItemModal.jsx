import { useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import api from "../../../config/ApiConfig";
import toast from "react-hot-toast";
import { FaRegFileImage } from "react-icons/fa";

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

const AddNewItemModal = ({ isOpen, onClose, onActionSuccess }) => {
  const [newItemFormData, setNewItemFormData] = useState({
    itemName: "",
    description: "",
    itemPrice: "",
    category: "",
    foodType: "",
    status: "available",
    isTopRated: false,
    isRecommended: false,
    isNew: true,
    isDeleted: false,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itemImage, setItemImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItemFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleAddNewItem = async () => {
    try {
      setIsLoading(true);
      console.log(newItemFormData);
      const formData = new FormData();
      formData.append("itemName", newItemFormData.itemName);
      formData.append("description", newItemFormData.description);
      formData.append("itemPrice", newItemFormData.itemPrice);
      formData.append("category", newItemFormData.category);
      formData.append("foodType", newItemFormData.foodType);
      formData.append("status", newItemFormData.status);
      formData.append("isTopRated", newItemFormData.isTopRated);
      formData.append("isRecommended", newItemFormData.isRecommended);
      formData.append("isNew", newItemFormData.isNew);
      formData.append("isDeleted", newItemFormData.isDeleted);

      if (itemImage) {
        formData.append("itemImage", itemImage);
      }
      const res = await api.post("/restaurant/add-menu-item", formData);
      toast.success(res.data.message);
      if (onActionSuccess) {
        await onActionSuccess();
      }
      handleOnClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred while adding the item. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleOnClose = () => {
    setNewItemFormData({
      itemName: "",
      description: "",
      itemPrice: "",
      category: "",
      foodType: "",
      status: "available",
      isTopRated: false,
      isRecommended: false,
      isNew: true,
      isDeleted: false,
    });
    setPreviewImage(null);
    setItemImage(null);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#072420] border border-teal-800/60 p-6 rounded-2xl w-full max-w-4xl shadow-2xl shadow-black/80 text-white max-h-[90vh] overflow-y-auto">
          <header className="flex justify-between items-center border-b border-teal-900/60 pb-3 mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Add New Item</h2>
            <button
              className="text-[#8faea7] hover:text-white transition cursor-pointer"
              onClick={handleOnClose}
            >
              <IoMdCloseCircleOutline size={24} />
            </button>
          </header>
          <main>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex justify-center items-center">
                  <div className="h-52 w-52 mx-auto border-2 border-dashed border-teal-800/80 bg-[#041916] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <label
                        htmlFor="itemImage"
                        className="cursor-pointer flex flex-col items-center justify-center h-full text-[#8faea7] hover:text-orange-400 text-center p-4 transition"
                      >
                        <FaRegFileImage size={32} className="mb-2 text-orange-400/80" />
                        <span className="text-xs font-semibold">Click here to upload an image</span>
                      </label>
                    )}
                  </div>
                  <input
                    type="file"
                    id="itemImage"
                    name="itemImage"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setItemImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                    }}
                    className="hidden"
                  />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <label
                      className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                      htmlFor="itemName"
                    >
                      Item Name
                    </label>
                    <input
                      type="text"
                      id="itemName"
                      name="itemName"
                      placeholder="e.g. Crispy Paneer Burger"
                      value={newItemFormData.itemName}
                      onChange={handleInputChange}
                      className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label
                      className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                      htmlFor="itemPrice"
                    >
                      Item Price (₹)
                    </label>
                    <input
                      type="number"
                      id="itemPrice"
                      name="itemPrice"
                      placeholder="e.g. 199"
                      value={newItemFormData.itemPrice}
                      onChange={handleInputChange}
                      className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                        htmlFor="itemCategory"
                      >
                        Item Category
                      </label>
                      <select
                        id="itemCategory"
                        name="category"
                        value={newItemFormData.category}
                        onChange={handleInputChange}
                        className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      >
                        <option value="" className="bg-[#072420] text-[#8faea7]">
                          Select Category
                        </option>
                        {itemCategories.map((category, idx) => (
                          <option
                            key={idx}
                            value={category}
                            className="bg-[#072420] text-white"
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                        htmlFor="itemType"
                      >
                        Food Type
                      </label>
                      <select
                        id="itemType"
                        name="foodType"
                        value={newItemFormData.foodType}
                        onChange={handleInputChange}
                        className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      >
                        <option value="" className="bg-[#072420] text-[#8faea7]">
                          Select Food Type
                        </option>
                        {foodTypes.map((type, idx) => (
                          <option key={idx} value={type} className="bg-[#072420] text-white">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label
                    className="block mb-1.5 text-xs font-semibold text-[#8faea7]"
                    htmlFor="itemDescription"
                  >
                    Item Description
                  </label>
                  <textarea
                    id="itemDescription"
                    name="description"
                    rows={3}
                    placeholder="Short appetizing summary of ingredients, taste, and portions..."
                    value={newItemFormData.description}
                    onChange={handleInputChange}
                    className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  />
                </div>
              </div>
            </form>
          </main>

          <footer className="flex justify-end gap-3 border-t border-teal-900/60 pt-4 mt-6">
            <button
              className="bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              onClick={handleOnClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="bg-gradient-to-r from-[#f97316] to-[#ea580c] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-orange-950/40 hover:opacity-95 cursor-pointer"
              onClick={handleAddNewItem}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Item"}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default AddNewItemModal;
