import {
  FaLeaf,
  FaDrumstickBite,
  FaInstagram,
  FaFacebookSquare,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { IoGlobeOutline } from "react-icons/io5";

export const foodTypeDot = (foodType) => {
  if (!foodType) return "bg-gray-400";
  const ft = foodType.toLowerCase();
  if (ft.includes("non")) return "bg-red-500";
  if (ft.includes("veg") || ft.includes("vegan")) return "bg-emerald-500";
  return "bg-amber-500";
};

export const restaurantTypeLabel = (type) => {
  const map = {
    veg: {
      label: "Pure Veg",
      color: "text-emerald-400 bg-emerald-950/60 border border-emerald-500/30",
      icon: <FaLeaf className="text-emerald-400" />,
    },
    "non-veg": {
      label: "Non-Veg",
      color: "text-red-400 bg-red-950/60 border border-red-500/30",
      icon: <FaDrumstickBite className="text-red-400" />,
    },
    vegan: {
      label: "Vegan",
      color: "text-emerald-400 bg-emerald-950/60 border border-emerald-500/30",
      icon: <FaLeaf className="text-emerald-400" />,
    },
    jain: {
      label: "Jain",
      color: "text-amber-400 bg-amber-950/60 border border-amber-500/30",
      icon: <FaLeaf className="text-amber-400" />,
    },
    both: {
      label: "Veg & Non-Veg",
      color: "text-purple-400 bg-purple-950/60 border border-purple-500/30",
      icon: <MdOutlineRestaurantMenu className="text-purple-400" />,
    },
  };
  return (
    map[type] || {
      label: type,
      color: "text-stone-300 bg-stone-800/60 border border-stone-700/40",
      icon: null,
    }
  );
};

export const platformIcon = (platform) => {
  const p = platform?.toLowerCase() || "";
  if (p.includes("instagram")) return <FaInstagram className="text-pink-400" />;
  if (p.includes("facebook"))
    return <FaFacebookSquare className="text-blue-400" />;
  if (p.includes("twitter") || p.includes("x"))
    return <FaXTwitter className="text-white" />;
  if (p.includes("youtube")) return <FaYoutube className="text-red-400" />;
  if (p.includes("whatsapp")) return <FaWhatsapp className="text-emerald-400" />;
  return <IoGlobeOutline className="text-stone-400" />;
};
