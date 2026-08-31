import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
export const AddAddress = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const {
      name,
      address,
      city,
      state,
      pinCode,
      country,
      addressType,
      isDefault,
      geoLat,
      geoLon,
      geoLocation,
    } = req.body;

    if (
      !name ||
      !address ||
      !city ||
      !state ||
      !pinCode ||
      !country ||
      !addressType
    ) {
      const error = new Error("All required fields must be provided");
      error.statusCode = 400;
      return next(error);
    }

    const finalLat = String(geoLat || geoLocation?.lat || "").trim();
    const finalLon = String(geoLon || geoLocation?.lon || "").trim();

    let customer = await Customer.findOne({
      customerId: currentUser._id,
    });

    if (!customer) {
      customer = await Customer.create({
        customerId: currentUser._id,
        addressBook: [
          {
            name,
            address,
            city,
            state,
            pinCode,
            country,
            addressType,
            isDefault: isDefault === true || isDefault === "true",
            geoLocation: {
              lat: finalLat,
              lon: finalLon,
            },
          },
        ],
      });
    } else {
      if (isDefault === true || isDefault === "true") {
        customer.addressBook.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      customer.addressBook.push({
        name,
        address,
        city,
        state,
        pinCode,
        country,
        addressType,
        isDefault: isDefault === true || isDefault === "true",
        geoLocation: {
          lat: finalLat,
          lon: finalLon,
        },
      });

      await customer.save();
    }

    return res.status(201).json({
      message: "Address added successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    console.error("AddAddress ERROR:", error.stack || error.message);
    next(error);
  }
};

export const UpdateAddress = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { addressId } = req.params;

    const {
      name,
      address,
      city,
      state,
      pinCode,
      country,
      addressType,
      isDefault,
      geoLat,
      geoLon,
      geoLocation,
    } = req.body;

    const customer = await Customer.findOne({
      customerId: currentUser._id,
    });
    if (!customer) {
      const error = new Error("Customer profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const existingAddress = customer.addressBook.id(addressId);
    if (!existingAddress) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      return next(error);
    }
    const shouldBeDefault = isDefault === true || isDefault === "true";
    if (shouldBeDefault) {
      customer.addressBook.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    if (name !== undefined) existingAddress.name = name;
    if (address !== undefined) existingAddress.address = address;
    if (city !== undefined) existingAddress.city = city;
    if (state !== undefined) existingAddress.state = state;
    if (pinCode !== undefined) existingAddress.pinCode = pinCode;
    if (country !== undefined) existingAddress.country = country;
    if (addressType !== undefined) existingAddress.addressType = addressType;
    if (isDefault !== undefined) existingAddress.isDefault = shouldBeDefault;

    const finalLat = geoLat !== undefined ? geoLat : geoLocation?.lat;
    const finalLon = geoLon !== undefined ? geoLon : geoLocation?.lon;
    if (finalLat !== undefined) existingAddress.geoLocation.lat = String(finalLat).trim();
    if (finalLon !== undefined) existingAddress.geoLocation.lon = String(finalLon).trim();

    customer.markModified("addressBook");
    await customer.save();
    return res.status(200).json({
      message: "Address updated successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    console.error("UpdateAddress ERROR:", error.stack || error.message);
    next(error);
  }
};

export const DeleteAddress = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { addressId } = req.params;

    const customer = await Customer.findOne({ customerId: currentUser._id });
    if (!customer) {
      const error = new Error("Customer profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const existingAddress = customer.addressBook.id(addressId);
    if (!existingAddress) {
      const error = new Error("existing Address not found");
      error.statusCode = 404;
      return next(error);
    }
    await existingAddress.deleteOne();
    await customer.save();
    return res.status(200).json({
      message: "Address deleted successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const GetAddressBook = async (req, res, next) => {
  try {
    const currentUser = req.user;

    let customer = await Customer.findOne({
      customerId: currentUser._id,
    });

    if (!customer) {
      customer = await Customer.create({
        customerId: currentUser._id,
        addressBook: [],
      });
    }

    return res.status(200).json({
      message: "Address book fetched successfully",
      data: customer.addressBook || [],
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
export const GetAllOrders = async (req, res, next) => {
  try {
    const currentUser = req.user;
    let customer = await Customer.findOne({ customerId: currentUser._id });
    if (!customer) {
      customer = await Customer.create({
        customerId: currentUser._id,
        addressBook: [],
      });
    }
    const allOrder = await Order.find({ customerId: customer._id })
      .populate("restaurantId", "restaurantName address city contactDetails")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "All Order Fetched", data: allOrder });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const GetCustomerOrderDetails = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { orderId } = req.params;

    // 1. Find customer profile of logged-in user
    const customer = await Customer.findOne({
      customerId: currentUser._id,
    });

    if (!customer) {
      const error = new Error("Customer profile not found");
      error.statusCode = 404;
      return next(error);
    }

    // 2. Find order AND verify it belongs to this customer
    const order = await Order.findOne({
      _id: orderId,
      customerId: customer._id,
    })
      .populate(
        "restaurantId",
        "restaurantName address city contactDetails geoLocation"
      )
      .populate({
        path: "riderId",
        select: "vehicleDetails currentLocation averageRating isAvailable status",
      });

    if (!order) {
      const error = new Error(
        "Order not found or you are not authorized to view this order"
      );
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      message: "Order details fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error("GetCustomerOrderDetails ERROR:", error.stack || error.message);
    next(error);
  }
};

export const ConfirmOrderDeliveryByCustomer = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { orderId } = req.params;

    const customer = await Customer.findOne({
      customerId: currentUser._id,
    });
    if (!customer) {
      const error = new Error("Customer profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const order = await Order.findOne({
      _id: orderId,
      customerId: customer._id,
    });

    if (!order) {
      const error = new Error(
        "Order not found or you are not authorized to confirm this order"
      );
      error.statusCode = 404;
      return next(error);
    }

    if (order.orderStatus !== "outForDelivery") {
      const error = new Error(
        `Cannot confirm delivery because order is currently '${order.orderStatus}'. Confirmation is only available when the order is 'outForDelivery'.`
      );
      error.statusCode = 400;
      return next(error);
    }

    if (Array.isArray(order.orderItems)) {
      order.orderItems.forEach((item, index) => {
        if (!item.itemName) item.itemName = `Item #${index + 1}`;
        if (item.itemPrice === undefined || item.itemPrice === null) item.itemPrice = "0";
        if (item.quantity === undefined || item.quantity === null) item.quantity = "1";
      });
    }

    if (!order.deliveryConfirmation) {
      order.deliveryConfirmation = {
        riderConfirmed: false,
        customerConfirmed: false,
      };
    }

    order.deliveryConfirmation.customerConfirmed = true;
    order.deliveryConfirmation.customerConfirmedAt = new Date();

    let message = "Order received confirmed by customer. Waiting for rider confirmation.";

    // Only transition to 'delivered' when BOTH rider and customer have confirmed
    if (order.deliveryConfirmation.riderConfirmed === true) {
      order.orderStatus = "delivered";
      message = "Delivery confirmed by both customer and rider. Order completed successfully!";
    } else {
      order.orderStatus = "outForDelivery";
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate(
        "restaurantId",
        "restaurantName address city contactDetails geoLocation"
      )
      .populate({
        path: "riderId",
        select: "vehicleDetails currentLocation averageRating isAvailable status",
      });

    res.status(200).json({
      message,
      data: populatedOrder,
    });
  } catch (error) {
    console.error("ConfirmOrderDeliveryByCustomer ERROR:", error.stack || error.message);
    next(error);
  }
};