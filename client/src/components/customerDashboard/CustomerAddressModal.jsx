import { useState } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { LuLoaderCircle } from "react-icons/lu";
import { MdCancel } from "react-icons/md";
import { IoHomeOutline, IoBriefcaseOutline, IoLocationOutline } from "react-icons/io5";

const CustomerAddressModal = ({ isOpen, onClose, addressToEdit, onSaveSuccess }) => {
  const [formData, setFormData] = useState(() => ({
    name: addressToEdit?.name || "",
    address: addressToEdit?.address || "",
    city: addressToEdit?.city || "",
    state: addressToEdit?.state || "",
    pinCode: addressToEdit?.pinCode || "",
    country: addressToEdit?.country || "India",
    addressType: addressToEdit?.addressType || "home",
    isDefault: !!addressToEdit?.isDefault,
    geoLat: addressToEdit?.geoLocation?.lat || "",
    geoLon: addressToEdit?.geoLocation?.lon || "",
  }));

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [prevAddressId, setPrevAddressId] = useState(addressToEdit?._id);

  if (addressToEdit?._id !== prevAddressId) {
    setPrevAddressId(addressToEdit?._id);
    setFormData({
      name: addressToEdit?.name || "",
      address: addressToEdit?.address || "",
      city: addressToEdit?.city || "",
      state: addressToEdit?.state || "",
      pinCode: addressToEdit?.pinCode || "",
      country: addressToEdit?.country || "India",
      addressType: addressToEdit?.addressType || "home",
      isDefault: !!addressToEdit?.isDefault,
      geoLat: addressToEdit?.geoLocation?.lat || "",
      geoLon: addressToEdit?.geoLocation?.lon || "",
    });
    setErrors({});
  }

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = String(position.coords.latitude);
        const lon = String(position.coords.longitude);
        setFormData((prev) => ({
          ...prev,
          geoLat: lat,
          geoLon: lon,
        }));
        setIsDetectingLocation(false);
        toast.success(`GPS Location linked: ${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`);
      },
      (error) => {
        setIsDetectingLocation(false);
        console.warn("Geolocation notice:", error.message);
        toast.error("Please allow location permission to attach live GPS coordinates", {
          id: "geo-cust-perm",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name / Receiver name is required";
    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pinCode.trim()) newErrors.pinCode = "PIN Code is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        geoLocation: {
          lat: formData.geoLat,
          lon: formData.geoLon,
        },
      };

      let res;
      if (addressToEdit?._id) {
        res = await api.put(`/customer/address-book/${addressToEdit._id}`, payload);
        toast.success("Address updated successfully");
      } else {
        res = await api.post("/customer/address-book", payload);
        toast.success("Address added successfully");
      }

      if (onSaveSuccess) {
        onSaveSuccess(res.data.data);
      }
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save address. Please check fields and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-(--color-base-100) rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-(--color-base-300) max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-(--color-base-content)">
            {addressToEdit ? "Edit Address" : "Add New Delivery Address"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <MdCancel className="text-2xl" />
          </button>
        </header>

        {/* GPS Location Auto-detect Widget */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
              <IoLocationOutline className="text-sm" /> Accurate GPS Pinpoint
            </p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              {formData.geoLat && formData.geoLon
                ? `GPS Linked: ${Number(formData.geoLat).toFixed(4)}, ${Number(formData.geoLon).toFixed(4)}`
                : "Attach your current GPS location for precise delivery navigation"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetectingLocation}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 disabled:opacity-50"
          >
            {isDetectingLocation ? "Detecting..." : formData.geoLat ? "Update GPS" : "Detect GPS"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Address Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-(--color-neutral) mb-1.5">
              Address Type
            </label>
            <div className="flex gap-3">
              {[
                { type: "home", label: "Home", icon: <IoHomeOutline /> },
                { type: "work", label: "Work", icon: <IoBriefcaseOutline /> },
                { type: "other", label: "Other", icon: <IoLocationOutline /> },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, addressType: item.type }))
                  }
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    formData.addressType === item.type
                      ? "bg-(--color-primary) text-(--color-primary-content) border-(--color-primary)"
                      : "bg-(--color-base-200) text-(--color-base-content) border-(--color-base-300) hover:border-(--color-primary)"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
              Contact / Receiver Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            />
            {errors.name && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.name}
              </span>
            )}
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
              Complete Street Address / Flat / Building *
            </label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Flat/House No., Street, Landmark"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary) resize-none"
            />
            {errors.address && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.address}
              </span>
            )}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g. Bhopal"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              />
              {errors.city && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.city}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="e.g. Madhya Pradesh"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              />
              {errors.state && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.state}
                </span>
              )}
            </div>
          </div>

          {/* PIN Code & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleInputChange}
                placeholder="e.g. 462001"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              />
              {errors.pinCode && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.pinCode}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              />
              {errors.country && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.country}
                </span>
              )}
            </div>
          </div>

          {/* Default Address Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-(--color-secondary)">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="cursor-pointer accent-(--color-primary)"
              />
              <span>Set as my default delivery address</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-(--color-primary) text-(--color-primary-content) hover:opacity-90 transition disabled:opacity-50"
            >
              {loading && <LuLoaderCircle className="animate-spin text-sm" />}
              {addressToEdit ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerAddressModal;
