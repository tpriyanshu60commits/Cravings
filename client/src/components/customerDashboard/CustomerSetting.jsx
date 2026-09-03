import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import api from "../../config/ApiConfig";
import { MdLinkedCamera } from "react-icons/md";
import PasswordChangeModal from "../../components/commonModals/PasswordChangeModal"
const CustomerSetting = () => {
  const { user, setUser } = useAuth();
  const [isloading, setIsLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] =
    useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const handleInputData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleCancelProfile = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setEditingProfile(false);
    setProfilePicPreview(null);
    setProfilePic(null);
  };
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.time("preview");
    setProfilePicPreview(URL.createObjectURL(file));
    setProfilePic(file);
    console.timeEnd("preview");
  };

  const handelSaveProfile = async () => {
    try {
      setIsLoading(true);
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      if (profilePic) {
        payload.append("displayPic", profilePic);
      }

      const res = await api.put("/common/edit-profile", payload);
      // console.log(res);
      // console.log(res.data);
      // console.log(res.data.data);

      setUser(res.data.data);
      sessionStorage.setItem("cravingUser", JSON.stringify(res.data.data));
      setEditingProfile(false);
      toast.success("profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-y-auto h-full p-4 sm:p-6 space-y-6 text-white max-h-[88vh]">
        <div className="bg-[#072420] rounded-2xl p-5 sm:p-6 border border-teal-800/40 shadow-xl shadow-black/40">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-teal-900/40">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Profile Information</h3>
              <p className="text-xs text-[#8faea7] mt-0.5">Manage your personal information and security settings</p>
            </div>
            {!editingProfile ? (
              <div className="flex gap-2.5">
                <button
                  className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-orange-950/40 hover:opacity-95 cursor-pointer"
                  onClick={() => setEditingProfile(true)}
                >
                  Edit Profile
                </button>
                <button
                  className="bg-[#041916] border border-teal-800/60 hover:bg-teal-900/30 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  onClick={() => setIsPasswordChangeModalOpen(true)}
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <button
                  className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-orange-950/40 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  onClick={handelSaveProfile}
                  disabled={isloading}
                >
                  {isloading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition hover:bg-teal-900/30 disabled:opacity-50 cursor-pointer"
                  onClick={handleCancelProfile}
                  disabled={isloading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Camera and Edit Profile */}
          <div>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-2">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-orange-500/50 bg-[#041916] flex items-center justify-center text-3xl font-bold text-orange-400">
                  {profilePicPreview || user?.photo?.url ? (
                    <img
                      src={profilePicPreview || user?.photo?.url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user?.fullName?.charAt(0)?.toUpperCase() || "C"}</span>
                  )}
                </div>
                {editingProfile && (
                  <div
                    className="absolute cursor-pointer right-1 bottom-1 border border-teal-700/60 rounded-full p-2 bg-[#041916] text-orange-400 hover:text-white hover:bg-teal-900/50 shadow-lg transition"
                    title="Change Photo"
                  >
                    <label htmlFor="profilePic" className="cursor-pointer">
                      <MdLinkedCamera className="text-lg" />
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      id="profilePic"
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Editing Fields */}
              <div className="space-y-4 w-full flex-1">
                <div className="grid grid-cols-1 gap-4">
                  {/* fullName */}
                  <div>
                    <label
                      className="block text-xs font-semibold text-[#8faea7] mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      onChange={handleInputData}
                      className="w-full px-3.5 py-2 text-xs border border-teal-800/60 bg-[#041916] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      name="fullName"
                      value={formData.fullName}
                      disabled={!editingProfile}
                    />
                  </div>

                  {/* email */}
                  <div>
                    <label
                      className="block text-xs font-semibold text-[#8faea7] mb-1.5"
                    >
                      Email Address (Locked)
                    </label>
                    <input
                      type="email"
                      className="w-full px-3.5 py-2 text-xs border border-teal-900/60 bg-[#041916]/60 text-[#8faea7] rounded-xl cursor-not-allowed"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                  </div>

                  {/* phone */}
                  <div>
                    <label
                      className="block text-xs font-semibold text-[#8faea7] mb-1.5"
                    >
                      Phone Number
                    </label>
                    <input
                      type="number"
                      onChange={handleInputData}
                      className="w-full px-3.5 py-2 text-xs border border-teal-800/60 bg-[#041916] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      name="phone"
                      value={formData.phone}
                      disabled={!editingProfile}
                    />
                  </div>
                </div>
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
    </>
  );
};

export default CustomerSetting;
