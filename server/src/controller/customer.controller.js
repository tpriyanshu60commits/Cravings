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
              lat: geoLat || "",
              lon: geoLon || "",
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
          lat: geoLat || "",
          lon: geoLon || "",
        },
      });

      await customer.save();
    }

    return res.status(201).json({
      message: "Address added successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    console.log(error.message);
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
    if (geoLat !== undefined) existingAddress.geoLocation.lat = geoLat;
    if (geoLon !== undefined) existingAddress.geoLocation.lon = geoLon;
    customer.markModified("addressBook");
    await customer.save();
    return res.status(200).json({
      message: "Address updated successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    console.log(error.message);
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

    const customer = await Customer.findOne({
      customerId: currentUser._id,
    });

    if (!customer) {
      const error = new Error("Customer profile not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      message: "Address book fetched successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
export const GetAllOrders = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const customer = await Customer.findOne({ customerId: currentUser._id });
    if (!customer) {
      const error = new Error("Customer profile not found");
      error.statusCode = 404;
      return next(error);
    }
    const allOrder = await Order.find({ customerId: customer._id });

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
    console.log("GetCustomerOrderDetails ERROR:", error.message);
    next(error);
  }
};