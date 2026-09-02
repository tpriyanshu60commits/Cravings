import { useMemo, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { foodTypeDot } from "./helpers";
import MenuItemCard from "./MenuItemCard";

const RestaurantMenu = ({ menuItems = [], restaurantId, restaurantName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFoodType, setActiveFoodType] = useState("All");

  // Exclude discontinued + deleted; keep available & unavailable
  const activeItems = useMemo(
    () =>
      (menuItems || []).filter(
        (item) => item && !item.isDeleted && item.status !== "discontinued",
      ),
    [menuItems],
  );

  const categories = useMemo(() => {
    const cats = [...new Set(activeItems.map((i) => i.category).filter(Boolean))];
    return ["All", ...cats];
  }, [activeItems]);

  const foodTypes = useMemo(() => {
    const types = [...new Set(activeItems.map((i) => i.foodType).filter(Boolean))];
    return ["All", ...types];
  }, [activeItems]);

  const filteredItems = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return activeItems.filter((item) => {
      const matchSearch =
        !q ||
        (item.itemName && item.itemName.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));
      const matchCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchFoodType =
        activeFoodType === "All" || item.foodType === activeFoodType;
      return matchSearch && matchCategory && matchFoodType;
    });
  }, [activeItems, searchQuery, activeCategory, activeFoodType]);

  return (
    <div className="bg-[#07221e]/90 backdrop-blur-md rounded-3xl border border-teal-800/40 shadow-xl overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-teal-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <MdOutlineRestaurantMenu className="text-[#ea580c]" />
            <span>Menu</span>
            <span className="text-xs font-semibold text-[#8faea7]">
              ({activeItems.length} items)
            </span>
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#092723] text-white border border-teal-800/60 rounded-2xl shadow-inner placeholder-[#8faea7] focus:outline-none focus:border-orange-500 font-medium transition-all"
          />
        </div>

        {/* Category & Diet Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full border font-bold transition-all duration-200 cursor-pointer select-none ${
                activeCategory === cat
                  ? "bg-[#ea580c] text-white border-[#ea580c] shadow-md shadow-orange-950/40"
                  : "bg-[#092723] border-teal-800/60 text-[#c2dfd8] hover:border-orange-500 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Food Type Filter Tabs if multiple */}
          {foodTypes.length > 2 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-teal-900/60">
              {foodTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFoodType(type)}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-semibold transition cursor-pointer select-none ${
                    activeFoodType === type
                      ? "bg-white text-stone-900 border-white"
                      : "bg-[#092723]/60 border-teal-800/40 text-[#8faea7] hover:border-teal-600"
                  }`}
                >
                  {type !== "All" && (
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${foodTypeDot(type)}`}
                    />
                  )}
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="p-5 sm:p-6">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-[#8faea7]">
            <MdOutlineRestaurantMenu className="text-5xl mx-auto mb-3 opacity-30 text-[#ea580c]" />
            <p className="text-sm font-semibold text-white">No items found matching your filters.</p>
            <p className="text-xs text-[#8faea7] mt-1">Try clearing search query or changing category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                restaurantId={restaurantId}
                restaurantName={restaurantName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
