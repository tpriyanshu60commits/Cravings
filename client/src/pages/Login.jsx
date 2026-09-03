import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  IoFastFoodOutline,
  IoMailOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import ForgotPasswordModal from "../components/commonModals/ForgotPasswordModal";
import heroFoodBowl from "../assets/hero/hero_food_bowl.jpg";
import heroTomatoSlice from "../assets/hero/hero_tomato_slice.jpg";
import heroBasilLeaves from "../assets/hero/hero_basil_leaves.jpg";
import tomatoSlices from "../assets/tomato_slices.jpg";

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
      <div className="relative min-h-screen w-full bg-[#061d19] text-white flex flex-col justify-between overflow-x-hidden select-none selection:bg-orange-500 selection:text-white">
        
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Right Geometric Diagonal Accent */}
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

        {/* Floating Food Elements (Garnishes) */}
        {/* Sliced Tomato (Top of Food Bowl) */}
        <div
          className="absolute top-12 right-[42%] sm:right-[38%] lg:right-[35%] z-20 w-12 sm:w-16 h-12 sm:h-16 rounded-full overflow-hidden shadow-2xl shadow-black/80 pointer-events-none"
          style={{ transform: "rotate(-10deg)" }}
        >
          <img
            src={heroTomatoSlice}
            alt="Fresh tomato slice"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Green Basil Leaf (Mid Left of Bowl) */}
        <div className="absolute top-1/2 right-[48%] sm:right-[44%] lg:right-[40%] z-20 w-8 sm:w-11 h-8 sm:h-11 rounded-full overflow-hidden shadow-lg shadow-black/60 pointer-events-none -rotate-45">
          <img
            src={heroBasilLeaves}
            alt="Basil leaf"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Sliced Tomato (Bottom Left of Bowl) */}
        <div
          className="absolute bottom-16 right-[44%] sm:right-[40%] lg:right-[36%] z-20 w-11 sm:w-14 h-11 sm:h-14 rounded-full overflow-hidden shadow-xl shadow-black/80 pointer-events-none"
          style={{ transform: "rotate(25deg)" }}
        >
          <img
            src={tomatoSlices}
            alt="Tomato slice"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Green Basil Leaf (Bottom Right of Canvas) */}
        <div className="absolute bottom-12 right-10 sm:right-16 z-20 w-9 sm:w-12 h-9 sm:h-12 rounded-full overflow-hidden shadow-lg shadow-black/60 pointer-events-none rotate-[40deg]">
          <img
            src={heroBasilLeaves}
            alt="Basil leaf"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Green Basil Leaf (Top Right of Canvas) */}
        <div className="absolute top-14 right-10 sm:right-20 z-20 w-8 sm:w-10 h-8 sm:h-10 rounded-full overflow-hidden shadow-lg shadow-black/60 pointer-events-none -rotate-12">
          <img
            src={heroBasilLeaves}
            alt="Basil leaf"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Tiny Seasoning & Herb Specks */}
        <div className="absolute top-1/3 right-[45%] w-2 h-2 rounded-full bg-amber-400/80 blur-[0.5px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-[42%] w-2.5 h-2.5 rounded-full bg-emerald-400/70 blur-[0.5px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-orange-400/80 blur-[0.5px] pointer-events-none" />

        {/* Main Content Area */}
        <div className="relative z-20 flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          
          {/* Top Brand Header */}
          <header className="flex justify-start items-center pt-2 pb-4 sm:pb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-2xl sm:text-3xl font-black text-[#ea580c] tracking-tight hover:opacity-95 transition group"
            >
              <span className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 group-hover:scale-105 transition-transform duration-300">
                <IoFastFoodOutline className="text-2xl sm:text-3xl" />
              </span>
              <span className="text-white group-hover:text-orange-400 transition-colors">
                Cravings
              </span>
            </Link>
          </header>

          {/* Split-Screen 2-Column Section */}
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center my-auto py-4">
            
            {/* Left Column: Compact Modern Login Card */}
            <div className="lg:col-span-5 flex justify-start w-full">
              <div className="w-full max-w-md bg-[#072420]/85 backdrop-blur-xl border border-teal-800/50 rounded-3xl p-7 sm:p-9 shadow-[0_15px_35px_rgba(0,0,0,0.5),0_0_30px_rgba(234,88,12,0.08)] transition-all duration-300">
                
                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#ea580c] text-center mb-1.5 tracking-tight">
                  Welcome Back
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-[#8faea7] text-center mb-7">
                  Login to your Cravings account
                </p>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#c8ded8] mb-1.5">
                      Email
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-[#739b92] pointer-events-none">
                        <IoMailOutline className="text-lg" />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        name="email"
                        onChange={handleInputChange}
                        className={`w-full bg-[#041916]/90 border ${
                          errors.email ? "border-red-500" : "border-teal-800/60"
                        } rounded-xl pl-10 pr-3.5 py-2.5 sm:py-3 text-sm text-white placeholder-[#537770] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200`}
                      />
                    </div>
                    {errors.email && (
                      <span className="text-red-400 text-xs mt-1 block">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#c8ded8] mb-1.5">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-[#739b92] pointer-events-none">
                        <IoLockClosedOutline className="text-lg" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        name="password"
                        onChange={handleInputChange}
                        className={`w-full bg-[#041916]/90 border ${
                          errors.password
                            ? "border-red-500"
                            : "border-teal-800/60"
                        } rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-sm text-white placeholder-[#537770] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200`}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 text-[#739b92] hover:text-white transition-colors cursor-pointer p-1"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-red-400 text-xs mt-1 block">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password Row */}
                  <div className="flex justify-between items-center text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[#9abeb6] hover:text-white transition-colors select-none">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-teal-700 bg-[#041916] accent-[#ea580c] cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[#ea580c] hover:text-orange-400 hover:underline transition-colors font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 sm:py-3.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>

                  {/* Register Prompt */}
                  <div className="text-center text-xs text-[#87aba2] pt-2">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/register"
                      className="text-[#ea580c] font-bold hover:underline ml-1"
                    >
                      Register here
                    </Link>
                  </div>
                </form>

              </div>
            </div>

            {/* Right Column: Large Food Visual Showcase */}
            <div className="lg:col-span-7 relative flex items-center justify-center py-6 sm:py-10">
              
              {/* Outer Glow behind dish */}
              <div className="absolute w-72 sm:w-96 lg:w-[480px] aspect-square rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

              {/* Main Food Bowl */}
              <div className="relative z-10 w-72 sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px] aspect-square rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.8)] border-4 sm:border-8 border-stone-900/80 overflow-hidden group">
                <img
                  src={heroFoodBowl}
                  alt="Delicious gourmet food bowl"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Floating 20% OFF FIRST ORDER Badge */}
              <div className="absolute top-1/4 right-0 sm:right-4 lg:right-2 xl:right-6 z-30 w-22 sm:w-26 md:w-28 aspect-square rounded-full bg-[#ea580c] text-white shadow-2xl shadow-orange-950/60 flex flex-col items-center justify-center p-2 text-center border-2 border-orange-300/40 select-none hover:scale-105 transition-transform duration-300">
                <span className="text-xl sm:text-2xl font-black leading-none tracking-tight">20%</span>
                <span className="text-[10px] sm:text-xs font-extrabold tracking-widest uppercase mt-0.5">OFF</span>
                <span className="text-[8px] sm:text-[9px] font-bold opacity-90 tracking-wider mt-0.5">FIRST ORDER</span>
              </div>

            </div>

          </main>

          {/* Footer Spacer / Copyright */}
          <footer className="pt-4 pb-2 text-center text-[11px] sm:text-xs text-[#5a7d76]">
            &copy; {new Date().getFullYear()} Cravings. All rights reserved.
          </footer>

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


