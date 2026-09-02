import { useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { IoCartOutline, IoStar, IoStorefrontOutline } from "react-icons/io5";
import {
  IoIosAdd,
  IoIosRemove,
} from "react-icons/io";

import { foodTypeDot } from "./helpers";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const MenuItemCard = ({ item, restaurantId, restaurantName }) => {
  const { isLogin, user, role } = useAuth();
  const { addItem, increaseItem, decreaseItem, getItemQuantity, replaceCart } =
    useCart();
  const [showConflictModal, setShowConflictModal] = useState(false);

  const isUnavailable = item.status === "unavailable";
  const itemCount =
    isLogin && user && role === "customer" ? getItemQuantity(item._id) : 0;

  const handleAdd = () => {
    if (!isLogin || !user || role !== "customer") {
      toast.error("Please login as Customer to add items to your cart.");
      return;
    }
    if (isUnavailable) return;
    const result = addItem(item, restaurantId, restaurantName);
    if (result === "different_restaurant") {
      setShowConflictModal(true);
    }
  };

  const handleReplaceCart = () => {
    replaceCart(item, restaurantId, restaurantName);
    setShowConflictModal(false);
  };

  return (
    <>
      <div
        className={`bg-[#092723]/90 backdrop-blur-md rounded-2xl sm:rounded-3xl overflow-hidden border border-teal-800/40 shadow-lg flex flex-col justify-between transition-all duration-300 ${
          isUnavailable
            ? "grayscale opacity-60 cursor-not-allowed"
            : "hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-1"
        }`}
      >
        {/* Dish Image */}
        <div className="relative h-36 sm:h-40 overflow-hidden bg-teal-950/60 group">
          {item.image?.url ? (
            <img
              src={item.image.url}
              alt={item.itemName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-teal-700">
              <MdOutlineRestaurantMenu className="text-4xl opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Veg / Non-Veg dot badge */}
          <span
            className={`absolute top-2.5 left-2.5 w-3.5 h-3.5 rounded-full border-2 border-white/80 shadow-md ${foodTypeDot(item.foodType)}`}
            title={item.foodType}
          />

          {/* Unavailable overlay */}
          {isUnavailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-600/90 text-white tracking-wide shadow-md">
                Unavailable
              </span>
            </div>
          )}

          {/* Special Badges */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
            {item.isNew && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-md uppercase">
                NEW
              </span>
            )}
            {item.isTopRated && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 shadow-md flex items-center gap-0.5 uppercase">
                <IoStar className="text-[9px]" /> Top
              </span>
            )}
            {item.isRecommended && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#ea580c] text-white shadow-md uppercase">
                Bestseller
              </span>
            )}
          </div>
        </div>

        {/* Info & Action Controls */}
        <div className="p-4 flex flex-col justify-between flex-1 space-y-2.5">
          <div>
            <div className="flex items-start justify-between gap-1.5 mb-1">
              <h3 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-1">
                {item.itemName}
              </h3>
              <span className="shrink-0 text-xs sm:text-sm font-black text-[#ea580c]">
                ₹{item.itemPrice ?? item.price}
              </span>
            </div>
            <p
              className="text-[11px] sm:text-xs text-[#8faea7] line-clamp-2 leading-relaxed font-normal"
              title={item.description}
            >
              {item.description || "Freshly cooked specialty dish."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-teal-900/60 gap-2">
            <span className="text-[10px] text-[#a5c7be] bg-[#07221e] border border-teal-800/60 px-2 py-0.5 rounded-full font-medium truncate max-w-[45%]">
              {item.category}
            </span>

            {itemCount > 0 ? (
              <div className="flex items-center bg-[#07221e] border border-teal-800/80 rounded-full overflow-hidden shadow-md">
                <button
                  onClick={() => decreaseItem(item._id)}
                  className="p-1.5 text-white hover:bg-orange-600/30 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <IoIosRemove className="text-sm" />
                </button>
                <div className="text-white font-extrabold text-xs px-2 min-w-[20px] text-center">
                  {itemCount}
                </div>
                <button
                  onClick={() => increaseItem(item._id)}
                  className="p-1.5 text-white hover:bg-orange-600/30 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <IoIosAdd className="text-sm" />
                </button>
              </div>
            ) : (
              <button
                disabled={isUnavailable}
                onClick={handleAdd}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white flex items-center gap-1 shadow-md shadow-orange-950/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <IoCartOutline className="text-sm" />
                <span>Add to cart</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Different Restaurant Conflict Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs px-4">
          <div className="bg-[#07221e] border border-teal-800/80 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-white text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/20 text-[#ea580c] mx-auto mb-4 border border-orange-500/30">
              <IoStorefrontOutline className="text-2xl" />
            </div>
            <h3 className="text-base font-black text-white mb-2">
              Start a new cart?
            </h3>
            <p className="text-xs text-[#a5c7be] leading-relaxed mb-6">
              Your cart already has items from another restaurant. You can only order from one restaurant at a time.
              <br /><br />
              Do you want to clear your cart and add items from <span className="font-bold text-white">{restaurantName}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConflictModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-teal-700/60 text-xs font-bold text-[#c2dfd8] hover:bg-teal-900/40 transition cursor-pointer"
              >
                Keep existing
              </button>
              <button
                onClick={handleReplaceCart}
                className="flex-1 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold shadow-lg shadow-orange-950/40 transition cursor-pointer"
              >
                Start new cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;
