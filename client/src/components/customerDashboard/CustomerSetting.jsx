import React from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import api from "../../config/ApiConfig";
import { useState } from "react";
import { MdLinkedCamera } from "react-icons/md";

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
  };
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
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
      payload.append("displayPic", profilePic);

      const res = await api.put("/common/edit-profile", payload);
      console.log(res);
      console.log(res.data);
      console.log(res.data.data);

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
                  PasswordChange
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 bg-(--color-secondary) text-(--color-secondary-content) px-3 py-1 rounded text-sm hover:bg-amber-700"
                  onClick={handelSaveProfile}
                  disabled={isloading}
                >
                  {isloading ? "Saving changes..." : "Save"}
                </button>
                <button
                  className="flex items-center gap-2 bg-(--color-secondary) text-(--color-secondary-content) px-3 py-1 rounded text-sm  hover:bg-amber-700"
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
            <div className="flex items-center gap-6 p-3">
              <div className="relative">
                <div className="w-36 h-36 ">
                  <img
                    src={profilePicPreview || user?.photo?.url}
                    alt=""
                    className="w-full h-full rounded-full object-cover border-2 border-(--color-primary)"
                  />
                </div>
                {editingProfile && (
                  <div
                    className="absolute cursor-pointer right-3 bottom-3.5 border rounded-2xl p-1 bg-(--color-base-200)"
                    title="Change Photo"
                  >
                    <label htmlFor="profilePic" className="cursor-pointer">
                      <MdLinkedCamera className="text-xl" />
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
              {/* editing names */}
              <div className=" space-y-4 w-full">
                <div className="grid grid-cols-1 gap-3 justify-center items-center">
                  {/* fullName */}
                  <div className="flex gap-2 items-center mt-3">
                    <label
                      htmlFor=""
                      className="block text-sm font-semibold mb-2"
                    >
                      fullName
                    </label>
                    <input
                      type="text"
                      onChange={handleInputData}
                      className={`w-full px-3 py-2 border ${editingProfile ? "border-(--color-secondary)" : "border-gray-300"} rounded col-span-4`}
                      name="fullName"
                      value={formData.fullName}
                      disabled={!editingProfile}
                    />
                  </div>
                  {/* email */}
                  <div className="flex gap-2 items-center mt-3">
                    <label
                      htmlFor=""
                      className="block text-sm font-semibold mb-2"
                    >
                      email
                    </label>
                    <input
                      type="email"
                      onChange={handleInputData}
                      className={`w-full px-3 py-2 border ${editingProfile ? "border-(--color-secondary) text-(--color-secondary) disabled:bg-(--color-secondary)/50 cursor-not-allowed" : "border-gray-300"} rounded col-span-4`}
                      name="email"
                      value={formData.email}
                      disabled
                    />
                  </div>
                  {/* phone */}
                  <div className="flex gap-2 items-center mt-3">
                    <label
                      htmlFor=""
                      className="block text-sm font-semibold mb-2"
                    >
                      phone
                    </label>
                    <input
                      type="tel"
                      onChange={handleInputData}
                      className={`w-full px-3 py-2 border ${editingProfile ? "border-(--color-secondary)" : "border-gray-300"} rounded col-span-4`}
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
    </>
  );
};

export default CustomerSetting;
