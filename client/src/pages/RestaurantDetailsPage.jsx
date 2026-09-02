import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { IoArrowBack, IoShieldCheckmarkOutline, IoPeopleOutline, IoHeartOutline, IoSparklesOutline } from "react-icons/io5";
import { TbChefHat } from "react-icons/tb";
import RestaurantHero from "../components/publicRestaurantDetails/RestaurantHero";
import RestaurantInfoStrip from "../components/publicRestaurantDetails/RestaurantInfoStrip";
import RestaurantAbout from "../components/publicRestaurantDetails/RestaurantAbout";
import RestaurantGallery from "../components/publicRestaurantDetails/RestaurantGallery";
import RestaurantContact from "../components/publicRestaurantDetails/RestaurantContact";
import RestaurantSocialLinks from "../components/publicRestaurantDetails/RestaurantSocialLinks";
import RestaurantMenu from "../components/publicRestaurantDetails/RestaurantMenu";
import { useCart } from "../context/CartContext";

const RestaurantDetailsPage = () => {
  const { cart, totalItems, totalPrice } = useCart();
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    let isMounted = true;
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/public/restaurant-detail/${restaurantId}`);
        if (isMounted) {
          setDetails(res.data.data);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load restaurant details. Please try again.",
          );
          setIsLoading(false);
        }
      }
    };
    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  if (isLoading) return <Loader height="100vh" width="100%" />;

  const restaurant =
    details?.restaurantId ||
    details?.restaurant ||
    (details?._id ? details : null);

  if (!details || !restaurant) {
    return (
      <div className="min-h-screen bg-[#092723] flex flex-col items-center justify-center gap-4 text-white p-4">
        <TbChefHat className="text-6xl text-[#ea580c]" />
        <p className="text-lg font-bold">Restaurant not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-full text-sm font-bold cursor-pointer transition shadow-lg"
        >
          <IoArrowBack /> Go Back
        </button>
      </div>
    );
  }

  const menuItems = details.menuItems || [];

  return (
    <div className="min-h-screen bg-[#092723] text-white relative pb-24">
      {/* ── Top Hero Area ─────────────────────────────────────── */}
      <RestaurantHero restaurant={restaurant} onBack={() => navigate(-1)} />

      {/* ── Orange Info Strip ─────────────────────────────────── */}
      <RestaurantInfoStrip restaurant={restaurant} />

      {/* ── Main Two-Column Content Grid ──────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Sidebar: About, Gallery, Contact, Socials */}
        <div className="lg:col-span-4 space-y-6">
          <RestaurantAbout
            restaurantName={restaurant.restaurantName}
            description={restaurant.description}
          />
          <RestaurantGallery images={restaurant.restaurantImage} />
          <RestaurantContact restaurant={restaurant} />
          <RestaurantSocialLinks
            socialMediaLinks={restaurant.socialMediaLinks}
          />
        </div>

        {/* Right Column: Menu & Highlights */}
        <div className="lg:col-span-8 space-y-6">
          <RestaurantMenu
            menuItems={menuItems}
            restaurantId={restaurant._id}
            restaurantName={restaurant.restaurantName}
          />

          {/* Restaurant Highlights Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            <div className="bg-[#07221e]/90 backdrop-blur-md rounded-2xl p-4 border border-teal-800/40 shadow-lg flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center text-lg mb-2">
                <IoSparklesOutline />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">
                {restaurant.restaurantType ? `${restaurant.restaurantType} Certified` : "Pure Quality"}
              </h4>
              <p className="text-[10px] text-[#8faea7]">100% Authentic</p>
            </div>

            <div className="bg-[#07221e]/90 backdrop-blur-md rounded-2xl p-4 border border-teal-800/40 shadow-lg flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center text-lg mb-2">
                <IoShieldCheckmarkOutline />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">Hygienic Food</h4>
              <p className="text-[10px] text-[#8faea7]">Fresh &amp; Safe</p>
            </div>

            <div className="bg-[#07221e]/90 backdrop-blur-md rounded-2xl p-4 border border-teal-800/40 shadow-lg flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center text-lg mb-2">
                <IoPeopleOutline />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">Family Dining</h4>
              <p className="text-[10px] text-[#8faea7]">Good for Groups</p>
            </div>

            <div className="bg-[#07221e]/90 backdrop-blur-md rounded-2xl p-4 border border-teal-800/40 shadow-lg flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-[#ea580c]/20 text-[#ea580c] flex items-center justify-center text-lg mb-2">
                <IoHeartOutline />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">Top Rated</h4>
              <p className="text-[10px] text-[#8faea7]">Happy Customers</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Floating Sticky Cart Summary Pill ──────────────────── */}
      {cart && totalItems > 0 && (
        <div className="fixed w-full bottom-6 flex items-center justify-center z-40 px-4">
          <div className="bg-gradient-to-r from-[#ea580c] via-[#f26522] to-[#ea580c] text-white px-5 sm:px-6 py-3 rounded-full w-full max-w-xl flex justify-between items-center shadow-2xl shadow-black/60 border border-orange-300/40 animate-bounce-subtle">
            <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-[#ea580c] flex items-center justify-center text-xs">
                {totalItems}
              </span>
              <span>Total: ₹{totalPrice}</span>
            </div>

            <button
              className="bg-[#07221e] hover:bg-[#051815] text-white font-extrabold text-xs sm:text-sm px-5 py-2 rounded-full shadow-md transition-all active:scale-95 cursor-pointer border border-teal-700/60"
              onClick={() => navigate("/cart")}
            >
              Proceed to checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailsPage;
