import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/ApiConfig";
import defaultRestaurantImage from "../assets/Samplerestaurant.jpg";
import heroFoodBowl from "../assets/hero/hero_food_bowl.jpg";
import heroCherryTomato from "../assets/hero/hero_cherry_tomato.jpg";
import heroBasilLeaves from "../assets/hero/hero_basil_leaves.jpg";
import heroTomatoSlice from "../assets/hero/hero_tomato_slice.jpg";
import dealsBurgerFries from "../assets/hero/deals_burger_fries.jpg";
import avatar1 from "../assets/hero/avatar1.jpg";
import avatar2 from "../assets/hero/avatar2.jpg";
import avatar3 from "../assets/hero/avatar3.jpg";
import avatar4 from "../assets/hero/avatar4.jpg";
import {
  IoSearch,
  IoLocationOutline,
  IoTimeOutline,
  IoStar,
  IoHeart,
  IoHeartOutline,
  IoStorefrontOutline,
  IoShieldCheckmarkOutline,
  IoReceiptOutline,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import { FaUtensils, FaLeaf, FaDrumstickBite } from "react-icons/fa";
import { MdOutlineRestaurantMenu, MdOutlineVerified } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import Loader from "../components/Loader";

const CUISINES = [
  { name: "North Indian", icon: <FaUtensils /> },
  { name: "South Indian", icon: <FaLeaf /> },
  { name: "Chinese", icon: <MdOutlineRestaurantMenu /> },
  { name: "Fast Food", icon: <FaDrumstickBite /> },
  { name: "Desserts", icon: <FaUtensils /> },
];

const WHY_CHOOSE_US = [
  {
    title: "Easy Ordering",
    description: "Quick and hassle-free ordering in just a few clicks.",
    icon: <IoReceiptOutline className="text-2xl text-[#ea580c]" />,
  },
  {
    title: "Fast Delivery",
    description: "On-time delivery to your doorstep, every time.",
    icon: <TbTruckDelivery className="text-2xl text-[#ea580c]" />,
  },
  {
    title: "Secure Payment",
    description: "100% secure & safe payments. Your safety is our priority.",
    icon: <IoShieldCheckmarkOutline className="text-2xl text-[#ea580c]" />,
  },
  {
    title: "Best Quality",
    description: "Fresh ingredients and quality food guaranteed.",
    icon: <MdOutlineVerified className="text-2xl text-[#ea580c]" />,
  },
];

const TESTIMONIALS = [
  {
    name: "Rahul Sharma",
    avatar: avatar2,
    rating: 5,
    review: "Amazing food and super fast delivery! Highly recommended!",
  },
  {
    name: "Priya Mehta",
    avatar: avatar3,
    rating: 5,
    review: "Great variety and fresh food every time. Love ordering from Cravings!",
  },
  {
    name: "Ankit Verma",
    avatar: avatar4,
    rating: 5,
    review: "Best restaurant service in town. Keep it up!",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [likedRestaurants, setLikedRestaurants] = useState({});

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedRestaurants((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/public/restaurants");
        setRestaurants(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch restaurants for home:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/order-now?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/order-now");
    }
  };

  return (
    <div className="min-h-screen bg-[#092723] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#092723] text-white pt-8 sm:pt-12 lg:pt-16 pb-14 sm:pb-20 lg:pb-24 border-b border-teal-950/40">
        {/* Soft decorative background glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-teal-800/10 rounded-full blur-3xl pointer-events-none" />

        {/* Orange Geometric Diagonal Accent on Right Side */}
        <div
          className="hidden md:block absolute right-0 top-0 bottom-0 w-2/5 lg:w-[46%] xl:w-[44%] bg-[#ea580c] pointer-events-none z-0"
          style={{
            clipPath: "polygon(48% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        />
        <div
          className="md:hidden absolute right-0 top-1/2 bottom-0 w-3/4 bg-[#ea580c] pointer-events-none z-0 opacity-90"
          style={{
            clipPath: "polygon(55% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Hero Content & Search */}
            <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#051c19]/80 border border-teal-700/50 shadow-inner mb-4 sm:mb-6">
                <span className="text-[11px] sm:text-xs font-black tracking-widest text-[#ea580c] uppercase">
                  CRAVINGS — ORDER NOW
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-[4.2rem] xl:text-[4.75rem] font-black text-white tracking-tight leading-[1.08] mb-4 sm:mb-5">
                Good food,<br />
                <span className="text-[#ea580c]">great mood.</span>
              </h1>

              {/* Description */}
              <p className="text-[#a5c7be] text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed mb-8 sm:mb-9 font-normal">
                Discover the best restaurants around you and get your food delivered hot &amp; fresh.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="w-full max-w-xl relative flex items-center bg-white rounded-full p-1.5 sm:p-2 shadow-2xl shadow-black/40 mb-8 sm:mb-10 focus-within:ring-4 focus-within:ring-orange-500/30 transition-all duration-300"
              >
                <div className="pl-3.5 sm:pl-4 text-stone-400">
                  <IoSearch className="text-lg sm:text-xl text-stone-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-stone-800 placeholder-stone-400 focus:outline-none font-medium min-w-0"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white font-bold text-xs sm:text-sm md:text-base px-5 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-md shadow-orange-600/30 transition-all duration-200 cursor-pointer"
                >
                  Find Food
                </button>
              </form>

              {/* Stat / Feature Badges */}
              <div className="w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                
                {/* Stat 1: 30+ Restaurants */}
                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-[#07221e]/90 backdrop-blur-md rounded-2xl border border-teal-800/40 shadow-sm hover:border-teal-600/60 transition-all duration-200">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                    <IoStorefrontOutline className="text-base" />
                  </div>
                  <div className="leading-tight min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white">30+</div>
                    <div className="text-[10px] sm:text-[11px] text-[#8faea7] font-medium truncate">Restaurants</div>
                  </div>
                </div>

                {/* Stat 2: Fast Delivery */}
                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-[#07221e]/90 backdrop-blur-md rounded-2xl border border-teal-800/40 shadow-sm hover:border-teal-600/60 transition-all duration-200">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                    <TbTruckDelivery className="text-lg" />
                  </div>
                  <div className="leading-tight min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white">Fast</div>
                    <div className="text-[10px] sm:text-[11px] text-[#8faea7] font-medium truncate">Delivery</div>
                  </div>
                </div>

                {/* Stat 3: 100% Fresh Food */}
                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-[#07221e]/90 backdrop-blur-md rounded-2xl border border-teal-800/40 shadow-sm hover:border-teal-600/60 transition-all duration-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <FaLeaf className="text-xs" />
                  </div>
                  <div className="leading-tight min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white">100%</div>
                    <div className="text-[10px] sm:text-[11px] text-[#8faea7] font-medium truncate">Fresh Food</div>
                  </div>
                </div>

                {/* Stat 4: 4.8 Top Rated */}
                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-[#07221e]/90 backdrop-blur-md rounded-2xl border border-teal-800/40 shadow-sm hover:border-teal-600/60 transition-all duration-200">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <IoStar className="text-sm" />
                  </div>
                  <div className="leading-tight min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-0.5">
                      4.8 <span className="text-amber-400 text-[10px]">★</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#8faea7] font-medium truncate">Top Rated</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Visual Food Showcase & Floating Cards */}
            <div className="lg:col-span-5 relative flex items-center justify-center py-6 sm:py-10 min-h-[360px] sm:min-h-[440px] lg:min-h-[500px] z-10">
              
              {/* Outer Glow behind dish */}
              <div className="absolute w-60 sm:w-80 lg:w-[420px] aspect-square rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

              {/* Center Main Dish */}
              <div className="relative z-10 w-64 sm:w-80 md:w-96 lg:w-[400px] xl:w-[440px] aspect-square rounded-full shadow-2xl shadow-black/60 border-4 border-stone-800/80 overflow-hidden group">
                <img
                  src={heroFoodBowl}
                  alt="Delicious gourmet food bowl"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Floating "20% OFF FIRST ORDER" Circular Badge */}
              <div className="absolute top-1/4 -right-1 sm:right-2 lg:-right-4 z-30 w-24 sm:w-28 md:w-32 aspect-square rounded-full bg-[#ea580c] text-white shadow-2xl shadow-orange-950/50 flex flex-col items-center justify-center p-2 text-center border-2 border-orange-300/30 select-none hover:scale-105 transition-transform duration-300">
                <span className="text-xl sm:text-2xl font-black leading-none tracking-tight">20%</span>
                <span className="text-[10px] sm:text-xs font-extrabold tracking-widest uppercase mt-0.5">OFF</span>
                <span className="text-[8px] sm:text-[9px] font-bold opacity-90 tracking-wider mt-0.5">FIRST ORDER</span>
              </div>

              {/* Floating Customer Rating Card (Bottom Right) */}
              <div className="absolute -bottom-3 sm:-bottom-4 lg:-bottom-6 right-1 sm:right-6 lg:-right-2 z-30 bg-white rounded-2xl sm:rounded-full px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-2xl shadow-black/40 border border-stone-100 flex items-center gap-3 select-none hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center -space-x-2 shrink-0">
                  <img
                    src={avatar1}
                    alt="Customer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover shadow-xs"
                  />
                  <img
                    src={avatar2}
                    alt="Customer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover shadow-xs"
                  />
                  <img
                    src={avatar3}
                    alt="Customer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover shadow-xs"
                  />
                  <img
                    src={avatar4}
                    alt="Customer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover shadow-xs"
                  />
                </div>
                <div className="leading-tight text-left min-w-0">
                  <div className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1">
                    <IoStar className="text-amber-500 text-xs sm:text-sm" /> 4.8
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-stone-500 font-semibold truncate">
                    20k+ reviews
                  </div>
                </div>
              </div>

              {/* Decorative Sliced Cherry Tomato (Top) */}
              <div className="absolute -top-3 sm:-top-4 left-1/4 sm:left-1/5 z-20 w-12 sm:w-16 aspect-square rounded-full overflow-hidden shadow-lg shadow-black/40 pointer-events-none hover:rotate-12 transition-transform">
                <img
                  src={heroCherryTomato}
                  alt="Fresh cherry tomato"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative Sliced Tomato (Bottom Left) */}
              <div className="absolute -bottom-2 left-6 sm:left-10 z-20 w-10 sm:w-14 aspect-square rounded-full overflow-hidden shadow-lg shadow-black/40 pointer-events-none">
                <img
                  src={heroTomatoSlice}
                  alt="Fresh tomato slice"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative Basil Leaves (Left & Right) */}
              <div className="absolute top-1/2 -left-3 sm:-left-5 z-20 w-8 sm:w-12 aspect-square rounded-full overflow-hidden shadow-md shadow-black/30 pointer-events-none rotate-[-20deg]">
                <img
                  src={heroBasilLeaves}
                  alt="Fresh basil leaf"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-12 right-2 sm:right-6 z-10 w-7 sm:w-10 aspect-square rounded-full overflow-hidden shadow-md shadow-black/30 pointer-events-none rotate-[40deg]">
                <img
                  src={heroBasilLeaves}
                  alt="Fresh basil leaf"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Garnish Dots */}
              <div className="absolute top-10 right-4 w-2 h-2 rounded-full bg-emerald-400/80 shadow-xs pointer-events-none" />
              <div className="absolute bottom-6 left-1/3 w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-xs pointer-events-none" />

            </div>

          </div>
        </div>
      </section>

      {/* Popular Cuisines Section */}
      <section className="bg-[#092723] text-white pt-10 sm:pt-14 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">
            Explore <span className="text-[#ea580c]">Popular Cuisines</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
            {CUISINES.map((cuisine) => (
              <Link
                key={cuisine.name}
                to={`/order-now?cuisine=${encodeURIComponent(cuisine.name)}`}
                className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#07221e]/90 border border-teal-800/40 shadow-sm hover:border-orange-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  {cuisine.icon}
                </div>
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ea580c] transition-colors">
                  {cuisine.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="bg-[#092723] text-white py-10 sm:py-16 border-y border-teal-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Featured <span className="text-[#ea580c]">Restaurants</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#a5c7be] mt-1 font-medium">
                Handpicked spots with top ratings and fast delivery
              </p>
            </div>
            <Link
              to="/order-now"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#ea580c] hover:text-orange-400 transition-colors"
            >
              View All ({restaurants.length}) →
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader height="300px" width="100%" />
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16 text-[#8faea7] bg-[#07221e]/80 rounded-3xl border border-teal-800/40">
              <IoStorefrontOutline className="text-5xl mx-auto mb-3 opacity-40 text-orange-400" />
              <p className="text-sm font-medium">No restaurants available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {restaurants.slice(0, 6).map((restaurant) => (
                <div
                  key={restaurant._id}
                  onClick={() => navigate(`/restaurant-details/${restaurant._id}`)}
                  className="bg-[#07221e]/90 backdrop-blur-md rounded-3xl overflow-hidden border border-teal-800/40 shadow-xl hover:border-orange-500/50 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  {/* Cover Image Area */}
                  <div className="relative w-full h-48 sm:h-52 bg-teal-950 overflow-hidden">
                    <img
                      src={restaurant?.coverImage?.url || defaultRestaurantImage}
                      alt={restaurant.restaurantName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#07221e] via-transparent to-black/30" />

                    {/* Open/Closed Status Badge (Top Left) */}
                    <span
                      className={`absolute top-3.5 left-3.5 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md ${
                        restaurant.isOpen
                          ? "bg-emerald-500 text-white"
                          : "bg-stone-900/80 text-stone-300 border border-stone-700/50"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? "bg-white animate-pulse" : "bg-stone-400"}`} />
                      {restaurant.isOpen ? "Open" : "Closed"}
                    </span>

                    {/* Floating Heart / Like Button (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => toggleLike(e, restaurant._id)}
                      className={`absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer ${
                        likedRestaurants[restaurant._id]
                          ? "bg-red-500/90 text-white hover:bg-red-600 scale-105"
                          : "bg-black/40 hover:bg-black/60 text-white/90 hover:text-red-400 backdrop-blur-md border border-white/10"
                      }`}
                      title={likedRestaurants[restaurant._id] ? "Unlike" : "Like"}
                      aria-label="Like restaurant"
                    >
                      {likedRestaurants[restaurant._id] ? (
                        <IoHeart className="text-base" />
                      ) : (
                        <IoHeartOutline className="text-base" />
                      )}
                    </button>

                    {/* Rating Badge (Top Right, beside Like button) */}
                    {restaurant.averageRating > 0 && (
                      <span className="absolute top-3.5 right-13 flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-1 rounded-full shadow-lg backdrop-blur-xs">
                        <IoStar className="text-xs" />
                        {restaurant.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Card Body / Information */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {/* Restaurant Name */}
                      <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-[#ea580c] transition-colors truncate">
                        {restaurant.restaurantName}
                      </h3>

                      {/* Cuisines */}
                      {restaurant.cuisinesTypes && restaurant.cuisinesTypes.length > 0 && (
                        <p className="text-xs text-[#ea580c] font-semibold truncate">
                          {restaurant.cuisinesTypes.join(" • ")}
                        </p>
                      )}

                      {/* Restaurant Description */}
                      {restaurant.description && (
                        <p className="text-xs text-[#8faea7] line-clamp-2 leading-relaxed font-normal">
                          {restaurant.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Footer Row */}
                    <div className="flex items-center justify-between text-xs text-[#a5c7be] pt-3 border-t border-teal-900/60 font-medium">
                      {(restaurant.city || restaurant.address) && (
                        <span className="flex items-center gap-1.5 truncate text-[#8faea7] max-w-[55%]">
                          <IoLocationOutline className="text-orange-400 text-sm shrink-0" />
                          <span className="truncate">{restaurant.city || restaurant.address}</span>
                        </span>
                      )}
                      {restaurant.servingHours?.openingTime ? (
                        <span className="flex items-center gap-1.5 shrink-0 text-[#8faea7]">
                          <IoTimeOutline className="text-orange-400 text-sm shrink-0" />
                          <span>
                            {restaurant.servingHours.openingTime} – {restaurant.servingHours.closingTime}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 shrink-0 text-[#8faea7]">
                          <IoTimeOutline className="text-orange-400 text-sm shrink-0" />
                          <span>Fast Delivery</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative overflow-hidden bg-[#092723] text-white py-14 sm:py-20 border-b border-teal-950/40">
        {/* Decorative Floating Garnish & Spices */}
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-8 left-8 sm:left-16 z-0 w-8 sm:w-10 aspect-square rounded-full overflow-hidden shadow-md opacity-75 pointer-events-none rotate-[-30deg]">
          <img src={heroBasilLeaves} alt="garnish" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-16 right-8 sm:right-20 z-0 w-9 sm:w-12 aspect-square rounded-full overflow-hidden shadow-md opacity-75 pointer-events-none rotate-[45deg]">
          <img src={heroBasilLeaves} alt="garnish" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-12 left-1/4 w-2 h-2 rounded-full bg-red-500/80 shadow-xs pointer-events-none" />
        <div className="absolute top-24 right-1/4 w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-xs pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Why Choose <span className="text-[#ea580c]">Cravings?</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#a5c7be] mt-2 font-medium">
              We make your food experience simple, safe and satisfying.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
            {WHY_CHOOSE_US.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center group cursor-default"
              >
                {/* Circular Orange Icon */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#ea580c] flex items-center justify-center text-white text-2xl sm:text-3xl shadow-xl shadow-orange-950/50 mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110">
                  <span className="[&>*]:text-white">
                    {item.icon}
                  </span>
                </div>
                {/* Title */}
                <h3 className="text-base sm:text-lg font-extrabold text-white mb-1.5 sm:mb-2">
                  {item.title}
                </h3>
                {/* Description */}
                <p className="text-xs sm:text-sm text-[#8faea7] leading-relaxed max-w-[220px]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deals / Offers Banner Section */}
      <section className="bg-[#092723] py-8 sm:py-14 border-b border-teal-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ea580c] via-[#f26522] to-[#ea580c] shadow-2xl shadow-black/50 p-6 sm:p-10 lg:p-12 text-white">
            
            {/* Background decorative glow */}
            <div className="absolute top-1/2 left-8 w-56 h-56 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -top-10 right-1/4 w-40 h-40 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Offer Headline & CTA */}
              <div className="lg:col-span-4 text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-2">
                  Taste more,<br className="hidden sm:inline" /> pay less!
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-white/95 font-medium mb-6">
                  Exciting deals &amp; offers every day.
                </p>
                <Link
                  to="/order-now"
                  className="inline-block px-7 py-2.5 bg-[#fcd34d] hover:bg-[#fbbf24] active:scale-95 text-stone-900 font-extrabold text-xs sm:text-sm rounded-full shadow-lg shadow-orange-950/20 transition-all duration-200 cursor-pointer"
                >
                  Explore Deals
                </Link>
              </div>

              {/* Middle Column: Ticket / Coupon Visual */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="w-full max-w-[280px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative flex flex-col items-center justify-center border-2 border-dashed border-orange-300">
                  {/* Side Notch Cuts */}
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#ea580c]" />
                  <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#ea580c]" />

                  <span className="text-[11px] sm:text-xs font-black text-stone-500 uppercase tracking-widest">
                    FLAT
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-[#ea580c] leading-none my-1.5 tracking-tight">
                    20% <span className="text-2xl sm:text-3xl font-bold">OFF</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-700">
                    On Your First Order
                  </span>
                </div>
              </div>

              {/* Right Column: Appetizing Meal Visual */}
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="w-64 sm:w-72 lg:w-80 aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 bg-white/10">
                  <img
                    src={dealsBurgerFries}
                    alt="Delicious burger and fries meal"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#092723] text-white py-12 sm:py-18 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              What Our <span className="text-[#ea580c]">Customers Say</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#a5c7be] mt-2 font-medium">
              Real people. Real reviews.
            </p>
          </div>

          {/* Carousel / Cards Container with Arrows */}
          <div className="relative flex items-center justify-center gap-3 sm:gap-6">
            
            {/* Left Arrow Button */}
            <button
              type="button"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#07221e]/90 border border-teal-700/50 hover:border-orange-500 text-white hover:text-orange-400 flex items-center justify-center shrink-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              aria-label="Previous testimonial"
            >
              <IoChevronBack className="text-lg sm:text-xl" />
            </button>

            {/* 3 Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-4xl w-full">
              {TESTIMONIALS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#07221e]/90 backdrop-blur-md rounded-3xl p-6 border border-teal-800/40 shadow-xl hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* 5-Star Rating */}
                    <div className="flex items-center gap-1 text-amber-400 mb-3.5 text-sm">
                      {[...Array(item.rating)].map((_, i) => (
                        <IoStar key={i} />
                      ))}
                    </div>

                    {/* Customer Review Quote */}
                    <p className="text-xs sm:text-sm text-[#c2dfd8] font-normal leading-relaxed mb-6 italic">
                      "{item.review}"
                    </p>
                  </div>

                  {/* Customer Profile */}
                  <div className="flex items-center gap-3 pt-3.5 border-t border-teal-900/60">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/40 shadow-xs"
                    />
                    <div className="text-left">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {item.name}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow Button */}
            <button
              type="button"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#07221e]/90 border border-teal-700/50 hover:border-orange-500 text-white hover:text-orange-400 flex items-center justify-center shrink-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              aria-label="Next testimonial"
            >
              <IoChevronForward className="text-lg sm:text-xl" />
            </button>

          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
            <span className="w-5 h-2 rounded-full bg-[#ea580c] transition-all" />
            <span className="w-2 h-2 rounded-full bg-teal-800" />
            <span className="w-2 h-2 rounded-full bg-teal-800" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;