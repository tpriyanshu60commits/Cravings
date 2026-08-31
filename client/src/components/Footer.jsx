import { useLocation, Link } from "react-router-dom";
import { IoFastFoodOutline } from "react-icons/io5";

const Footer = () => {
  const location = useLocation().pathname;
  const currentYear = new Date().getFullYear();

  // Hide on dashboard views
  if (location.toLowerCase().includes("dashboard")) return null;

  return (
    <footer className="bg-(--color-base-100) border-t border-(--color-base-300) py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-black text-(--color-primary)">
            <IoFastFoodOutline className="text-2xl" />
            <span>Cravings</span>
          </Link>
          <p className="text-xs text-(--color-secondary) leading-relaxed">
            Delivering your favorite dishes from top local restaurants right to your doorstep with speed and love.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-base-content)">
            Quick Links
          </h4>
          <ul className="space-y-1.5 text-xs text-(--color-secondary)">
            <li>
              <Link to="/" className="hover:text-(--color-primary) transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/order-now" className="hover:text-(--color-primary) transition">
                Order Now
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-(--color-primary) transition">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Partner with Us */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-base-content)">
            Partner With Us
          </h4>
          <ul className="space-y-1.5 text-xs text-(--color-secondary)">
            <li>
              <Link to="/register" className="hover:text-(--color-primary) transition">
                Restaurant Partner Signup
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-(--color-primary) transition">
                Rider Partner Signup
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-base-content)">
            Legal & Support
          </h4>
          <p className="text-xs text-(--color-secondary)">
            Support: support@cravings.com
          </p>
          <p className="text-xs text-(--color-secondary)">
            Available 24/7 for customer care.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-(--color-base-300) mt-8 pt-6 text-center text-xs text-(--color-secondary)">
        © {currentYear} Cravings Food Technologies Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
