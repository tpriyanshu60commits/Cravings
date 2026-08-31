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
    <nav className="sticky top-0 z-40 bg-(--color-base-100) border-b border-(--color-base-300) shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-(--color-primary)">
          <IoFastFoodOutline className="text-2xl" />
          <span>Cravings</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors ${
              isActive("/")
                ? "text-(--color-primary) font-semibold"
                : "text-(--color-base-content) hover:text-(--color-primary)"
            }`}
          >
            Home
          </Link>
          <Link
            to="/order-now"
            className={`transition-colors ${
              isActive("/order-now")
                ? "text-(--color-primary) font-semibold"
                : "text-(--color-base-content) hover:text-(--color-primary)"
            }`}
          >
            Order Now
          </Link>
          <Link
            to="/contact"
            className={`transition-colors ${
              isActive("/contact")
                ? "text-(--color-primary) font-semibold"
                : "text-(--color-base-content) hover:text-(--color-primary)"
            }`}
          >
            Contact
          </Link>
        </div>

        {/* Right Section: Cart + Auth Buttons */}
        <div className="flex items-center gap-3">
          {/* Cart Icon (accessible to customer or guest) */}
          <Link
            to="/cart"
            className="relative p-2 rounded-full hover:bg-(--color-base-200) text-(--color-base-content) transition"
            title="Cart"
          >
            <IoCartOutline className="text-2xl" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-(--color-primary) text-(--color-primary-content) text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {isLogin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDashboardNavigate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--color-base-200) hover:bg-(--color-base-300) text-xs font-semibold text-(--color-base-content) transition"
              >
                <MdOutlineDashboard className="text-base text-(--color-primary)" />
                <span className="capitalize">{role || "Dashboard"}</span>
              </button>

              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-(--color-base-300) hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold transition"
                title="Logout"
              >
                <MdLogout className="text-sm" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-(--color-base-content) hover:bg-(--color-base-200) transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-(--color-primary) text-(--color-primary-content) hover:opacity-90 transition"
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
