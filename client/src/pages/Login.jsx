import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import ForgotPasswordModal from "../components/commonModals/ForgotPasswordModal";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!data.password.trim()) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validateErrors = validateForm(formData);
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const payload = {
      ...formData,
      email: formData.email.toLowerCase().trim(),
    };

    try {
      const res = await api.post("/auth/login", payload);
      const userData = res.data.data;
      login(userData);
      toast.success(res.data.message || "Welcome Back");

      if (userData.userType === "restaurant") {
        navigate("/restaurant-dashboard");
      } else if (userData.userType === "rider") {
        navigate("/rider-dashboard");
      } else if (userData.userType === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during Login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-screen bg-[url('/login.avif')] bg-cover flex items-center justify-start p-5">
        <div className="w-100 border rounded-xl p-6 mx-6 bg-(--color-base-100) shadow-xl">
          <h1 className="text-3xl font-bold text-(--color-primary) mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-(--color-secondary) text-center mb-6 text-sm">
            Login to your Cravings account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-(--color-neutral) font-semibold mb-1 text-sm">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded text-sm text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              />
              {errors.email && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <label className="block text-(--color-neutral) font-semibold mb-1 text-sm">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  name="password"
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-(--color-secondary)">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-(--color-primary) hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-(--color-primary) text-white font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-xs text-(--color-secondary) pt-2">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-(--color-primary) font-semibold hover:underline"
              >
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>

      {showForgotPasswordModal && (
        <ForgotPasswordModal
          open={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        />
      )}
    </>
  );
};

export default Login;
