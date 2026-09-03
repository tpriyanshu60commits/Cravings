import { useState } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { MdCancel } from "react-icons/md";
import { LuLoaderCircle } from "react-icons/lu";

const PasswordChangeModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, isLoading] = useState(false);
  const handleCloseModal = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = async () => {
    isLoading(true);
    const payload = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    };
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New password and confirm password do not match.");
        isLoading(false);
      }
      const res = await api.patch("/common/change-password", payload);
      // console.log(res);
      toast.success(res.data.message);
      handleCloseModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during password change. Please try again.",
      );
    } finally {
      isLoading(false);
    }
  };
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-center p-4">
        <div className="bg-[#072420] border border-teal-800/60 w-full max-w-lg rounded-2xl shadow-2xl shadow-black/80 max-h-[85vh] overflow-y-auto relative p-6 text-white">
          <header className="flex justify-between items-center pb-3 border-b border-teal-900/60">
            <div className="font-bold text-lg text-white tracking-tight">
              Change Account Password
            </div>  
            <button className="text-[#8faea7] hover:text-white transition cursor-pointer text-2xl" onClick={handleCloseModal}>
              <MdCancel />
            </button>
          </header>
          {/* oldpassword */}
          <div className="flex flex-col gap-1.5 mt-4">
            <label htmlFor="oldpassword" className="text-xs font-semibold text-[#8faea7]">
              Current Password
            </label>
            <input
              type="password"
              id="oldpassword"
              onChange={handleChange}
              name="oldPassword"
              value={formData.oldPassword}
              placeholder="Enter current password"
              className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-50"
              disabled={loading}
            />
          </div>
          {/* newPassword */}
          <div className="flex flex-col gap-1.5 mt-3.5">
            <label htmlFor="newPassword" className="text-xs font-semibold text-[#8faea7]">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              onChange={handleChange}
              name="newPassword"
              value={formData.newPassword}
              placeholder="Enter at least 6 characters"
              className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-50"
              disabled={loading}
            />
          </div>
          {/* ConfirmPassword */}
          <div className="flex flex-col gap-1.5 mt-3.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-[#8faea7]">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              onChange={handleChange}
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="Re-enter new password"
              className="w-full bg-[#041916] border border-teal-800/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#537770] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-50"
              disabled={loading}
            />
          </div>
          <footer className="w-full pt-4 mt-6 border-t border-teal-900/60 flex justify-end gap-3">
            <button
              className="bg-[#041916] border border-teal-800/60 text-[#8faea7] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-[#f97316] to-[#ea580c] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-orange-950/40 hover:opacity-95 cursor-pointer"
              onClick={handlePasswordChange}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LuLoaderCircle className="animate-spin" /> Changing...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default PasswordChangeModal;
