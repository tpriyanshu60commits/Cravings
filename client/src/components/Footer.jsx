import { useLocation, Link } from "react-router-dom";
import { IoFastFoodOutline } from "react-icons/io5";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import heroTomatoSlice from "../assets/hero/hero_tomato_slice.jpg";
import heroBasilLeaves from "../assets/hero/hero_basil_leaves.jpg";

const Footer = () => {
  const location = useLocation().pathname;
  const currentYear = new Date().getFullYear();

  // Hide on dashboard views
  if (location.toLowerCase().includes("dashboard")) return null;

  return (
    <footer className="relative overflow-hidden bg-[#061e1b] text-white border-t border-teal-900/50 pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Garnish at Bottom Right */}
      <div className="absolute bottom-6 right-6 lg:right-10 z-0 pointer-events-none hidden md:block select-none opacity-85">
        <div className="relative">
          <div className="w-10 sm:w-12 aspect-square rounded-full overflow-hidden shadow-lg rotate-[15deg]">
            <img src={heroTomatoSlice} alt="garnish" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -left-3 w-8 aspect-square rounded-full overflow-hidden shadow-md rotate-[-30deg]">
            <img src={heroBasilLeaves} alt="garnish" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-2 -left-5 w-1.5 h-1.5 rounded-full bg-amber-600/80" />
          <div className="absolute -top-2 left-2 w-2 h-2 rounded-full bg-red-500/80" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 relative z-10">
        {/* Brand & Socials Column */}
        <div className="lg:col-span-4 space-y-4">
          <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-black text-[#ea580c] tracking-tight hover:opacity-95 transition">
            <IoFastFoodOutline className="text-2xl sm:text-3xl" />
            <span>Cravings</span>
          </Link>
          <p className="text-xs sm:text-sm text-[#8faea7] leading-relaxed max-w-sm font-normal">
            Delivering your favorite dishes from top local restaurants right to your doorstep with speed and love.
          </p>

          {/* Social Media Links */}
          <div className="flex items-center gap-2.5 pt-2">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-full bg-[#0d332e] border border-teal-800/60 hover:bg-[#ea580c] hover:border-[#ea580c] text-[#c2dfd8] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              aria-label="Facebook"
            >
              <FaFacebookF className="text-xs" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-full bg-[#0d332e] border border-teal-800/60 hover:bg-[#ea580c] hover:border-[#ea580c] text-[#c2dfd8] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              aria-label="Instagram"
            >
              <FaInstagram className="text-sm" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-full bg-[#0d332e] border border-teal-800/60 hover:bg-[#ea580c] hover:border-[#ea580c] text-[#c2dfd8] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              aria-label="Twitter"
            >
              <FaTwitter className="text-xs" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-full bg-[#0d332e] border border-teal-800/60 hover:bg-[#ea580c] hover:border-[#ea580c] text-[#c2dfd8] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              aria-label="YouTube"
            >
              <FaYoutube className="text-xs" />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="lg:col-span-2 sm:col-span-1 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            QUICK LINKS
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#8faea7]">
            <li>
              <Link to="/" className="hover:text-[#ea580c] transition-colors inline-block">
                Home
              </Link>
            </li>
            <li>
              <Link to="/order-now" className="hover:text-[#ea580c] transition-colors inline-block">
                Order Now
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#ea580c] transition-colors inline-block">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Partner With Us Column */}
        <div className="lg:col-span-3 sm:col-span-1 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            PARTNER WITH US
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#8faea7]">
            <li>
              <Link to="/register" className="hover:text-[#ea580c] transition-colors inline-block">
                Restaurant Partner
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-[#ea580c] transition-colors inline-block">
                Delivery Partner
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Support Column */}
        <div className="lg:col-span-3 sm:col-span-1 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            LEGAL & SUPPORT
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#8faea7]">
            <li>
              <span className="hover:text-[#ea580c] transition-colors cursor-pointer inline-block">
                Terms & Conditions
              </span>
            </li>
            <li>
              <span className="hover:text-[#ea580c] transition-colors cursor-pointer inline-block">
                Privacy Policy
              </span>
            </li>
            <li>
              <span className="hover:text-[#ea580c] transition-colors cursor-pointer inline-block">
                Refund Policy
              </span>
            </li>
            <li>
              <span className="hover:text-[#ea580c] transition-colors cursor-pointer inline-block">
                Help & Support
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Area */}
      <div className="max-w-7xl mx-auto border-t border-teal-900/50 mt-10 sm:mt-14 pt-6 text-center text-xs text-[#6b9189] relative z-10">
        © {currentYear} Cravings Food Technologies Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

