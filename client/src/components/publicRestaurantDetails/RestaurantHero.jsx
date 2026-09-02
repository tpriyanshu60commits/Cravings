import { IoArrowBack, IoStar, IoTimeOutline, IoTicketOutline } from "react-icons/io5";
import { restaurantTypeLabel } from "./helpers";
import defaultRestaurantImage from "../../assets/Samplerestaurant.jpg";
import heroTomatoSlice from "../../assets/hero/hero_tomato_slice.jpg";
import heroCherryTomato from "../../assets/hero/hero_cherry_tomato.jpg";
import heroBasilLeaves from "../../assets/hero/hero_basil_leaves.jpg";

const RestaurantHero = ({ restaurant = {}, onBack }) => {
  const typeInfo = restaurantTypeLabel(restaurant?.restaurantType);

  return (
    <section className="relative overflow-hidden bg-[#092723] text-white pt-6 sm:pt-8 pb-10 sm:pb-12 border-b border-teal-950/40">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Navigation Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#a5c7be] hover:text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/15 transition-all cursor-pointer mb-6 sm:mb-8"
        >
          <IoArrowBack /> Back to restaurants
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Restaurant Info & Badges */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Restaurant Name */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2">
              {restaurant?.restaurantName || "Restaurant Details"}
            </h1>

            {/* Type & Cuisine Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${typeInfo.color}`}
              >
                {typeInfo.icon}
                {typeInfo.label}
              </span>
              {restaurant?.cuisineTypes?.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-[#07221e]/90 text-[#a5c7be] border border-teal-800/60"
                >
                  {c}
                </span>
              ))}
            </div>

            {/* Restaurant Description */}
            <p className="text-xs sm:text-sm md:text-base text-[#a5c7be] leading-relaxed max-w-xl mb-6 font-normal line-clamp-3">
              {restaurant?.description ||
                "Discover delicious gourmet dishes crafted with high quality ingredients and authentic recipes."}
            </p>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-lg">
              {/* Rating */}
              <div className="bg-[#07221e]/90 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-teal-800/40 text-left shadow-lg">
                <div className="flex items-center gap-1 text-amber-400 font-black text-sm sm:text-base">
                  <IoStar className="text-amber-400" />
                  <span>
                    {restaurant?.averageRating > 0
                      ? restaurant.averageRating.toFixed(1)
                      : "4.6"}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#8faea7] font-medium mt-0.5">
                  100+ Ratings
                </div>
              </div>

              {/* Open Time */}
              <div className="bg-[#07221e]/90 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-teal-800/40 text-left shadow-lg">
                <div className="flex items-center gap-1 text-white font-bold text-xs sm:text-sm truncate">
                  <IoTimeOutline className="text-[#ea580c] shrink-0" />
                  <span className="truncate">
                    {restaurant?.servingHours?.openingTime || "08:00 AM"}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#8faea7] font-medium mt-0.5">
                  {restaurant?.isOpen ? "Open Now" : "Opens Today"}
                </div>
              </div>

              {/* Offer */}
              <div className="bg-[#07221e]/90 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-teal-800/40 text-left shadow-lg">
                <div className="flex items-center gap-1 text-[#ea580c] font-black text-xs sm:text-sm">
                  <IoTicketOutline className="text-[#ea580c] shrink-0" />
                  <span>20% OFF</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#8faea7] font-medium mt-0.5">
                  First Order
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Curved Orange Backdrop + Restaurant Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0">
            {/* Floating Garnish */}
            <div className="absolute -top-4 sm:-top-6 left-6 z-20 w-9 sm:w-11 aspect-square rounded-full overflow-hidden shadow-lg rotate-[-15deg] pointer-events-none select-none">
              <img src={heroTomatoSlice} alt="garnish" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/2 -right-4 sm:-right-6 z-20 w-10 sm:w-12 aspect-square rounded-full overflow-hidden shadow-lg rotate-[25deg] pointer-events-none select-none">
              <img src={heroCherryTomato} alt="garnish" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 sm:-bottom-6 left-12 z-20 w-8 sm:w-10 aspect-square rounded-full overflow-hidden shadow-md rotate-[40deg] pointer-events-none select-none">
              <img src={heroBasilLeaves} alt="garnish" className="w-full h-full object-cover" />
            </div>

            {/* Curved Orange Container */}
            <div className="relative w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[480px] aspect-[4/3] sm:aspect-square rounded-[36px] sm:rounded-[48px] bg-gradient-to-tr from-[#ea580c] via-[#f26522] to-amber-500 p-2.5 sm:p-3 shadow-2xl shadow-orange-950/60 overflow-hidden group">
              <div className="w-full h-full rounded-[30px] sm:rounded-[40px] overflow-hidden relative">
                <img
                  src={restaurant?.coverImage?.url || defaultRestaurantImage}
                  alt={restaurant?.restaurantName || "Restaurant"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                {/* Floating 20% OFF Badge */}
                <div className="absolute top-4 right-4 bg-[#ea580c] text-white p-3 rounded-2xl shadow-xl border border-white/20 text-center select-none">
                  <span className="block text-base font-black leading-tight">20%</span>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider">OFF</span>
                  <span className="block text-[8px] opacity-90">First Order</span>
                </div>

                {/* Open / Closed Status on image */}
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md ${
                      restaurant?.isOpen
                        ? "bg-emerald-500 text-white"
                        : "bg-black/70 text-stone-200 border border-white/10"
                    }`}
                  >
                    {restaurant?.isOpen ? "● Open Now" : "● Closed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RestaurantHero;
