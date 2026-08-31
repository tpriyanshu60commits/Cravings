import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Menu from "../models/menu.model.js";
import mongoose from "mongoose";

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
        itemName: menuItem.itemName || item.itemName || "Item",
        itemPrice: String(itemPrice),
        quantity: String(qty),
        image: {
          url: menuItem.image?.url || item.image?.url || "",
          publicId: menuItem.image?.publicId || item.image?.publicId || "",
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

    const resolvedGeoLocation = {
      lat: String(deliveryAddress?.geoLocation?.lat || deliveryAddress?.geoLat || "").trim(),
      lon: String(deliveryAddress?.geoLocation?.lon || deliveryAddress?.geoLon || "").trim(),
    };

    // If coordinates were omitted in checkout payload, resolve from customer's saved addressBook
    if (!resolvedGeoLocation.lat || !resolvedGeoLocation.lon) {
      if (customer && Array.isArray(customer.addressBook) && customer.addressBook.length > 0) {
        const matchingAddr =
          customer.addressBook.find(
            (a) =>
              a.address === deliveryAddress?.address &&
              a.pinCode === deliveryAddress?.pinCode
          ) ||
          customer.addressBook.find((a) => a.isDefault) ||
          customer.addressBook[0];

        if (matchingAddr?.geoLocation?.lat && matchingAddr?.geoLocation?.lon) {
          resolvedGeoLocation.lat = String(matchingAddr.geoLocation.lat).trim();
          resolvedGeoLocation.lon = String(matchingAddr.geoLocation.lon).trim();
        }
      }
    }

    const sanitizedDeliveryAddress = {
      name: deliveryAddress?.name || currentUser.fullName || "Customer",
      address: deliveryAddress?.address || "",
      city: deliveryAddress?.city || "",
      state: deliveryAddress?.state || "",
      pinCode: deliveryAddress?.pinCode || "",
      country: deliveryAddress?.country || "India",
      geoLocation: resolvedGeoLocation,
    };

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
      deliveryAddress: sanitizedDeliveryAddress,
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
    console.error("CreateOrder ERROR:", error.stack || error.message);
    next(error);
  }
};
