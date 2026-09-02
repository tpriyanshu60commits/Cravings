import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { IoCartOutline, IoFastFoodOutline } from "react-icons/io5";
import { MdOutlineDashboard, MdLogout } from "react-icons/md";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isLogin, role, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardNavigate = () => {
    if (role === "restaurant") {
      navigate("/restaurant-dashboard");
    } else if (role === "rider") {
      navigate("/rider-dashboard");
    } else if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#07221e]/95 backdrop-blur-md border-b border-teal-900/30 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-black text-[#ea580c] tracking-tight hover:opacity-95 transition">
          <IoFastFoodOutline className="text-2xl sm:text-3xl" />
          <span>Cravings</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors py-1 ${
              isActive("/")
                ? "text-[#ea580c] font-bold relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-[#ea580c] after:rounded-full"
                : "text-[#c2dfd8] hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/order-now"
            className={`transition-colors py-1 ${
              isActive("/order-now")
                ? "text-[#ea580c] font-bold relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-[#ea580c] after:rounded-full"
                : "text-[#c2dfd8] hover:text-white"
            }`}
          >
            Order Now
          </Link>
          <Link
            to="/contact"
            className={`transition-colors py-1 ${
              isActive("/contact")
                ? "text-[#ea580c] font-bold relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-[#ea580c] after:rounded-full"
                : "text-[#c2dfd8] hover:text-white"
            }`}
          >
            Contact
          </Link>
        </div>

        {/* Right Section: Cart + Auth Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Icon (accessible to customer or guest) */}
          <Link
            to="/cart"
            className="relative p-2 rounded-full hover:bg-white/10 text-[#d8eae6] hover:text-white transition"
            title="Cart"
          >
            <IoCartOutline className="text-2xl" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#ea580c] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </Link>

          {isLogin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDashboardNavigate}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-900/70 hover:bg-teal-800/80 border border-teal-700/50 text-xs font-semibold text-emerald-100 transition shadow-xs cursor-pointer"
              >
                <MdOutlineDashboard className="text-base text-orange-400" />
                <span className="capitalize">{role || "Dashboard"}</span>
              </button>

              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-semibold text-red-200 transition shadow-xs cursor-pointer"
                title="Logout"
              >
                <MdLogout className="text-sm" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#d8eae6] hover:text-white hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white shadow-md shadow-orange-600/30 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
