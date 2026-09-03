import { useState } from "react";
import { MdEdit, MdOutlineLockReset, MdOutlineAddAPhoto, MdPerson, MdEmail, MdPhone } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import PasswordChangeModal from "../commonModals/PasswordChangeModal";
import { RiLoader4Fill } from "react-icons/ri";

const AdminSetting = () => {
  const { user, setUser } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error("Full name and phone number are required");
      return;
    }

    try {
      setIsLoading(true);
      const payload = new FormData();
      payload.append("fullName", formData.fullName.trim());
      payload.append("phone", formData.phone.trim());

      if (profilePic) {
        payload.append("displayPic", profilePic);
      }

      const response = await api.put("/common/edit-profile", payload);

      if (response.data?.data) {
        setUser(response.data.data);
        sessionStorage.setItem("cravingUser", JSON.stringify(response.data.data));
      }

      setEditingProfile(false);
      setProfilePic(null);
      setProfilePicPreview(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setProfilePic(null);
    setProfilePicPreview(null);
    setEditingProfile(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicPreview(URL.createObjectURL(file));
      setProfilePic(file);
    }
  };

  const avatarSrc = profilePicPreview || user?.photo?.url || "https://placehold.co/400x400?text=Admin";

  return (
    <div className="space-y-6 text-white">
      {/* Top Header */}
      <div className="bg-[#072420] p-4 sm:p-5 rounded-2xl border border-teal-800/40 shadow-xl shadow-black/40 flex justify-between items-center">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <MdPerson className="text-[#f97316]" size={24} />
            Admin Profile & Settings
          </h1>
          <p className="text-xs text-[#8faea7] mt-0.5">
            Manage your administrator account credentials and personal information
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#072420] rounded-2xl p-6 border border-teal-800/40 shadow-xl shadow-black/40 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-teal-900/40 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Profile Information
            </h3>
            <p className="text-xs text-[#8faea7]">
              Update your photo, name, and contact details
            </p>
          </div>

          {!editingProfile ? (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-orange-950/40 hover:opacity-95 transition cursor-pointer"
              >
                <MdEdit size={14} /> Edit Profile
              </button>
              <button
                onClick={() => setIsPasswordChangeModalOpen(true)}
                className="flex items-center gap-1.5 border border-teal-800/60 bg-[#041916] text-[#8faea7] hover:text-white hover:bg-teal-900/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <MdOutlineLockReset size={16} /> Change Password
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-orange-950/40 hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
              >
                {isLoading ? <RiLoader4Fill className="animate-spin" /> : null}
                <span>{isLoading ? "Saving..." : "Save Changes"}</span>
              </button>
              <button
                onClick={handleCancelProfile}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-[#041916] hover:bg-teal-900/30 border border-teal-800/60 text-[#8faea7] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 pt-2">
          {/* Avatar Area */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#f97316] shadow-sm bg-[#041916]">
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {editingProfile && (
              <div
                className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white rounded-full shadow-md cursor-pointer hover:scale-105 transition"
                title="Change Photo"
              >
                <label htmlFor="profilePic" className="cursor-pointer">
                  <MdOutlineAddAPhoto className="text-base" />
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

          {/* Form Fields */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8faea7] mb-1">
                Full Name
              </label>
              <div className="relative">
                <MdPerson
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#537770]"
                />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                  disabled={!editingProfile}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs transition-colors ${
                    editingProfile
                      ? "bg-[#041916] border-orange-500/80 focus:ring-2 focus:ring-orange-500/50 text-white"
                      : "bg-[#041916]/60 border-teal-800/60 text-white"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8faea7] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <MdPhone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#537770]"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  disabled={!editingProfile}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs transition-colors ${
                    editingProfile
                      ? "bg-[#041916] border-orange-500/80 focus:ring-2 focus:ring-orange-500/50 text-white"
                      : "bg-[#041916]/60 border-teal-800/60 text-white"
                  }`}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8faea7] mb-1">
                Email Address (Primary Identity)
              </label>
              <div className="relative">
                <MdEmail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#537770]"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2 rounded-xl border bg-[#041916]/40 border-teal-900/60 text-[#8faea7] cursor-not-allowed text-xs"
                />
              </div>
              <p className="text-[10px] text-[#8faea7] mt-1">
                Email address cannot be modified as it is tied to account credentials.
              </p>
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

export default AdminSetting;
