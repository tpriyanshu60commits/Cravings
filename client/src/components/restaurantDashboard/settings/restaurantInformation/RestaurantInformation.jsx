import { useState } from "react";
import api from "../../../../config/ApiConfig";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";

const RestaurantInformation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const getStoredRestaurant = () => {
    try {
      return JSON.parse(sessionStorage.getItem("cravingRestaurant")) || {};
    } catch {
      return {};
    }
  };

  const [restaurantData, setRestaurantData] = useState(getStoredRestaurant);
  const [editingRestaurant, setEditingRestaurant] = useState(false);

  const getCuisinesString = (data) => {
    if (Array.isArray(data?.cuisinesTypes)) return data.cuisinesTypes.join(", ");
    if (Array.isArray(data?.cuisineTypes)) return data.cuisineTypes.join(", ");
    if (typeof data?.cuisinesTypes === "string") return data.cuisinesTypes;
    if (typeof data?.cuisineTypes === "string") return data.cuisineTypes;
    return "";
  };

  const [restaurantFormData, setRestaurantFormData] = useState({
    restaurantName: restaurantData?.restaurantName || "",
    description: restaurantData?.description || "",
    restaurantType: restaurantData?.restaurantType || "",
    cuisineTypes: getCuisinesString(restaurantData),
    contactEmail: restaurantData?.contactDetails?.email || "",
    contactPhone: restaurantData?.contactDetails?.phone || "",
    openingTime: restaurantData?.servingHours?.openingTime || "",
    closingTime: restaurantData?.servingHours?.closingTime || "",
  });

  const handleRestaurantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRestaurantFormData({
      ...restaurantFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const handleSaveRestaurant = async () => {
    try {
      setIsLoading(true);
      const res = await api.put(
        `/restaurant/update-restaurant-info`,
        restaurantFormData,
      );

      setRestaurantData(res.data.data);
      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );
      setEditingRestaurant(false);
      toast.success("Restaurant information updated successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update restaurant",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRestaurant = () => {
    setRestaurantFormData({
      restaurantName: restaurantData?.restaurantName || "",
      description: restaurantData?.description || "",
      restaurantType: restaurantData?.restaurantType || "",
      cuisineTypes: getCuisinesString(restaurantData),
      contactEmail: restaurantData?.contactDetails?.email || "",
      contactPhone: restaurantData?.contactDetails?.phone || "",
      openingTime: restaurantData?.servingHours?.openingTime || "",
      closingTime: restaurantData?.servingHours?.closingTime || "",
    });
    setEditingRestaurant(false);
  };

  return (
    <>
      <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-teal-900/60 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Restaurant Profile & Business Details
            </h3>
          </div>
          {!editingRestaurant ? (
            <div>
              <button
                onClick={() => setEditingRestaurant(true)}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white hover:border-orange-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <MdEdit size={14} className="text-orange-400" /> Edit Info
              </button>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSaveRestaurant}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancelRestaurant}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Restaurant Name</label>
            <input
              type="text"
              onChange={handleRestaurantChange}
              name="restaurantName"
              value={restaurantFormData?.restaurantName || ""}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurant
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurant}
            />
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Restaurant Type</label>
            <select
              name="restaurantType"
              value={restaurantFormData?.restaurantType || ""}
              onChange={handleRestaurantChange}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurant
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurant}
            >
              <option value="" className="bg-[#072420] text-[#8faea7]">Select type</option>
              <option value="veg" className="bg-[#072420] text-white">Veg</option>
              <option value="non-veg" className="bg-[#072420] text-white">Non-Veg</option>
              <option value="jain" className="bg-[#072420] text-white">Jain</option>
              <option value="vegan" className="bg-[#072420] text-white">Vegan</option>
              <option value="both" className="bg-[#072420] text-white">Both</option>
            </select>
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">
              Cuisine Types{" "}
              <span className="font-normal text-[#537770]">
                (comma-separated)
              </span>
            </label>
            <input
              type="text"
              name="cuisineTypes"
              value={restaurantFormData?.cuisineTypes || ""}
              onChange={handleRestaurantChange}
              placeholder="e.g. Indian, Chinese, Italian"
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white placeholder-[#537770] ${
                editingRestaurant
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurant}
            />
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={restaurantFormData?.contactEmail || ""}
              onChange={handleRestaurantChange}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurant
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurant}
            />
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Contact Phone</label>
            <input
              type="tel"
              name="contactPhone"
              value={restaurantFormData?.contactPhone || ""}
              onChange={handleRestaurantChange}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurant
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurant}
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-2">
            <div className="w-full">
              <label className="text-xs font-semibold text-[#8faea7] block mb-1">Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={restaurantFormData?.openingTime || ""}
                onChange={handleRestaurantChange}
                className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                  editingRestaurant
                    ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    : "bg-[#041916]/50 opacity-80"
                }`}
                disabled={!editingRestaurant}
              />
            </div>
            <div className="w-full">
              <label className="text-xs font-semibold text-[#8faea7] block mb-1">Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={restaurantFormData?.closingTime || ""}
                onChange={handleRestaurantChange}
                className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                  editingRestaurant
                    ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    : "bg-[#041916]/50 opacity-80"
                }`}
                disabled={!editingRestaurant}
              />
            </div>
          </div>
          <div className="w-full col-span-1 md:col-span-3">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Description</label>
            <textarea
              name="description"
              value={restaurantFormData?.description || ""}
              onChange={handleRestaurantChange}
              rows={2}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white placeholder-[#537770] ${
                editingRestaurant
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurant}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantInformation;
