import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import CustomerAddressModal from "./customerDashboard/CustomerAddressModal";
import {
  IoTrashOutline,
  IoArrowBack,
  IoStorefrontOutline,
  IoCartOutline,
  IoLocationOutline,
  IoAddCircleOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import {
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
} from "react-icons/io";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { LuLoaderCircle } from "react-icons/lu";

// Food type dot color
const foodTypeDot = (type) => {
  switch (type?.toLowerCase()) {
    case "veg":
      return "bg-green-500";
    case "non-veg":
      return "bg-red-500";
    case "vegan":
      return "bg-emerald-600";
    case "jain":
      return "bg-amber-500";
    default:
      return "bg-gray-400";
  }
};

const Cart = () => {
  const navigate = useNavigate();
  const { user, isLogin } = useAuth();
  const {
    cart,
    totalItems,
    removeItem,
    increaseItem,
    decreaseItem,
    clearCart,
  } = useCart();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Fetch saved addresses on mount if logged in
  useEffect(() => {
    let isMounted = true;
    if (isLogin) {
      api
        .get("/customer/address-book")
        .then((res) => {
          if (isMounted) {
            const list = res.data?.data || [];
            setAddressList(list);
            if (list.length > 0) {
              const defaultAddr = list.find((a) => a.isDefault) || list[0];
              setSelectedAddressId(defaultAddr._id);
            }
            setIsLoadingAddresses(false);
          }
        })
        .catch((error) => {
          console.error("Failed to load customer addresses:", error);
          if (isMounted) {
            setIsLoadingAddresses(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isLogin]);

  // -----------------------------------------------------
  // Calculate pricing breakdown
  // -----------------------------------------------------
  const calculatedItemsTotal =
    cart?.items?.reduce((total, item) => {
      const itemPrice = Number(item?.price ?? item?.itemPrice) || 0;
      const quantity = Number(item?.quantity) || 0;
      return total + itemPrice * quantity;
    }, 0) || 0;

  const platformFee = calculatedItemsTotal > 0 ? 5 : 0;
  const convenienceFee = calculatedItemsTotal > 0 ? 5 : 0;
  const taxAmount = Math.round(calculatedItemsTotal * 0.05 * 100) / 100;
  const grandTotal =
    Math.round(
      (calculatedItemsTotal + platformFee + convenienceFee + taxAmount) * 100
    ) / 100;

  // -----------------------------------------------------
  // Load Razorpay Checkout Script
  // -----------------------------------------------------
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // -----------------------------------------------------
  // Handle Place Order & Razorpay Payment
  // -----------------------------------------------------
  const handlePlaceOrder = async () => {
    if (!isLogin) {
      toast.error("Please login to place your order");
      navigate("/login");
      return;
    }

    if (!cart?.items?.length) {
      toast.error("Your cart is empty");
      return;
    }

    const selectedAddr = addressList.find((a) => a._id === selectedAddressId);
    if (!selectedAddr) {
      toast.error("Please select or add a delivery address to proceed");
      setIsAddressModalOpen(true);
      return;
    }

    setIsPlacingOrder(true);

    try {
      // 1. Prepare Order payload
      const orderItems = cart.items.map((item) => ({
        itemId: item._id,
        quantity: item.quantity,
      }));

      const deliveryAddress = {
        name: selectedAddr.name,
        address: selectedAddr.address,
        city: selectedAddr.city,
        state: selectedAddr.state,
        pinCode: selectedAddr.pinCode,
        country: selectedAddr.country || "India",
        geoLocation: {
          lat: String(selectedAddr.geoLocation?.lat || selectedAddr.geoLat || "").trim(),
          lon: String(selectedAddr.geoLocation?.lon || selectedAddr.geoLon || "").trim(),
        },
      };

      // 2. Create Order in Backend
      const createOrderRes = await api.post(
        `/order/create-order/${cart.restaurantId}`,
        {
          orderItems,
          paymentMethod: "upi",
          deliveryAddress,
        }
      );

      const appOrderId = createOrderRes.data?.data?._id;
      if (!appOrderId) {
        throw new Error("Order ID not returned by server");
      }

      // 3. Create Razorpay Payment Order
      const paymentOrderRes = await api.post("/payment/create-order", {
        orderId: appOrderId,
      });

      const { key, razorpayOrderId, amount, currency } =
        paymentOrderRes.data?.data || {};

      // 4. Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        return;
      }

      // 5. Open Razorpay Modal
      const options = {
        key: key,
        amount: amount,
        currency: currency || "INR",
        name: "Cravings Food Delivery",
        description: `Order from ${cart.restaurantName}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify signature in backend
            await api.post("/payment/verify", {
              orderId: appOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment verified! Your order is placed.");
            clearCart();
            navigate(`/order-tracking/${appOrderId}`);
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Payment signature verification failed",
            );
          }
        },
        prefill: {
          name: user?.fullName || selectedAddr.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment modal closed");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error?.description || "Unknown error"}`);
      });
      rzp.open();
    } catch (error) {
      console.error("Order / Payment Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to process order. Please try again.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // -----------------------------------------------------
  // Empty Cart View
  // -----------------------------------------------------
  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-(--color-base-200) flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-(--color-base-300) flex items-center justify-center">
          <IoCartOutline className="text-5xl text-(--color-secondary)" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-(--color-base-content) mb-1">
            Your cart is empty
          </h2>
          <p className="text-sm text-(--color-secondary)">
            Add delicious meals from a restaurant to get started.
          </p>
        </div>
        <Link
          to="/order-now"
          className="px-6 py-2.5 bg-(--color-primary) text-(--color-primary-content) rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-xs"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-base-200) py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-(--color-base-300) transition text-(--color-base-content)"
          >
            <IoArrowBack className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-(--color-base-content) flex items-center gap-2">
              <IoCartOutline /> Your Cart
            </h1>
            <p className="text-xs text-(--color-secondary) flex items-center gap-1 mt-0.5">
              <IoStorefrontOutline /> Ordering from{" "}
              <span className="font-semibold text-(--color-base-content)">
                {cart.restaurantName}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Left Column: Cart Items + Delivery Address */}
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-(--color-secondary)">
                Items in Order ({totalItems})
              </h2>

              {cart.items.map((item) => {
                const itemPrice = Number(item?.price ?? item?.itemPrice) || 0;
                const quantity = Number(item?.quantity) || 0;
                const itemTotal = itemPrice * quantity;

                return (
                  <div
                    key={item._id}
                    className="bg-(--color-base-100) rounded-2xl p-4 border border-(--color-base-300) flex gap-4 items-center shadow-xs"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-(--color-base-300)">
                      {item.image?.url ? (
                        <img
                          src={item.image.url}
                          alt={item.itemName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MdOutlineRestaurantMenu className="text-2xl text-(--color-secondary) opacity-40" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full border border-white shrink-0 ${foodTypeDot(
                            item.foodType
                          )}`}
                        />
                        <h3 className="text-sm font-semibold text-(--color-base-content) truncate">
                          {item.itemName}
                        </h3>
                      </div>
                      <p className="text-xs text-(--color-secondary) mb-1">
                        {item.category}
                      </p>
                      <p className="text-sm font-bold text-(--color-primary)">
                        ₹{itemTotal.toFixed(2)}
                        <span className="ml-1 text-xs font-normal text-(--color-secondary)">
                          (₹{itemPrice.toFixed(2)} × {quantity})
                        </span>
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-(--color-base-300) rounded-full divide-(--color-base-300) divide-x bg-(--color-base-200)">
                        <button
                          onClick={() => decreaseItem(item._id)}
                          className="px-1.5 py-0.5 text-(--color-primary) rounded-l-full hover:bg-(--color-primary) hover:text-(--color-primary-content) transition"
                        >
                          <IoIosRemoveCircleOutline className="text-xl" />
                        </button>
                        <div className="text-(--color-primary) flex justify-center items-center text-xs font-bold px-2.5 py-0.5 min-w-7">
                          {quantity}
                        </div>
                        <button
                          onClick={() => increaseItem(item._id)}
                          className="px-1.5 py-0.5 text-(--color-primary) rounded-r-full hover:bg-(--color-primary) hover:text-(--color-primary-content) transition"
                        >
                          <IoIosAddCircleOutline className="text-xl" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-(--color-secondary) hover:text-red-500 transition"
                        title="Remove item"
                      >
                        <IoTrashOutline className="text-base" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-1">
                <Link
                  to={`/restaurant-details/${cart.restaurantId}`}
                  className="text-xs text-(--color-primary) font-semibold hover:underline flex items-center gap-1"
                >
                  <IoStorefrontOutline /> Add more items
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <IoTrashOutline /> Clear entire cart
                </button>
              </div>
            </div>

            {/* Delivery Address Selection Section */}
            <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-(--color-base-content) flex items-center gap-2">
                  <IoLocationOutline className="text-lg text-(--color-primary)" />
                  Delivery Address
                </h3>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs font-semibold text-(--color-primary) hover:underline flex items-center gap-1"
                >
                  <IoAddCircleOutline className="text-sm" /> Add New
                </button>
              </div>

              {isLoadingAddresses ? (
                <div className="py-4 text-center text-xs text-(--color-secondary)">
                  Loading addresses...
                </div>
              ) : addressList.length === 0 ? (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-center space-y-2">
                  <p className="text-xs text-orange-800">
                    You have no saved delivery addresses. Please add an address to complete your order.
                  </p>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="px-4 py-1.5 bg-(--color-primary) text-(--color-primary-content) text-xs font-semibold rounded-lg hover:opacity-90 transition"
                  >
                    Add Address Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {addressList.map((addr) => {
                    const isSelected = addr._id === selectedAddressId;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? "border-(--color-primary) bg-orange-50/50 ring-1 ring-(--color-primary)"
                            : "border-(--color-base-300) hover:border-gray-400 bg-(--color-base-100)"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-(--color-primary)">
                              {addr.addressType}
                            </span>
                            {isSelected && (
                              <IoCheckmarkCircle className="text-base text-(--color-primary)" />
                            )}
                          </div>
                          <p className="text-xs font-bold text-(--color-base-content)">
                            {addr.name}
                          </p>
                          <p className="text-[11px] text-(--color-secondary) line-clamp-2 leading-relaxed">
                            {addr.address}, {addr.city} - {addr.pinCode}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-(--color-base-100) rounded-2xl border border-(--color-base-300) p-5 sticky top-20 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-(--color-base-content)">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-(--color-secondary)">
                <span>Items Total ({totalItems})</span>
                <span className="font-semibold text-(--color-base-content)">
                  ₹{calculatedItemsTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-(--color-secondary)">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>

              <div className="flex justify-between text-(--color-secondary)">
                <span>Platform Fee</span>
                <span className="text-(--color-base-content)">₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-(--color-secondary)">
                <span>Convenience Fee</span>
                <span className="text-(--color-base-content)">₹{convenienceFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-(--color-secondary)">
                <span>GST / Taxes (5%)</span>
                <span className="text-(--color-base-content)">₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="border-t border-(--color-base-300) pt-3 flex justify-between font-extrabold text-sm text-(--color-base-content)">
                <span>To Pay</span>
                <span className="text-(--color-primary) text-base">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order & Pay Button */}
            <button
              disabled={isPlacingOrder || addressList.length === 0}
              onClick={handlePlaceOrder}
              className="w-full py-3 bg-(--color-primary) text-(--color-primary-content) rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isPlacingOrder ? (
                <>
                  <LuLoaderCircle className="animate-spin text-base" />
                  Initiating Payment...
                </>
              ) : (
                `Proceed to Pay ₹${grandTotal.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Address modal for adding new address directly from Cart */}
      {isAddressModalOpen && (
        <CustomerAddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSaveSuccess={(updatedList) => {
            setAddressList(updatedList);
            if (updatedList.length > 0) {
              setSelectedAddressId(updatedList[updatedList.length - 1]._id);
            }
          }}
        />
      )}
    </div>
  );
};

export default Cart;
