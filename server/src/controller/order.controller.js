import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Menu from "../models/menu.model.js";
import mongoose from "mongoose";

const getDefaultDeliveryAddress = (currentUser) => {
  return {
    name: currentUser.fullName,
    address: "Address Line",
    city: "City",
    state: "State",
    pinCode: "000000",
    country: "India",
    geoLocation: {
      lat: "",
      lon: "",
    },
  };
};

export const CreateOrder = async (req, res, next) => {
  try {
    const currentUser = req.user;

    if (!currentUser || currentUser.userType !== "customer") {
      const error = new Error("Only customers can create orders");
      error.statusCode = 403;
      return next(error);
    }
    const { restaurantId } = req.params;
    const { orderItems, paymentMethod, deliveryAddress } = req.body;
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      const error = new Error("Invalid restaurant ID");
      error.statusCode = 400;
      return next(error);
    }
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      const error = new Error("Order items are required");
      error.statusCode = 400;
      return next(error);
    }
    let customer = await Customer.findOne({
      customerId: currentUser._id,
    });

    if (!customer) {
      customer = await Customer.create({
        customerId: currentUser._id,
        addressBook: [],
      });
    }

    const menuDoc = await Menu.findOne({ restaurantId });
    if (!menuDoc || !menuDoc.menuItems?.length) {
      const error = new Error("Restaurant menu not found");
      error.statusCode = 404;
      return next(error);
    }
    let normalizedOrderItems = [];
    let itemAmount = 0;
    for (let item of orderItems) {
      const menuItem = menuDoc.menuItems.id(item.itemId);
      const qty = Number(item.quantity);
      if (!menuItem || !Number.isInteger(qty) || qty < 1) {
        const error = new Error("Invalid order item or quantity");
        error.statusCode = 400;
        return next(error);
      }
      const itemPrice = Number(menuItem.get("itemPrice"));
      if (itemPrice < 0) {
        const error = new Error("Invalid menu item price");
        error.statusCode = 400;
        return next(error);
      }
      itemAmount += itemPrice * qty;
      normalizedOrderItems.push({
        itemId: menuItem._id,
        itemName: menuItem.itemName,
        itemPrice,
        quantity: qty,
        image: {
          url: menuItem.image?.url || "",
          publicId: menuItem.image?.publicId || "",
        },
      });
    }

    const platformFee = 5;
    const convenienceFee = 5;
    const deliveryCharge = 0;
    const discountAmount = 0;

    const totalAmount = Math.round(itemAmount * 100) / 100;
    const taxAmount = Math.round(totalAmount * 0.05 * 100) / 100;
    const finalAmount =
      Math.round(
        (totalAmount +
          platformFee +
          convenienceFee +
          deliveryCharge +
          taxAmount -
          discountAmount) *
          100,
      ) / 100;

    const newOrder = await Order.create({
      restaurantId,
      customerId: customer._id,
      orderItems: normalizedOrderItems,
      orderStatus: "pending",
      billDetails: {
        totalAmount,
        platformFee,
        convenienceFee,
        taxAmount,
        deliveryCharge,
        discountAmount,
        finalAmount,
      },
      deliveryAddress,
      paymentDetails: {
        paymentMethod: paymentMethod || "upi",
        paymentStatus: "pending",
      },
    });
    res.status(201).json({
      message: "Order created with payment pending",
      data: newOrder,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
