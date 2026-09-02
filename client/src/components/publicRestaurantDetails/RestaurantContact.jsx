import {
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline,
  IoTimeOutline,
} from "react-icons/io5";

const RestaurantContact = ({ restaurant }) => {
  const { contactDetails, servingHours, address, city, state, pinCode, country } = restaurant;
  const hasContact = contactDetails?.phone || contactDetails?.email;
  const hasAddress = address || city;

  if (!hasContact && !hasAddress) return null;

  return (
    <div className="bg-[#07221e]/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-teal-800/40 shadow-xl space-y-3.5">
      <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight mb-3">
        Contact & Location
      </h2>

      {servingHours?.openingTime && (
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#c2dfd8]">
          <IoTimeOutline className="text-[#ea580c] text-base shrink-0" />
          <span>
            {servingHours.openingTime} – {servingHours.closingTime}
          </span>
        </div>
      )}

      {contactDetails?.phone && (
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#c2dfd8]">
          <IoCallOutline className="text-[#ea580c] text-base shrink-0" />
          <span>{contactDetails.phone}</span>
        </div>
      )}

      {contactDetails?.email && (
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#c2dfd8]">
          <IoMailOutline className="text-[#ea580c] text-base shrink-0" />
          <span>{contactDetails.email}</span>
        </div>
      )}

      {hasAddress && (
        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#c2dfd8]">
          <IoLocationOutline className="text-[#ea580c] text-base shrink-0 mt-0.5" />
          <span>
            {[address, city, state, pinCode, country].filter(Boolean).join(", ")}
          </span>
        </div>
      )}

      {/* Stylized Location Map Graphic */}
      <div className="mt-4 rounded-2xl overflow-hidden border border-teal-800/50 bg-[#092723] p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#8faea7] font-semibold">
          <IoLocationOutline className="text-[#ea580c]" />
          <span>{city || "Local Delivery Area"}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantContact;
