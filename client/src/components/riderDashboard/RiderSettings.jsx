import React from "react";
import api from "../../config/ApiConfig";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdLinkedCamera } from "react-icons/md";

const RiderSettings = () => {
  const { user, setUser } = useAuth();
  // console.log(user);
  const [isloading, setIsLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
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
    setProfilePicPreview(URL.createObjectURL(file));
    setProfilePic(file);
  };
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("displayPic", profilePic);
      const res = await api.put("/common/edit-profile", payload);
      // console.log(res);
      // console.log(res.data);
      // console.log(res.data.data);
      // setUser(res.data.data);
      sessionStorage.setItem("cravingUser", JSON.stringify(res.data.data));
      setEditingProfile(false);
      toast.success("Profile Updated Successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-y-auto h-full p-6 space-y-6">
        <div className="bg-(--color-base-200) rounded-lg p-6">
          <div className="flex justify-between items-center mb-4 ">
            <h3 className="text-lg font-semibold">Profile Information</h3>
            {!editingProfile ? (
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
                  onClick={() => setEditingProfile(true)}
                >
                  Edit
                </button>
                <button
                  className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
                  onClick={() => setIsPasswordChangeModalOpen(true)}
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 bg-(--color-secondary) text-(--color-secondary-content) px-3 py-1 rounded text-sm hover:bg-amber-700"
                  onClick={handleSaveProfile}
                  disabled={isloading}
                >
                  {isloading ? "Saving..." : "Save"}
                </button>
                <button
                  className="flex items-center gap-2 bg-(--color-secondary) text-(--color-secondary-content) px-3 py-1 rounded text-sm hover:bg-amber-700"
                  onClick={handleCancelProfile}
                  disabled={isloading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* camera and edit profile */}
          <div>
            <div className="flex gap-5">
              <div className="relative ">
                <div className="w-36 h-36 ">
                  <img
                    src={profilePicPreview || user?.photo?.url}
                    alt=""
                    className="w-full h-full rounded-full object-cover border-2 border-(--color-primary)"
                  />
                </div>
                {editingProfile && (
                  <div className="absolute cursor-pointer right-3 bottom-3.5 border rounded-2xl p-1 bg-(--color-base-200)">
                    <label htmlFor="profilePic" className="cursor-pointer">
                      <MdLinkedCamera className="text-xl" />
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      id="profilePic"
                      className="hidden"
                      onChange={handleProfilePicChange}
                    />
                  </div>
                )}
              </div>
              {/* editing names */}
              <div className="w-full space-y-4">
                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <label className="font-medium">Full Name</label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputData}
                    disabled={!editingProfile}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <label className="font-medium">Email</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputData}
                    disabled
                    className={`w-full px-3 py-2 border rounded ${
                      editingProfile
                        ? "border-(--color-secondary) text-(--color-secondary) disabled:bg-(--color-secondary)/50 cursor-not-allowed"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <label className="font-medium">Phone</label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputData}
                    disabled={!editingProfile}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RiderSettings;
