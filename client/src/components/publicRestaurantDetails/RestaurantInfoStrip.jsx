import {
  IoLocationOutline,
  IoTimeOutline,
  IoCallOutline,
  IoMailOutline,
} from "react-icons/io5";

const RestaurantInfoStrip = ({ restaurant }) => {
  const { contactDetails, servingHours, address, city, state } = restaurant;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-7 relative z-20">
      <div className="bg-gradient-to-r from-[#ea580c] via-[#f26522] to-[#ea580c] text-white rounded-2xl sm:rounded-3xl shadow-xl shadow-orange-950/40 px-5 sm:px-8 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-medium border border-orange-400/30">
        {(city || address) && (
          <span className="flex items-center gap-2">
            <IoLocationOutline className="text-base sm:text-lg shrink-0 text-white" />
            <span>{[address, city, state].filter(Boolean).join(", ")}</span>
          </span>
        )}
        {servingHours?.openingTime && (
          <span className="flex items-center gap-2">
            <IoTimeOutline className="text-base sm:text-lg shrink-0 text-white" />
            <span>
              {servingHours.openingTime} – {servingHours.closingTime}
            </span>
          </span>
        )}
        {contactDetails?.phone && (
          <span className="flex items-center gap-2">
            <IoCallOutline className="text-base sm:text-lg shrink-0 text-white" />
            <span>{contactDetails.phone}</span>
          </span>
        )}
        {contactDetails?.email && (
          <span className="flex items-center gap-2">
            <IoMailOutline className="text-base sm:text-lg shrink-0 text-white" />
            <span>{contactDetails.email}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default RestaurantInfoStrip;
