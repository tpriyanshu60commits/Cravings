import React from "react";
import toast from "react-hot-toast";
import { useState } from "react";
import api from "../config/ApiConfig";
import { Link, useNavigate, useParams } from "react-router-dom";

const Register = () => {
  const userType = useParams().userType;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userType: "",
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
    console.log(formData);
  };

  const handleUserTypeChange = (e) => {
    console.log("Selected:", e.target.value);

    setFormData((prev) => ({
      ...prev,
      userType: e.target.value,
    }));
  };
  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = "FullName is required";
    if (!data.email.trim()) newErrors.email = "email is required";
    if (!data.phone.trim()) newErrors.phone = "phone is required";
    if (!data.gender) newErrors.gender = "gender is required";
    if (!data.dob) newErrors.dob = "dob is required";
    if (!data.password || data.password.length < 6)
      newErrors.password = "password must be of atleast 6 characters";
    if (!data.confirmPassword)
      newErrors.confirmPassword = "confirmPassword is required";
    if (data.password !== data.confirmPassword)
      newErrors.confirmPassword = "Password do not match";
    if (!data.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms and condition";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const validateErrors = validateForm(formData);

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      setLoading(false);
      return;
    }
    console.log("FormData", formData);

    try {
      console.log("1. API call se pehle");

      const res = await api.post("/auth/register", {
        ...formData,
        email: formData.email.toLowerCase(),
      });

      console.log("2. API call ke baad");
      console.log("Response:", res);
      console.log("Response Data:", res.data);

      toast.success("Registration Success");

      console.log("3. Toast ke baad");
    } catch (error) {
      console.log("Catch me aaya");
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during registration. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="bg-(--color-base-100) h-[90vh] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md px-10 py-6 max-w-md w-full overflow-y-auto max-h-[85vh]">
          <p className="text-(--color-secondary) text-center mb-4 ">
            Join us as a Customer, Restaurant, or Rider
          </p>

          {/* User Type Selection */}
          <div>
            <label className="text-(--color-neutral) font-semibold mb-3">
              Register as:
            </label>
            <div className="flex gap-5">
              {["customer", "restaurant", "rider"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="userType"
                    value={type}
                    checked={formData.userType === type}
                    onChange={handleUserTypeChange}
                  />
                  <span className="text-(--color-neutral) capitalize">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {/* Registration Form */}
          {/* fullName */}
          <form onSubmit={handleSubmit}>
            <div className="mt-3 mb-3">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-(--color-primary) "
              />
              {errors.fullName && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.fullName}
                </span>
              )}
            </div>
            {/* email */}
            <div className="mb-4">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
              />
              {errors.email && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.email}
                </span>
              )}
            </div>
            {/* Phone */}
            <div className="mb-4">
              <input
                type="number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
              {errors.phone && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.phone}
                </span>
              )}
            </div>
            {/* Gender & Date of Birth */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>{" "}
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
                  className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                />
                {errors.dob && (
                  <span className="text-(--color-error) text-xs mt-1 block">
                    {errors.dob}
                  </span>
                )}
              </div>
            </div>
            {/* Password */}
            <div className="mb-4 mt-3">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
              {errors.password && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.password}
                </span>
              )}
            </div>
            {/* Confirm Password */}
            <div className="mb-6">
              <input
                type="text"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="w-full px-3 py-2 border rounded-md text-sm text-(--color-neutral) placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
              {errors.confirmPassword && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
            {/* agreeTerms */}
            <div className="mb-6">
              <input
                type="checkbox"
                name="agreeTerms"
                onChange={handleInputChange}
                checked={formData.agreeTerms}
                className="mt-1 cursor-pointer"
              />
              <span className="text-sm">
                I agree to the{" "}
                <span className="text-(--color-primary) hover:underline">
                  terms and conditions.
                </span>
              </span>
              {errors.agreeTerms && (
                <span className="text-(--color-error) text-xs mt-1 block ml-7">
                  {errors.agreeTerms}
                </span>
              )}
              {/* Register Button */}
              <button
                type="submit"
                className="w-full py-3 bg-(--color-primary) text-white font-semibold rounded-md hover:bg-orange-700 transition-colors duration-300 mb-4"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
