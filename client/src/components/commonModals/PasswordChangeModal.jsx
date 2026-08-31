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
      <div className="fixed inset-0 z-999 bg-black/60 backdrop-blur-xs flex justify-center items-center">
        <div className="bg-white w-xl rounded shadow max-h-[80vh] overflow-y-auto relative p-4">
          <header className="flex justify-between p-4 border-b border-(--color-secondary)">
            <div className="font-bold text-xl text-(--color-primary)">
              Change Password
            </div>  
            <button className="text-2xl" onClick={handleCloseModal}>
              <MdCancel className=" hover:text-red-700 text-2xl" />
            </button>
          </header>
          {/* oldpassword */}
          <div className="flex flex-col gap-2 mt-3">
            <label htmlFor="oldpassword" className="font-semibold">
              OldPassword
            </label>
            <input
              type="password"
              id="oldpassword"
              onChange={handleChange}
              name="oldPassword"
              value={formData.oldPassword}
              className="border border-(--color-secondary) rounded px-3 py-2 disabled:bg-(--color-secondary) disabled:text-(--color-secondary-content)"
              disabled={loading}
            />
          </div>
          {/* newPassword */}
          <div className="flex flex-col gap-2 mt-3">
            <label htmlFor="newPassword" className="font-semibold">
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              onChange={handleChange}
              name="newPassword"
              value={formData.newPassword}
              className="border border-(--color-secondary) rounded px-3 py-2 disabled:bg-(--color-secondary) disabled:text-(--color-secondary-content)"
              disabled={loading}
            />
          </div>
          {/* ConfirmPassword */}
          <div className="flex flex-col gap-2 mt-3">
            <label htmlFor="confirmPassword" className="font-semibold">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              onChange={handleChange}
              name="confirmPassword"
              value={formData.confirmPassword}
              className="border border-(--color-secondary) rounded px-3 py-2 disabled:bg-(--color-secondary) disabled:text-(--color-secondary-content)"
              disabled={loading}
            />
          </div>
          <footer className="w-full p-4 border-t-4 mt-3 border-(--color-secondary) flex justify-end gap-3">
            <button
              className="flex items-center gap-2 bg-(--color-secondary) text-(--color-secondary-content) px-3 py-1 rounded text-sm"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
              onClick={handlePasswordChange}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LuLoaderCircle className="animate-spin" /> Changing...
                </>
              ) : (
                "change"
              )}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default PasswordChangeModal;
