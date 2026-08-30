import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/ApiConfig";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userType: "customer",
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUserTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      userType: e.target.value,
    }));
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.userType) newErrors.userType = "Role selection is required";
    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!data.phone.trim()) newErrors.phone = "Phone number is required";
    if (!data.gender) newErrors.gender = "Gender is required";
    if (!data.dob) newErrors.dob = "Date of birth is required";
    if (!data.password || data.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!data.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    if (data.password !== data.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!data.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms and conditions";
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

    try {
      const res = await api.post("/auth/register", {
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dob: formData.dob,
        password: formData.password,
        userType: formData.userType,
      });

      toast.success(res.data.message || "Registration Successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during registration. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-(--color-base-100) min-h-[90vh] flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-(--color-base-300)">
        <h2 className="text-2xl font-bold text-(--color-primary) text-center mb-1">
          Create an Account
        </h2>
        <p className="text-(--color-secondary) text-center mb-6 text-sm">
          Join us as a Customer, Restaurant Partner, or Rider
        </p>

        {/* User Type Selection */}
        <div className="mb-4">
          <label className="text-(--color-neutral) font-semibold text-sm block mb-2">
            Register as:
          </label>
          <div className="flex gap-4">
            {["customer", "restaurant", "rider"].map((type) => (
              <label
                key={type}
                className="flex items-center gap-1.5 cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  name="userType"
                  value={type}
                  checked={formData.userType === type}
                  onChange={handleUserTypeChange}
                  className="accent-(--color-primary)"
                />
                <span className="text-(--color-neutral) capitalize">
                  {type}
                </span>
              </label>
            ))}
          </div>
          {errors.userType && (
            <span className="text-(--color-error) text-xs mt-1 block">
              {errors.userType}
            </span>
          )}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            />
            {errors.fullName && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            />
            {errors.email && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            />
            {errors.phone && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.phone}
              </span>
            )}
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.gender}
                </span>
              )}
            </div>

            <div>
              <input
                type="date"
                value={formData.dob}
                name="dob"
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              />
              {errors.dob && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.dob}
                </span>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password (min 6 chars)"
              className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            />
            {errors.password && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            />
            {errors.confirmPassword && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Agree Terms */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-(--color-secondary)">
              <input
                type="checkbox"
                name="agreeTerms"
                onChange={handleInputChange}
                checked={formData.agreeTerms}
                className="cursor-pointer accent-(--color-primary)"
              />
              <span>
                I agree to the{" "}
                <span className="text-(--color-primary) font-semibold hover:underline">
                  Terms and Conditions
                </span>
              </span>
            </label>
            {errors.agreeTerms && (
              <span className="text-(--color-error) text-xs mt-1 block">
                {errors.agreeTerms}
              </span>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-(--color-primary) text-white font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50 mt-2"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Login Link */}
          <div className="text-center text-xs text-(--color-secondary) pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-(--color-primary) font-semibold hover:underline"
            >
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
