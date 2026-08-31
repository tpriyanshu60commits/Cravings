import { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { MdLinkedCamera, MdDirectionsBike, MdAccountBalance, MdLocationOn } from "react-icons/md";
import PasswordChangeModal from "../commonModals/PasswordChangeModal";

const RiderSettings = () => {
  const { user, setUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  // Form states
  const [userFormData, setUserFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [vehicleFormData, setVehicleFormData] = useState({
    vehicleType: "",
    vehicleNumber: "",
    vehicleModel: "",
    vehicleColor: "",
  });

  const [addressFormData, setAddressFormData] = useState({
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
  });

  const [bankFormData, setBankFormData] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const res = await api.get("/rider/profile");
        if (isMounted) {
          const rider = res.data?.data || {};
          setVehicleFormData({
            vehicleType: rider.vehicleDetails?.vehicleType || "Motorcycle",
            vehicleNumber: rider.vehicleDetails?.vehicleNumber || "",
            vehicleModel: rider.vehicleDetails?.vehicleModel || "",
            vehicleColor: rider.vehicleDetails?.vehicleColor || "",
          });

          setAddressFormData({
            address: rider.currentAddress?.address || "",
            city: rider.currentAddress?.city || "",
            state: rider.currentAddress?.state || "",
            pinCode: rider.currentAddress?.pinCode || "",
            country: rider.currentAddress?.country || "India",
          });

          setBankFormData({
            bankName: rider.financialDetails?.bankName || "",
            accountNumber: rider.financialDetails?.accountNumber || "",
            ifscCode: rider.financialDetails?.ifscCode || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch rider profile:", error);
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicPreview(URL.createObjectURL(file));
    setProfilePic(file);
  };

  const handleSaveUserProfile = async () => {
    try {
      setIsSaving(true);
      const payload = new FormData();
      payload.append("fullName", userFormData.fullName);
      payload.append("email", userFormData.email);
      payload.append("phone", userFormData.phone);
      if (profilePic) {
        payload.append("displayPic", profilePic);
      }

      const res = await api.put("/common/edit-profile", payload);
      sessionStorage.setItem("cravingUser", JSON.stringify(res.data.data));
      if (setUser) setUser(res.data.data);
      setEditingProfile(false);
      toast.success("Personal profile updated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRiderSpecificData = async (section, dataToSave) => {
    try {
      setIsSaving(true);
      const payload = {};
      if (section === "vehicle") payload.vehicleDetails = dataToSave;
      if (section === "address") payload.currentAddress = dataToSave;
      if (section === "bank") payload.financialDetails = dataToSave;

      await api.put("/rider/profile", payload);
      toast.success(`${section.toUpperCase()} details updated successfully!`);

      if (section === "vehicle") setEditingVehicle(false);
      if (section === "address") setEditingAddress(false);
      if (section === "bank") setEditingBank(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update rider profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="overflow-y-auto h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-(--color-base-content)">
            Rider Profile & Settings
          </h1>
          <p className="text-xs text-(--color-secondary) mt-1">
            Manage your personal profile, vehicle registration, payout bank details, and address.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal Account */}
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-secondary)/30 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-(--color-secondary)/20 pb-3">
            <h3 className="text-sm font-bold text-(--color-base-content)">
              Personal Information
            </h3>
            <div className="flex gap-2">
              {!editingProfile ? (
                <>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded-lg text-xs font-semibold"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setIsPasswordChangeModalOpen(true)}
                    className="bg-(--color-base-200) text-(--color-base-content) px-3 py-1 rounded-lg text-xs font-semibold"
                  >
                    Password
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveUserProfile}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative">
              <img
                src={profilePicPreview || user?.photo?.url || "https://placehold.co/150"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-(--color-primary)"
              />
              {editingProfile && (
                <label
                  htmlFor="riderDisplayPic"
                  className="absolute bottom-0 right-0 p-1.5 bg-(--color-primary) text-white rounded-full cursor-pointer shadow hover:opacity-90"
                >
                  <MdLinkedCamera size={16} />
                  <input
                    type="file"
                    id="riderDisplayPic"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </label>
              )}
            </div>

            <div className="w-full space-y-3">
              <div>
                <label className="text-[11px] font-bold text-(--color-secondary)">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userFormData.fullName}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, fullName: e.target.value })
                  }
                  disabled={!editingProfile}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-(--color-secondary)">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  disabled
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-200) text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-(--color-secondary)">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={userFormData.phone}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, phone: e.target.value })
                  }
                  disabled={!editingProfile}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Vehicle Details */}
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-secondary)/30 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-(--color-secondary)/20 pb-3">
            <h3 className="text-sm font-bold text-(--color-base-content) flex items-center gap-2">
              <MdDirectionsBike size={18} /> Vehicle Details
            </h3>
            <div>
              {!editingVehicle ? (
                <button
                  onClick={() => setEditingVehicle(true)}
                  className="bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  Edit Vehicle
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveRiderSpecificData("vehicle", vehicleFormData)}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingVehicle(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-(--color-secondary)">
                Vehicle Type
              </label>
              <select
                value={vehicleFormData.vehicleType}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, vehicleType: e.target.value })
                }
                disabled={!editingVehicle}
                className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Scooter">Scooter</option>
                <option value="EV-Bike">EV-Bike</option>
                <option value="Bicycle">Bicycle</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-(--color-secondary)">
                Registration Number
              </label>
              <input
                type="text"
                placeholder="e.g. MH01AB1234"
                value={vehicleFormData.vehicleNumber}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, vehicleNumber: e.target.value })
                }
                disabled={!editingVehicle}
                className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-(--color-secondary)">
                Vehicle Model
              </label>
              <input
                type="text"
                placeholder="e.g. Hero Splendor"
                value={vehicleFormData.vehicleModel}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, vehicleModel: e.target.value })
                }
                disabled={!editingVehicle}
                className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-(--color-secondary)">
                Vehicle Color
              </label>
              <input
                type="text"
                placeholder="e.g. Black"
                value={vehicleFormData.vehicleColor}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, vehicleColor: e.target.value })
                }
                disabled={!editingVehicle}
                className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Bank & Payouts */}
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-secondary)/30 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-(--color-secondary)/20 pb-3">
            <h3 className="text-sm font-bold text-(--color-base-content) flex items-center gap-2">
              <MdAccountBalance size={18} /> Banking & Payout Details
            </h3>
            <div>
              {!editingBank ? (
                <button
                  onClick={() => setEditingBank(true)}
                  className="bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  Edit Bank
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveRiderSpecificData("bank", bankFormData)}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingBank(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-(--color-secondary)">
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank"
                value={bankFormData.bankName}
                onChange={(e) =>
                  setBankFormData({ ...bankFormData, bankName: e.target.value })
                }
                disabled={!editingBank}
                className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-(--color-secondary)">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 501001234567"
                  value={bankFormData.accountNumber}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, accountNumber: e.target.value })
                  }
                  disabled={!editingBank}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-(--color-secondary)">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000123"
                  value={bankFormData.ifscCode}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, ifscCode: e.target.value })
                  }
                  disabled={!editingBank}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Current Address */}
        <div className="bg-(--color-base-100) rounded-2xl border border-(--color-secondary)/30 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-(--color-secondary)/20 pb-3">
            <h3 className="text-sm font-bold text-(--color-base-content) flex items-center gap-2">
              <MdLocationOn size={18} /> Residential Address
            </h3>
            <div>
              {!editingAddress ? (
                <button
                  onClick={() => setEditingAddress(true)}
                  className="bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  Edit Address
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveRiderSpecificData("address", addressFormData)}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingAddress(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-(--color-secondary)">
                Street Address
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 101, Galaxy Apartments"
                value={addressFormData.address}
                onChange={(e) =>
                  setAddressFormData({ ...addressFormData, address: e.target.value })
                }
                disabled={!editingAddress}
                className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-(--color-secondary)">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Mumbai"
                  value={addressFormData.city}
                  onChange={(e) =>
                    setAddressFormData({ ...addressFormData, city: e.target.value })
                  }
                  disabled={!editingAddress}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-(--color-secondary)">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Maharashtra"
                  value={addressFormData.state}
                  onChange={(e) =>
                    setAddressFormData({ ...addressFormData, state: e.target.value })
                  }
                  disabled={!editingAddress}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-(--color-secondary)">
                  Pin Code
                </label>
                <input
                  type="text"
                  placeholder="400001"
                  value={addressFormData.pinCode}
                  onChange={(e) =>
                    setAddressFormData({ ...addressFormData, pinCode: e.target.value })
                  }
                  disabled={!editingAddress}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--color-base-100) disabled:bg-(--color-base-200)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPasswordChangeModalOpen && (
        <PasswordChangeModal
          open={isPasswordChangeModalOpen}
          onClose={() => setIsPasswordChangeModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RiderSettings;
