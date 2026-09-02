import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import NoDataFound from "../components/NoDataFound";
import defaultRestaurantImage from "../assets/Samplerestaurant.jpg";
import orderNowAmbience from "../assets/hero/order_now_ambience.jpg";
import heroTomatoSlice from "../assets/hero/hero_tomato_slice.jpg";
import heroCherryTomato from "../assets/hero/hero_cherry_tomato.jpg";
import heroBasilLeaves from "../assets/hero/hero_basil_leaves.jpg";
import {
  IoSearch,
  IoLocationOutline,
  IoTimeOutline,
  IoStar,
  IoStorefrontOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { FaLeaf, FaDrumstickBite } from "react-icons/fa";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { TbToolsKitchen2 } from "react-icons/tb";

const RESTAURANT_TYPES = [
  { value: "all", label: "All" },
  { value: "veg", label: "Veg", icon: <FaLeaf className="text-emerald-400" /> },
  {
    value: "non-veg",
    label: "Non-Veg",
    icon: <FaDrumstickBite className="text-red-400" />,
  },
  {
    value: "vegan",
    label: "Vegan",
    icon: <FaLeaf className="text-emerald-500" />,
  },
  {
    value: "jain",
    label: "Jain",
    icon: <FaLeaf className="text-amber-400" />,
  },
  {
    value: "both",
    label: "Veg & Non-Veg",
    icon: <MdOutlineRestaurantMenu className="text-purple-400" />,
  },
];

const typeLabels = {
  veg: "Veg",
  "non-veg": "Non-Veg",
  vegan: "Vegan",
  jain: "Jain",
  both: "Veg & Non-Veg",
};

const OrderNow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("cuisine") || "";

  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState("all");
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRestaurants = async () => {
      try {
        const response = await api.get("/public/restaurants");
        if (isMounted) {
          setRestaurants(response.data.data);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Unknown error occurred during fetching restaurants. Please try again.",
          );
          setIsLoading(false);
        }
      }
    };
    fetchRestaurants();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.restaurantName?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.cuisineTypes?.some((c) => c.toLowerCase().includes(q));
      const matchType =
        selectedType === "all" || r.restaurantType === selectedType;
      const matchOpen = !showOpenOnly || r.isOpen;
      return matchSearch && matchType && matchOpen;
    });
  }, [restaurants, searchQuery, selectedType, showOpenOnly]);

  if (isLoading) return <Loader height="100vh" width="100%" />;

  return (
    <div className="min-h-screen bg-[#092723] text-white">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#092723] text-white pt-8 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 border-b border-teal-950/40">
        {/* Soft Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Heading, Search & Category Filters */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#ea580c] text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
                <TbToolsKitchen2 className="text-sm" />
                <span>CRAVINGS — ORDER NOW</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-black text-white tracking-tight leading-[1.1] mb-3">
                Order your <br className="hidden sm:inline" />
                <span className="text-[#ea580c]">favourites now!</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-[#a5c7be] leading-relaxed max-w-lg mb-6 sm:mb-8 font-normal">
                From local gems to popular favourites, we bring it all to you.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="w-full max-w-xl relative flex items-center bg-white rounded-full p-1.5 sm:p-2 shadow-2xl shadow-black/40 mb-6 focus-within:ring-4 focus-within:ring-orange-500/30 transition-all duration-300"
              >
                <IoSearch className="text-xl text-stone-400 ml-3 sm:ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name, cuisine or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-stone-800 placeholder-stone-400 focus:outline-none font-medium min-w-0"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white font-bold text-xs sm:text-sm md:text-base px-5 sm:px-7 py-2 sm:py-2.5 rounded-full shadow-md shadow-orange-600/30 transition-all duration-200 cursor-pointer"
                >
                  Find food
                </button>
              </form>

              {/* Filter Pills Bar */}
              <div className="w-full flex flex-wrap items-center gap-2 sm:gap-2.5">
                {RESTAURANT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-1.5 text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-200 font-bold cursor-pointer select-none ${
                      selectedType === type.value
                        ? "bg-[#ea580c] text-white border-[#ea580c] shadow-lg shadow-orange-950/30 scale-105"
                        : "bg-[#07221e]/90 text-[#c2dfd8] border-teal-800/60 hover:border-orange-500 hover:text-white"
                    }`}
                  >
                    {type.icon}
                    <span>{type.label}</span>
                  </button>
                ))}

                {/* Open Now Toggle Pill */}
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#07221e]/90 border border-teal-800/60 text-[#c2dfd8] hover:border-orange-500 cursor-pointer transition select-none">
                  <input
                    type="checkbox"
                    checked={showOpenOnly}
                    onChange={(e) => setShowOpenOnly(e.target.checked)}
                    className="accent-[#ea580c] w-3.5 h-3.5"
                  />
                  <span>Open Now</span>
                </label>

                {/* Restaurant Count */}
                <span className="text-xs text-[#8faea7] font-semibold py-1.5 px-2">
                  {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Right Column: Curved Orange Backdrop + Restaurant Visual */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0">
              {/* Floating Sliced Tomatoes & Leaves Garnish */}
              <div className="absolute -top-4 sm:-top-6 left-6 z-20 w-9 sm:w-11 aspect-square rounded-full overflow-hidden shadow-lg rotate-[-15deg] pointer-events-none select-none">
                <img src={heroTomatoSlice} alt="garnish" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-1/2 -right-4 sm:-right-6 z-20 w-10 sm:w-12 aspect-square rounded-full overflow-hidden shadow-lg rotate-[25deg] pointer-events-none select-none">
                <img src={heroCherryTomato} alt="garnish" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 left-12 z-20 w-8 sm:w-10 aspect-square rounded-full overflow-hidden shadow-md rotate-[40deg] pointer-events-none select-none">
                <img src={heroBasilLeaves} alt="garnish" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 right-1/4 z-20 w-9 sm:w-11 aspect-square rounded-full overflow-hidden shadow-md rotate-[-30deg] pointer-events-none select-none">
                <img src={heroBasilLeaves} alt="garnish" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-8 right-6 text-amber-300 text-sm select-none pointer-events-none animate-pulse">✦</div>
              <div className="absolute bottom-16 -left-2 text-amber-300 text-base select-none pointer-events-none animate-pulse">✦</div>

              {/* Curved Orange Container */}
              <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] aspect-[4/3] sm:aspect-square rounded-[36px] sm:rounded-[48px] bg-gradient-to-tr from-[#ea580c] via-[#f26522] to-amber-500 p-2.5 sm:p-3 shadow-2xl shadow-orange-950/60 overflow-hidden group">
                <div className="w-full h-full rounded-[30px] sm:rounded-[40px] overflow-hidden relative">
                  <img
                    src={orderNowAmbience}
                    alt="Restaurant Atmosphere"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Restaurants Listing Grid ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-24">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              All <span className="text-[#ea580c]">Restaurants</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8faea7] mt-1 font-medium">
              Explore gourmet dishes and local favorites available for fast delivery.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs bg-[#07221e]/90 text-[#a5c7be] px-3.5 py-1.5 rounded-full border border-teal-800/60 font-semibold shadow-xs">
              <IoStorefrontOutline className="text-[#ea580c]" />
              {filteredRestaurants.length} Restaurants
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-[#07221e]/90 text-[#a5c7be] px-3.5 py-1.5 rounded-full border border-teal-800/60 font-semibold shadow-xs">
              <IoCheckmarkCircleOutline className="text-emerald-400" />
              {restaurants.filter((r) => r.isOpen).length} Open Now
            </span>
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                onClick={() =>
                  navigate(`/restaurant-details/${restaurant._id}`)
                }
                className="bg-[#07221e]/90 backdrop-blur-md rounded-3xl overflow-hidden border border-teal-800/40 shadow-xl hover:border-orange-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row"
              >
                {/* Cover Image Area */}
                <div className="relative w-full sm:w-52 md:w-60 lg:w-64 h-48 sm:h-auto min-h-[180px] overflow-hidden bg-teal-950/60 shrink-0">
                  <img
                    src={
                      restaurant?.coverImage?.url || defaultRestaurantImage
                    }
                    alt={restaurant.restaurantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:hidden" />

                  {/* Open / Closed Status Badge */}
                  <span
                    className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md ${
                      restaurant.isOpen
                        ? "bg-emerald-500 text-white"
                        : "bg-black/70 backdrop-blur-sm text-stone-200 border border-white/10"
                    }`}
                  >
                    {restaurant.isOpen ? "● Open" : "● Closed"}
                  </span>

                  {/* Restaurant Diet Type Badge */}
                  {restaurant.restaurantType && (
                    <span
                      className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 uppercase tracking-wider"
                    >
                      {typeLabels[restaurant.restaurantType] ||
                        restaurant.restaurantType}
                    </span>
                  )}
                </div>

                {/* Card Body Area */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Name & Rating Header */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-[#ea580c] transition-colors line-clamp-1">
                        {restaurant.restaurantName}
                      </h3>

                      {restaurant.averageRating > 0 ? (
                        <span className="flex items-center gap-1 bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-black px-2 py-0.5 rounded-full shrink-0">
                          <IoStar className="text-amber-400 text-xs" />
                          {restaurant.averageRating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-amber-400/10 text-amber-400/80 border border-amber-400/20 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          <IoStar className="text-amber-400/80 text-xs" />
                          New
                        </span>
                      )}
                    </div>

                    {/* Restaurant Description */}
                    <p className="text-xs text-[#8faea7] line-clamp-2 mb-3 leading-relaxed font-normal">
                      {restaurant.description || "Fresh and delicious food prepared with high quality ingredients."}
                    </p>

                    {/* Cuisine Types */}
                    {restaurant.cuisineTypes?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {restaurant.cuisineTypes.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="text-[10px] px-2.5 py-0.5 bg-[#092723] text-[#a5c7be] rounded-full border border-teal-800/60 font-medium"
                          >
                            {c}
                          </span>
                        ))}
                        {restaurant.cuisineTypes.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 bg-[#092723] text-[#8faea7] rounded-full border border-teal-800/60 font-medium">
                            +{restaurant.cuisineTypes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs text-[#8faea7] border-t border-teal-900/60 pt-3 gap-2 font-medium">
                    {(restaurant.city || restaurant.address) && (
                      <span className="flex items-center gap-1.5 truncate max-w-[55%]">
                        <IoLocationOutline className="text-[#ea580c] text-sm shrink-0" />
                        <span className="truncate">{restaurant.city || restaurant.address}</span>
                      </span>
                    )}
                    {restaurant.servingHours?.openingTime ? (
                      <span className="flex items-center gap-1.5 shrink-0">
                        <IoTimeOutline className="text-[#ea580c] text-sm shrink-0" />
                        <span>
                          {restaurant.servingHours.openingTime} –{" "}
                          {restaurant.servingHours.closingTime}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 shrink-0">
                        <IoTimeOutline className="text-[#ea580c] text-sm shrink-0" />
                        <span>Fast Delivery</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoDataFound
            height="60vh"
            width="100%"
            text="No Restaurants Found"
          />
        )}
      </section>
    </div>
  );
};

export default OrderNow;
