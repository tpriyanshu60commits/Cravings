const RestaurantAbout = ({ restaurantName, description }) => (
  <div className="bg-[#07221e]/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-teal-800/40 shadow-xl">
    <h2 className="text-sm sm:text-base font-extrabold text-white mb-2 tracking-tight">
      About {restaurantName ? <span className="text-[#ea580c]">{restaurantName}</span> : "Restaurant"}
    </h2>
    <p className="text-xs sm:text-sm text-[#8faea7] leading-relaxed font-normal">
      {description || "No description available for this restaurant."}
    </p>
  </div>
);

export default RestaurantAbout;
