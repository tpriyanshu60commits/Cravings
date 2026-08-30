import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/ApiConfig";
import defaultRestaurantImage from "../assets/Samplerestaurant.jpg";
import heroBg from "../assets/carousel/bgImage1.jpg";
import {
  IoSearch,
  IoLocationOutline,
  IoTimeOutline,
  IoStar,
  IoStorefrontOutline,
} from "react-icons/io5";
import { FaUtensils, FaLeaf, FaDrumstickBite } from "react-icons/fa";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import Loader from "../components/Loader";

const CUISINES = [
  { name: "North Indian", icon: <FaUtensils /> },
  { name: "South Indian", icon: <FaLeaf /> },
  { name: "Chinese", icon: <MdOutlineRestaurantMenu /> },
  { name: "Fast Food", icon: <FaDrumstickBite /> },
  { name: "Desserts", icon: <FaUtensils /> },
];

const Home = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="min-h-screen bg-(--color-base-200)">
      {/* Hero Section */}
      <section className="relative min-h-[480px] flex items-center justify-center text-center px-4 py-20 overflow-hidden">
        <img
          src={heroBg}
          alt="hero background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-(--color-primary) bg-white/90 px-4 py-1.5 rounded-full shadow">
            <FaUtensils /> Fresh • Fast • Delicious
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-md">
            Satisfy Your <span className="text-(--color-primary)">Cravings</span> Instantly
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto">
            Order from the finest local kitchens and popular restaurants delivered straight to your door.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto pt-2">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search dishes, restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-(--color-base-content) text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-(--color-primary) text-(--color-primary-content) text-xs font-bold rounded-xl hover:opacity-90 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular Cuisines Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-(--color-base-content) mb-6">
          Explore Popular Cuisines
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CUISINES.map((cuisine) => (
            <Link
              key={cuisine.name}
              to={`/order-now?cuisine=${encodeURIComponent(cuisine.name)}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-(--color-base-100) border border-(--color-base-300) shadow-xs hover:border-(--color-primary) hover:shadow-md transition group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                {cuisine.icon}
              </div>
              <span className="text-sm font-semibold text-(--color-base-content)">
                {cuisine.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-(--color-base-content)">
              Featured Restaurants
            </h2>
            <p className="text-xs sm:text-sm text-(--color-secondary)">
              Handpicked spots with top ratings and fast delivery
            </p>
          </div>
          <Link
            to="/order-now"
            className="text-xs sm:text-sm font-semibold text-(--color-primary) hover:underline"
          >
            View All ({restaurants.length}) →
          </Link>
        </div>

        {isLoading ? (
          <Loader height="300px" width="100%" />
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12 text-(--color-secondary) bg-(--color-base-100) rounded-2xl border border-(--color-base-300)">
            <IoStorefrontOutline className="text-5xl mx-auto mb-2 opacity-40" />
            <p className="text-sm">No restaurants available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.slice(0, 6).map((restaurant) => (
              <div
                key={restaurant._id}
                onClick={() => navigate(`/restaurant-details/${restaurant._id}`)}
                className="bg-(--color-base-100) rounded-2xl overflow-hidden border border-(--color-base-300) shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
              >
                {/* Cover Image */}
                <div className="relative w-full h-44 bg-(--color-base-300) overflow-hidden">
                  <img
                    src={restaurant?.coverImage?.url || defaultRestaurantImage}
                    alt={restaurant.restaurantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      restaurant.isOpen ? "bg-green-500 text-white" : "bg-black/60 text-white"
                    }`}
                  >
                    {restaurant.isOpen ? "● Open" : "● Closed"}
                  </span>

                  {restaurant.averageRating > 0 && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      <IoStar className="text-[11px]" />
                      {restaurant.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-bold text-(--color-base-content) truncate">
                    {restaurant.restaurantName}
                  </h3>
                  <p className="text-xs text-(--color-secondary) line-clamp-2 leading-relaxed">
                    {restaurant.description || "Fresh food and quick delivery."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-(--color-secondary) pt-2 border-t border-(--color-base-300)">
                    {(restaurant.city || restaurant.address) && (
                      <span className="flex items-center gap-1 truncate">
                        <IoLocationOutline />
                        {restaurant.city || restaurant.address}
                      </span>
                    )}
                    {restaurant.servingHours?.openingTime && (
                      <span className="flex items-center gap-1">
                        <IoTimeOutline />
                        {restaurant.servingHours.openingTime} – {restaurant.servingHours.closingTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
