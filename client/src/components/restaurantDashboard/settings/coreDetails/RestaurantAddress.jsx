import { useState } from "react";
import { MdEdit } from "react-icons/md";
import api from "../../../../config/ApiConfig";
import toast from "react-hot-toast";
const RestaurantAddress = () => {
  const [editingRestaurantAddress, setEditingRestaurantAddress] =
    useState(false);
  const [restaurantData, setRestaurantData] = useState(
    JSON.parse(sessionStorage.getItem("cravingRestaurant")) || [],
  );
  const [restaurantAddressFormData, setRestaurantAddressFormData] = useState({
    address: restaurantData?.address || "",
    city: restaurantData?.city || "",
    state: restaurantData?.state || "",
    pinCode: restaurantData?.pinCode || "",
    country: restaurantData?.country || "",
    geoLat: restaurantData?.geoLocation?.lat || "",
    geoLon: restaurantData?.geoLocation?.lon || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleRestaurantAddressChange = (e) => {
    const { name, value } = e.target;
    setRestaurantAddressFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setRestaurantAddressFormData((prevData) => ({
            ...prevData,
            geoLat: latitude,
            geoLon: longitude,
          }));
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsFetchingLocation(false);
        },
      );
    }
  };

  const handleSaveRestaurantAddress = async () => {
    try {
      setIsLoading(true);
      const res = await api.put(
        "/restaurant/update-address",
        restaurantAddressFormData,
      );
      setRestaurantData(res.data.data);
      sessionStorage.setItem(
        "cravingRestaurant",
        JSON.stringify(res.data.data),
      );
      toast.success(res.data.message);
      setEditingRestaurantAddress(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update address. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancelRestaurantAddress = () => {
    setRestaurantAddressFormData({
      address: restaurantData?.restaurantData || "",
      city: restaurantData?.city || "",
      state: restaurantData?.state || "",
      pinCode: restaurantData?.pinCode || "",
      country: restaurantData?.country || "",
      geoLat: restaurantData?.geoLocation?.lat || "",
      geoLon: restaurantData?.geoLocation?.lon || "",
    });
    setEditingRestaurantAddress(false);
  };

  return (
    <>
      <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-teal-900/60 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="w-full text-sm font-bold text-white tracking-tight">
              Restaurant Address & Location
            </h3>
          </div>
          {!editingRestaurantAddress ? (
            <div className="flex gap-3">
              <button
                onClick={() => setEditingRestaurantAddress(true)}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white hover:border-orange-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <MdEdit size={14} className="text-orange-400" /> Edit Address
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleGetLocation}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-orange-400 hover:text-orange-300 hover:border-orange-500/60 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                disabled={isFetchingLocation}
              >
                {isFetchingLocation
                  ? "Getting Location..."
                  : "Detect Current GPS"}
              </button>
              <button
                onClick={handleSaveRestaurantAddress}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancelRestaurantAddress}
                className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Street Address</label>
            <input
              type="text"
              name="address"
              value={restaurantAddressFormData?.address || ""}
              onChange={handleRestaurantAddressChange}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurantAddress
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurantAddress}
            />
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">City</label>
            <input
              type="text"
              name="city"
              value={restaurantAddressFormData?.city || ""}
              onChange={handleRestaurantAddressChange}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurantAddress
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurantAddress}
            />
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">State</label>
            <input
              type="text"
              name="state"
              value={restaurantAddressFormData?.state || ""}
              onChange={handleRestaurantAddressChange}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurantAddress
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurantAddress}
            />
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Pin Code</label>
            <input
              type="text"
              name="pinCode"
              value={restaurantAddressFormData?.pinCode || ""}
              onChange={handleRestaurantAddressChange}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurantAddress
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurantAddress}
            />
          </div>
          <div className="w-full">
            <label className="text-xs font-semibold text-[#8faea7] block mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={restaurantAddressFormData?.country || ""}
              onChange={handleRestaurantAddressChange}
              className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                editingRestaurantAddress
                  ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  : "bg-[#041916]/50 opacity-80"
              }`}
              disabled={!editingRestaurantAddress}
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-2">
            <div className="w-full">
              <label className="text-xs font-semibold text-[#8faea7] block mb-1">Latitude</label>
              <input
                type="text"
                name="geoLat"
                value={restaurantAddressFormData?.geoLat || ""}
                onChange={handleRestaurantAddressChange}
                placeholder="e.g. 28.6139"
                className="w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white bg-[#041916]/50 opacity-70"
                disabled
              />
            </div>
            <div className="w-full">
              <label className="text-xs font-semibold text-[#8faea7] block mb-1">Longitude</label>
              <input
                type="text"
                name="geoLon"
                value={restaurantAddressFormData?.geoLon || ""}
                onChange={handleRestaurantAddressChange}
                placeholder="e.g. 77.2090"
                className="w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white bg-[#041916]/50 opacity-70"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantAddress;
