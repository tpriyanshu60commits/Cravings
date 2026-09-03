import { useState } from "react";
import toast from "react-hot-toast";
import api from "../config/ApiConfig";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLockClosedOutline,
  IoRestaurantOutline,
  IoHeartOutline,
} from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="relative min-h-screen w-full bg-[#061d19] text-white flex flex-col justify-center overflow-x-hidden select-none selection:bg-orange-500 selection:text-white py-6 sm:py-10">
      
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[32rem] h-[32rem] bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Right Geometric Diagonal Gradient Accent */}
      <div
        className="hidden md:block absolute right-0 top-0 bottom-0 w-2/5 lg:w-[42%] xl:w-[40%] bg-gradient-to-br from-[#f97316] to-[#ea580c] pointer-events-none z-0 opacity-95"
        style={{
          clipPath: "polygon(42% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      />
      <div
        className="md:hidden absolute right-0 bottom-0 w-3/4 h-1/2 bg-gradient-to-br from-[#f97316] to-[#ea580c] pointer-events-none z-0 opacity-90"
        style={{
          clipPath: "polygon(40% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Section: Minimal, Clean, Text-Only */}
          <div className="lg:col-span-5 flex flex-col items-start text-left max-w-md mx-auto lg:mx-0 py-4">
            
            {/* Elegant Small Welcome Message */}
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-[#ea580c] uppercase mb-2">
              Start Your Journey
            </p>

            {/* Main Welcome Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-tight text-white mb-3">
              Welcome to your <br />
              <span className="text-[#ea580c]">food journey</span>
            </h1>

            {/* Short Supporting Description */}
            <p className="text-[#98b8b0] text-sm sm:text-base leading-relaxed mb-8 font-normal">
              Join thousands of food lovers and explore the best restaurants around you with seamless ordering.
            </p>

            {/* Clean, Simple Text-Based Feature Highlights */}
            <div className="w-full space-y-5 mb-8">
              
              {/* Highlight 1: Discover */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-[#082a24]/90 border border-teal-700/40 flex items-center justify-center text-orange-400 shrink-0 group-hover:border-orange-500/60 transition-colors">
                  <IoRestaurantOutline className="text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    Discover
                  </h3>
                  <p className="text-xs text-[#87aba2] mt-0.5 leading-relaxed">
                    Find the best restaurants and cuisines nearby.
                  </p>
                </div>
              </div>

              {/* Highlight 2: Order */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-[#082a24]/90 border border-teal-700/40 flex items-center justify-center text-orange-400 shrink-0 group-hover:border-orange-500/60 transition-colors">
                  <TbTruckDelivery className="text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    Order
                  </h3>
                  <p className="text-xs text-[#87aba2] mt-0.5 leading-relaxed">
                    Order your favorite food with fast, real-time tracking.
                  </p>
                </div>
              </div>

              {/* Highlight 3: Enjoy */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-[#082a24]/90 border border-teal-700/40 flex items-center justify-center text-orange-400 shrink-0 group-hover:border-orange-500/60 transition-colors">
                  <IoHeartOutline className="text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    Enjoy
                  </h3>
                  <p className="text-xs text-[#87aba2] mt-0.5 leading-relaxed">
                    Enjoy delicious meals and great dining experiences.
                  </p>
                </div>
              </div>

            </div>

            {/* Left Login Prompt */}
            <div className="text-xs sm:text-sm text-[#87aba2]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#ea580c] font-semibold hover:text-orange-400 hover:underline transition-colors ml-1"
              >
                Login here
              </Link>
            </div>

          </div>

          {/* Right Section: Compact Hero Signup Card */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-lg bg-[#072420]/85 backdrop-blur-xl border border-teal-800/50 rounded-3xl p-6 sm:p-7 shadow-[0_15px_35px_rgba(0,0,0,0.5),0_0_30px_rgba(234,88,12,0.08)] transition-all duration-300">
              
              {/* Card Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ea580c] text-center mb-1 tracking-tight">
                Create an Account
              </h2>
              <p className="text-xs sm:text-sm text-[#8faea7] text-center mb-4">
                Join us and start your food journey
              </p>

              {/* Polished Segmented Role Selection */}
              <div className="mb-4">
                <div className="grid grid-cols-3 p-1 rounded-xl bg-[#041916]/90 border border-teal-800/60 gap-1">
                  {["customer", "restaurant", "rider"].map((type) => {
                    const isSelected = formData.userType === type;
                    return (
                      <label
                        key={type}
                        className={`relative flex items-center justify-center py-1.5 sm:py-2 rounded-lg cursor-pointer text-xs sm:text-sm font-semibold capitalize transition-all duration-200 select-none ${
                          isSelected
                            ? "bg-[#ea580c] text-white shadow-md shadow-orange-950/40"
                            : "text-[#8faea7] hover:text-white hover:bg-teal-900/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="userType"
                          value={type}
                          checked={isSelected}
                          onChange={handleUserTypeChange}
                          className="sr-only"
                        />
                        <span>{type}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.userType && (
                  <span className="text-red-400 text-xs mt-1 block">
                    {errors.userType}
                  </span>
                )}
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Full Name */}
                <div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[#739b92] pointer-events-none">
                      <IoPersonOutline className="text-base" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className={`w-full bg-[#041916]/90 border ${
                        errors.fullName ? "border-red-500" : "border-teal-800/60"
                      } rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-[#537770] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200`}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="text-red-400 text-[11px] mt-0.5 block">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[#739b92] pointer-events-none">
                      <IoMailOutline className="text-base" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className={`w-full bg-[#041916]/90 border ${
                        errors.email ? "border-red-500" : "border-teal-800/60"
                      } rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-[#537770] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200`}
                    />
                  </div>
                  {errors.email && (
                    <span className="text-red-400 text-[11px] mt-0.5 block">
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[#739b92] pointer-events-none">
                      <IoCallOutline className="text-base" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className={`w-full bg-[#041916]/90 border ${
                        errors.phone ? "border-red-500" : "border-teal-800/60"
                      } rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-[#537770] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200`}
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-red-400 text-[11px] mt-0.5 block">
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Gender & Date of Birth (2-Column Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full bg-[#041916]/90 border ${
                        errors.gender ? "border-red-500" : "border-teal-800/60"
                      } rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200 cursor-pointer`}
                    >
                      <option value="" className="bg-[#051a17] text-[#8faea7]">
                        Select Gender
                      </option>
                      <option value="male" className="bg-[#051a17] text-white">
                        Male
                      </option>
                      <option value="female" className="bg-[#051a17] text-white">
                        Female
                      </option>
                      <option value="other" className="bg-[#051a17] text-white">
                        Other
                      </option>
                    </select>
                    {errors.gender && (
                      <span className="text-red-400 text-[11px] mt-0.5 block">
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
                      className={`w-full bg-[#041916]/90 border ${
                        errors.dob ? "border-red-500" : "border-teal-800/60"
                      } rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200 cursor-pointer`}
                    />
                    {errors.dob && (
                      <span className="text-red-400 text-[11px] mt-0.5 block">
                        {errors.dob}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[#739b92] pointer-events-none">
                      <IoLockClosedOutline className="text-base" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password (min 6 characters)"
                      className={`w-full bg-[#041916]/90 border ${
                        errors.password ? "border-red-500" : "border-teal-800/60"
                      } rounded-xl pl-9 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-[#537770] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-[#739b92] hover:text-white transition-colors cursor-pointer p-1"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-400 text-[11px] mt-0.5 block">
                      {errors.password}
                    </span>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[#739b92] pointer-events-none">
                      <IoLockClosedOutline className="text-base" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm Password"
                      className={`w-full bg-[#041916]/90 border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-teal-800/60"
                      } rounded-xl pl-9 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-[#537770] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 text-[#739b92] hover:text-white transition-colors cursor-pointer p-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-400 text-[11px] mt-0.5 block">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#9abeb6] hover:text-white transition-colors select-none">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      onChange={handleInputChange}
                      checked={formData.agreeTerms}
                      className="w-3.5 h-3.5 rounded border-teal-700 bg-[#041916] accent-[#ea580c] cursor-pointer"
                    />
                    <span>
                      I agree to the{" "}
                      <span className="text-[#ea580c] font-semibold hover:underline">
                        Terms and Conditions
                      </span>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <span className="text-red-400 text-[11px] mt-0.5 block">
                      {errors.agreeTerms}
                    </span>
                  )}
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1.5 py-2.5 sm:py-3 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    "Register"
                  )}
                </button>

                {/* Mobile Login Prompt */}
                <div className="lg:hidden text-center text-xs text-[#87aba2] pt-1">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#ea580c] font-semibold hover:underline"
                  >
                    Login here
                  </Link>
                </div>

              </form>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;

