import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurant, setrestaurant] = useState([]);
  const [filteredRestaurant, setFilteredRestaurant] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "all", label: "All", icon: MdRestaurant },
    { id: "veg", label: "Vegetarian", icon: MdLocalDining },
    { id: "nonveg", label: "Non-Veg", icon: MdFastfood },
    { id: "dessert", label: "Desserts", icon: MdCake },
    { id: "others", label: "Others", icon: MdLunchDining },
  ];

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        const res = await api.get("/public/restaurants");

        const formattedRestaurants = res.data.data.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.restaurantName,
          description:
            restaurant.description ||
            `${restaurant.cuisineType} cuisine in ${restaurant.city}`,
          rating: restaurant.rating || 0,
          numReviews: restaurant.numReviews || 0,
          image:
            restaurant.images?.[0]?.URL ||
            "https://placehold.co/300x200?text=Restaurant",
          cuisines: restaurant.cuisineType,
          geolocation: restaurant.geolocation,
          city: restaurant.city,
          address: restaurant.address,
          openingHours: restaurant.openingHours,
          closingHours: restaurant.closingHours,
        }));

        setrestaurant(formattedRestaurants);
        setFilteredRestaurant(formattedRestaurants);
      } catch (error) {
        console.error("Error loading restaurants:", error);
        setrestaurant([]);
        setFilteredRestaurant([]);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  useEffect(() => {
    let filtered = restaurant;

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cuisines.some((c) =>
            c.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          r.city.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (selectedCategory !== "all") {
      const categoryMap = {
        veg: "vegetarian",
        nonveg: "non-vegetarian",
        dessert: "desserts",
        others: "other",
      };
      const selectedCuisine = categoryMap[selectedCategory];
      filtered = filtered.filter((r) =>
        r.cuisines.some((c) => c.toLowerCase().includes(selectedCuisine)),
      );
    }
    setFilteredRestaurant(filtered);
  }, [searchQuery, selectedCategory, restaurant]);

  return (
    <>
      <div>Home</div>
    </>
  );
};

export default Home;
