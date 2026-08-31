import { createContext, useState, useEffect, useContext } from "react";
import api from "../config/ApiConfig";

const CartContext = createContext();

const CART_KEY = "cravings_cart";

const emptyCart = {
  restaurantId: null,
  restaurantName: "",
  items: [],
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_KEY));
      if (savedCart && Array.isArray(savedCart.items)) {
        return {
          ...savedCart,
          items: savedCart.items.map((i) => ({
            ...i,
            price: Number(i.price ?? i.itemPrice) || 0,
          })),
        };
      }
      return emptyCart;
    } catch {
      return emptyCart;
    }
  });

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Self-heal/sync item prices from backend if any item in cart is missing price or has price === 0
  useEffect(() => {
    if (!cart.restaurantId || !cart.items?.length) return;
    const hasMissingPrice = cart.items.some(
      (i) => !i.price || Number(i.price) <= 0
    );
    if (!hasMissingPrice) return;

    let isMounted = true;
    api
      .get(`/public/restaurant-detail/${cart.restaurantId}`)
      .then((res) => {
        if (!isMounted) return;
        const menuItems = res.data?.data?.menuItems || [];
        if (!menuItems.length) return;

        setCart((prev) => {
          let updated = false;
          const updatedItems = prev.items.map((i) => {
            if (i.price && Number(i.price) > 0) return i;
            const found = menuItems.find((m) => m._id === i._id);
            if (found && Number(found.itemPrice) > 0) {
              updated = true;
              return { ...i, price: Number(found.itemPrice) };
            }
            return i;
          });
          if (!updated) return prev;
          return { ...prev, items: updatedItems };
        });
      })
      .catch((err) => {
        console.error("Failed to sync cart item prices:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [cart.restaurantId, cart.items]);

  // Total quantity of all items
  const totalItems = (cart?.items || []).reduce(
    (sum, i) => sum + (Number(i.quantity) || 0),
    0
  );

  // Total price of all items
  const totalPrice = (cart?.items || []).reduce(
    (sum, i) => sum + (Number(i.price ?? i.itemPrice) || 0) * (Number(i.quantity) || 0),
    0
  );

  // Get quantity of a specific item
  const getItemQuantity = (itemId) => {
    const found = (cart?.items || []).find((i) => i._id === itemId);

    return found ? found.quantity : 0;
  };

  // Returns "added" or "different_restaurant"
  const addItem = (item, restaurantId, restaurantName) => {
    // Prevent adding items from a different restaurant
    if (cart.restaurantId && cart.restaurantId !== restaurantId) {
      return "different_restaurant";
    }

    setCart((prev) => {
      // Check whether item already exists in cart
      const exists = prev.items.find((i) => i._id === item._id);

      const updatedItems = exists
        ? // Item already exists → increase quantity and ensure price is updated
        prev.items.map((i) =>
          i._id === item._id
            ? {
              ...i,
              price: Number(item.itemPrice ?? item.price) || i.price || 0,
              quantity: i.quantity + 1,
            }
            : i
        )
        : // Item doesn't exist → add new item
        [
          ...prev.items,
          {
            _id: item._id,
            itemName: item.itemName,

            // Backend field = itemPrice
            // Cart field = price
            price: Number(item.itemPrice ?? item.price) || 0,

            image: item.image,
            category: item.category,
            foodType: item.foodType,
            quantity: 1,
          },
        ];

      return {
        restaurantId,
        restaurantName,
        items: updatedItems,
      };
    });

    return "added";
  };

  // Increase item quantity
  const increaseItem = (itemId) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i._id === itemId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    }));
  };

  // Decrease item quantity
  const decreaseItem = (itemId) => {
    setCart((prev) => {
      const updatedItems = prev.items
        .map((i) =>
          i._id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0);

      return {
        ...prev,
        items: updatedItems,
        restaurantId: updatedItems.length
          ? prev.restaurantId
          : null,
        restaurantName: updatedItems.length
          ? prev.restaurantName
          : "",
      };
    });
  };

  // Remove item completely
  const removeItem = (itemId) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter(
        (i) => i._id !== itemId
      );

      return {
        ...prev,
        items: updatedItems,
        restaurantId: updatedItems.length
          ? prev.restaurantId
          : null,
        restaurantName: updatedItems.length
          ? prev.restaurantName
          : "",
      };
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart(emptyCart);
  };

  // Clear old cart and start with new restaurant's item
  const replaceCart = (item, restaurantId, restaurantName) => {
    setCart({
      restaurantId,
      restaurantName,
      items: [
        {
          _id: item._id,
          itemName: item.itemName,

          // Backend field = itemPrice
          // Cart field = price
          price: Number(item.itemPrice ?? item.price) || 0,

          image: item.image,
          category: item.category,
          foodType: item.foodType,
          quantity: 1,
        },
      ],
    });
  };

  // Data and functions available to all components
  const value = {
    cart,
    totalItems,
    totalPrice,
    getItemQuantity,
    addItem,
    increaseItem,
    decreaseItem,
    removeItem,
    clearCart,
    replaceCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);