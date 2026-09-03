import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import PasswordChangeModal from "../../../commonModals/PasswordChangeModal";
import { MdEdit, MdOutlineAddAPhoto, MdOutlineLockReset } from "react-icons/md";
import api from "../../../../config/ApiConfig";
import toast from "react-hot-toast";

const PersonalInformation = () => {
  const { user, setUser } = useAuth();
  const [ isLoading, setIsLoading ] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] =
    useState(false);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const payload = new FormData();
      payload.append("fullName", profileFormData.fullName);
      payload.append("email", profileFormData.email);
      payload.append("phone", profileFormData.phone);
      payload.append("displayPic", profilePic);

      const response = await api.put(`/common/edit-profile`, payload);
      setUser(response.data.data);
      sessionStorage.setItem("cravingUser", JSON.stringify(response.data.data));
      setEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancelProfile = () => {
    setProfileFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    });
    setProfilePicPreview(null);
    setEditingProfile(false);
  };
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePicPreview(URL.createObjectURL(file));
    setProfilePic(file);
  };

  return (
    <>
      {/* User Profile Section */}
      <div className="bg-[#072420] rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 p-5 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-500/80 shadow-md">
            <img
              src={profilePicPreview || user?.photo?.url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {editingProfile && (
            <div
              className="absolute cursor-pointer bottom-0 right-0 p-1.5 rounded-xl bg-black/80 text-orange-400 border border-teal-800/60 hover:text-white transition"
              title="Change Photo"
            >
              <label htmlFor="profilePic" className="cursor-pointer">
                <MdOutlineAddAPhoto className="text-sm" />
              </label>
              <input
                type="file"
                accept="image/*"
                name="profilePic"
                id="profilePic"
                className="hidden"
                onChange={handleProfilePicChange}
              />
            </div>
          )}
        </div>
        <div className="w-full space-y-4">
          <div className="flex flex-wrap justify-between items-center border-b border-teal-900/60 pb-3 gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Owner Profile & Account Information
            </h3>
            {!editingProfile ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white hover:border-orange-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <MdEdit size={14} className="text-orange-400" /> Edit Profile
                </button>
                <button
                  onClick={() => setIsPasswordChangeModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-orange-400 hover:text-orange-300 hover:border-orange-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <MdOutlineLockReset size={14} /> Change Password
                </button>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelProfile}
                  className="flex items-center gap-1.5 bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="w-full">
              <label className="text-xs font-semibold text-[#8faea7] block mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profileFormData.fullName}
                onChange={handleProfileChange}
                className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                  editingProfile
                    ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    : "bg-[#041916]/50 opacity-80"
                }`}
                disabled={!editingProfile}
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-semibold text-[#8faea7] block mb-1">Email (Primary)</label>
              <input
                type="email"
                name="email"
                value={profileFormData.email}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white bg-[#041916]/50 opacity-60 cursor-not-allowed"
                disabled
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-semibold text-[#8faea7] block mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profileFormData.phone}
                onChange={handleProfileChange}
                className={`w-full px-3 py-2 text-xs border border-teal-800/60 rounded-xl text-white ${
                  editingProfile
                    ? "bg-[#041916] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    : "bg-[#041916]/50 opacity-80"
                }`}
                disabled={!editingProfile}
              />
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
    </>
  );
};

export default PersonalInformation;
