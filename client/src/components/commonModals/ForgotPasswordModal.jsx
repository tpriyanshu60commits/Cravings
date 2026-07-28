import React from "react";
import api from "../../config/ApiConfig";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdCancel } from "react-icons/md";
import { LuLoaderCircle } from "react-icons/lu";

const ForgotPasswordModal = ({ open = true, onClose = () => {} }) => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isloading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleCloseModal = () => {
    setFormData({
      email: "",
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      if (!isOtpSent) {
        const res = await api.post("/auth/send-otp", formData);
        toast.success(res.data.message);
        setIsOtpSent(true);
      }
      if (isOtpSent && !isOtpVerified) {
        const res = await api.post("/auth/verify-otp", formData);
        toast.success(res.data.message);
        setIsOtpVerified(true);
      }
      if (isOtpSent && isOtpVerified) {
        const res = await api.post("/auth/reset-password", formData);
        toast.success(res.data.message);
        handleCloseModal();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during registration. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999 ">
        <div className="bg-white w-xl rounded shadow max-h-[80vh] overflow-y-auto p-5">
          <header className="flex justify-between border-b border-(--color-secondary) ">
            <div className="font-bold text-xl text-(--color-primary) mb-3">
              Forgot Password
            </div>
            <button onClick={handleCloseModal} className="mb-3">
              <MdCancel className="text-xl hover:text-red-700 hover:text-2xl" />
            </button>
          </header>
          <main>
            <div className="p-4">
              {/* email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-semibold">
                  Your Registred Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  name="email"
                  onChange={handleInputChange}
                  className="border border-(--color-secondary) rounded px-3 py-2 disabled:bg-(--color-secondary) disabled:text-(--color-secondary-content)"
                  disabled={isloading || isOtpSent}
                />
              </div>
              {/* otp */}
              {isOtpSent && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="otp" className="font-semibold">
                    Your OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={formData.otp}
                    name="otp"
                    onChange={handleInputChange}
                    className="border border-(--color-secondary) rounded px-3 py-2 disabled:bg-(--color-secondary) disabled:text-(--color-secondary-content)"
                    disabled={isloading || isOtpVerified}
                  />
                </div>
              )}
              {/* reset password */}
              {isOtpSent && isOtpVerified && (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="newPassword" className="font-semibold">
                      Create Your New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={formData.newPassword}
                      className="border border-(--color-secondary) rounded px-3 py-2 disabled:bg-(--color-secondary) disabled:text-(--color-secondary-content)"
                      onChange={handleInputChange}
                      disabled={isloading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="confirmPassword" className="font-semibold">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmNewPassword}
                      id="confirmPassword"
                      name="confirmNewPassword"
                      className="border border-(--color-secondary) rounded px-3 py-2 disabled:bg-(--color-secondary) disabled:text-(--color-secondary-content)"
                      onChange={handleInputChange}
                      disabled={isloading}
                    />
                  </div>
                </>
              )}
            </div>
          </main>
          <footer className="w-full p-4 border-t border-(--color-secondary) flex justify-end gap-3">
            <button
              onClick={handleCloseModal}
              className="flex items-center gap-2 bg-(--color-secondary) text-(--color-secondary-content) px-3 py-1 rounded text-sm"
              disabled={isloading}
            >
              Close
            </button>
            <button
              className="flex items-center gap-2 bg-(--color-primary) text-(--color-primary-content) px-3 py-1 rounded text-sm"
              onClick={handleResetPassword}
              disabled={isloading}
            >
              {isloading ? (
                <>
                  <LuLoaderCircle className="animate-spin" />
                  Loading...{" "}
                </>
              ) : isOtpSent ? (
                isOtpVerified ? (
                  "Reset Password"
                ) : (
                  "Verify OTP"
                )
              ) : (
                "Send Otp"
              )}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordModal;
