import React, { useState } from "react";
import api from "../../config/ApiConfig";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleCloseModal = () => {
    setFormData({
      email: "",
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setIsOtpSent(false);
    setIsOtpVerified(false);
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

      // Step 1: Send OTP
      if (!isOtpSent) {
        if (!formData.email.trim()) {
          toast.error("Please enter your registered email address");
          return;
        }
        const res = await api.post("/auth/send-otp", {
          email: formData.email.toLowerCase().trim(),
        });
        toast.success(res.data.message || "OTP sent successfully");
        setIsOtpSent(true);
        return;
      }

      // Step 2: Verify OTP
      if (isOtpSent && !isOtpVerified) {
        if (!formData.otp.trim()) {
          toast.error("Please enter the 6-digit OTP");
          return;
        }
        const res = await api.post("/auth/verify-otp", {
          email: formData.email.toLowerCase().trim(),
          otp: formData.otp.trim(),
        });
        toast.success(res.data.message || "OTP verified successfully");
        setIsOtpVerified(true);
        return;
      }

      // Step 3: Reset Password
      if (isOtpSent && isOtpVerified) {
        if (!formData.newPassword || formData.newPassword.length < 6) {
          toast.error("New password must be at least 6 characters long");
          return;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const res = await api.post("/auth/reset-password", {
          newPassword: formData.newPassword,
        });
        toast.success(res.data.message || "Password reset successfully! Please login.");
        handleCloseModal();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to process request. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
        <header className="flex justify-between items-center border-b pb-3">
          <h2 className="font-bold text-lg text-(--color-primary)">
            Reset Password
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <MdCancel className="text-2xl" />
          </button>
        </header>

        <main className="space-y-3">
          {/* Step 1: Email */}
          <div>
            <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
              Registered Email
            </label>
            <input
              type="email"
              value={formData.email}
              name="email"
              placeholder="name@example.com"
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary) disabled:bg-gray-100 disabled:text-gray-500"
              disabled={isLoading || isOtpSent}
            />
          </div>

          {/* Step 2: OTP */}
          {isOtpSent && (
            <div>
              <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.otp}
                name="otp"
                placeholder="Enter 6-digit OTP"
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary) disabled:bg-gray-100 disabled:text-gray-500 font-mono tracking-wider"
                disabled={isLoading || isOtpVerified}
              />
            </div>
          )}

          {/* Step 3: New Password */}
          {isOtpSent && isOtpVerified && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Min 6 characters"
                  value={formData.newPassword}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmNewPassword}
                  name="confirmNewPassword"
                  placeholder="Re-enter new password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </main>

        <footer className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-(--color-primary) text-(--color-primary-content) rounded-lg text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
            onClick={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading && <LuLoaderCircle className="animate-spin text-sm" />}
            {isOtpSent
              ? isOtpVerified
                ? "Reset Password"
                : "Verify OTP"
              : "Send OTP"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
