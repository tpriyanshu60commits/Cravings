import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { IoCartOutline, IoFastFoodOutline, IoMenu, IoClose } from "react-icons/io5";
import { MdOutlineDashboard, MdLogout } from "react-icons/md";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isLogin, role, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDashboardNavigate = () => {
    setIsMenuOpen(false);
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
    setIsMenuOpen(false);
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#07221e]/95 backdrop-blur-md border-b border-teal-900/30 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-1.5 sm:gap-2 text-xl sm:text-2xl font-black text-[#ea580c] tracking-tight hover:opacity-95 transition shrink-0"
        >
          <IoFastFoodOutline className="text-2xl sm:text-3xl" />
          <span>Cravings</span>
        </Link>

        {/* Desktop Navigation Links (Center) */}
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

        {/* Right Section: Cart + Permanently Visible Auth Buttons + Mobile Hamburger Icon */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Cart Icon (Always visible) */}
          <Link
            to="/cart"
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-[#d8eae6] hover:text-white transition shrink-0"
            title="Cart"
          >
            <IoCartOutline className="text-xl sm:text-2xl" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#ea580c] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth Buttons (Permanently visible in main header) */}
          {isLogin ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleDashboardNavigate}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-teal-900/70 hover:bg-teal-800/80 border border-teal-700/50 text-[11px] sm:text-xs font-semibold text-emerald-100 transition shadow-xs cursor-pointer"
              >
                <MdOutlineDashboard className="text-sm sm:text-base text-orange-400" />
                <span className="capitalize">{role || "Dashboard"}</span>
              </button>

              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-[11px] sm:text-xs font-semibold text-red-200 transition shadow-xs cursor-pointer"
                title="Logout"
              >
                <MdLogout className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              <Link
                to="/login"
                className="px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#d8eae6] hover:text-white hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white shadow-md shadow-orange-600/30 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#d8eae6] hover:text-white hover:bg-white/10 transition shrink-0 ml-0.5 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <IoClose className="text-2xl text-orange-400" />
            ) : (
              <IoMenu className="text-2xl" />
            )}
          </button>

        </div>
      </div>

      {/* Mobile Dropdown Menu: Contains ONLY Home, Order Now, and Contact */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-teal-900/40 bg-[#07221e]/98 backdrop-blur-md px-4 py-3 shadow-xl transition-all duration-200">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                isActive("/")
                  ? "bg-orange-500/15 text-[#ea580c] border-l-2 border-[#ea580c]"
                  : "text-[#c2dfd8] hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Home</span>
            </Link>

            <Link
              to="/order-now"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                isActive("/order-now")
                  ? "bg-orange-500/15 text-[#ea580c] border-l-2 border-[#ea580c]"
                  : "text-[#c2dfd8] hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Order Now</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                isActive("/contact")
                  ? "bg-orange-500/15 text-[#ea580c] border-l-2 border-[#ea580c]"
                  : "text-[#c2dfd8] hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Contact</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

