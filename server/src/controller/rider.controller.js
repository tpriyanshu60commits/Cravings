import Rider from "../models/rider.model.js";
import Order from "../models/order.model.js";
import {
  UploadSingleImage,
  deleteSingleImage,
} from "../utils/image.service.js";


export const GetRiderProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const rider = await Rider.findOne({
      riderId: currentUser._id,
    }).populate("riderId", "-password");

    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Rider profile fetched successfully",
      data: rider,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const UpdateRiderProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { vehicleDetails, currentAddress, financialDetails } = req.body;
    let rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }
    if (vehicleDetails) {
      if (vehicleDetails.vehicleType !== undefined) {
        rider.vehicleDetails.vehicleType = vehicleDetails.vehicleType;
      }
      if (vehicleDetails.vehicleNumber !== undefined) {
        rider.vehicleDetails.vehicleNumber = vehicleDetails.vehicleNumber;
      }
      if (vehicleDetails.vehicleModel !== undefined) {
        rider.vehicleDetails.vehicleModel = vehicleDetails.vehicleModel;
      }
      if (vehicleDetails.vehicleColor !== undefined) {
        rider.vehicleDetails.vehicleColor = vehicleDetails.vehicleColor;
      }
    }

    if (currentAddress) {
      if (currentAddress.address !== undefined) {
        rider.currentAddress.address = currentAddress.address;
      }
      if (currentAddress.city !== undefined) {
        rider.currentAddress.city = currentAddress.city;
      }
      if (currentAddress.state !== undefined) {
        rider.currentAddress.state = currentAddress.state;
      }
      if (currentAddress.pinCode !== undefined) {
        rider.currentAddress.pinCode = currentAddress.pinCode;
      }
      if (currentAddress.country !== undefined) {
        rider.currentAddress.country = currentAddress.country;
      }
    }
    if (financialDetails) {
      if (financialDetails.bankName !== undefined) {
        rider.financialDetails.bankName = financialDetails.bankName;
      }
      if (financialDetails.accountNumber !== undefined) {
        rider.financialDetails.accountNumber = financialDetails.accountNumber;
      }
      if (financialDetails.ifscCode !== undefined) {
        rider.financialDetails.ifscCode = financialDetails.ifscCode;
      }
    }
    await rider.save();
    res.status(200).json({
      message: "Rider profile updated successfully",
      data: rider,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const UploadRiderDocuments = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      const error = new Error("Please select at least one document to upload");
      error.statusCode = 400;
      return next(error);
    }

    const folderPath = "cravings/riders/documents";

    const drivingLicenseFile = req.files?.drivingLicense?.[0];
    if (drivingLicenseFile) {
      if (rider.documents?.drivingLicense?.publicId) {
        try {
          await deleteSingleImage(rider.documents.drivingLicense.publicId);
        } catch (e) {
          console.log("Failed to delete old drivingLicense:", e.message);
        }
      }
      const uploadedDoc = await UploadSingleImage(drivingLicenseFile, folderPath);
      rider.documents.drivingLicense = uploadedDoc;
    }

    const rcFile =
      req.files?.vehicleRC?.[0] ||
      req.files?.vehicleRegistrationCertificate?.[0];
    if (rcFile) {
      if (rider.documents?.vehicleRegistrationCertificate?.publicId) {
        try {
          await deleteSingleImage(
            rider.documents.vehicleRegistrationCertificate.publicId
          );
        } catch (e) {
          console.log("Failed to delete old vehicleRC:", e.message);
        }
      }
      const uploadedDoc = await UploadSingleImage(rcFile, folderPath);
      rider.documents.vehicleRegistrationCertificate = uploadedDoc;
    }

    const insuranceFile =
      req.files?.insurance?.[0] || req.files?.insuranceCertificate?.[0];
    if (insuranceFile) {
      if (rider.documents?.insuranceCertificate?.publicId) {
        try {
          await deleteSingleImage(
            rider.documents.insuranceCertificate.publicId
          );
        } catch (e) {
          console.log("Failed to delete old insurance:", e.message);
        }
      }
      const uploadedDoc = await UploadSingleImage(insuranceFile, folderPath);
      rider.documents.insuranceCertificate = uploadedDoc;
    }
    const aadharFile = req.files?.aadharCard?.[0];
    if (aadharFile) {
      if (rider.documents?.aadharCard?.publicId) {
        try {
          await deleteSingleImage(rider.documents.aadharCard.publicId);
        } catch (e) {
          console.log("Failed to delete old aadharCard:", e.message);
        }
      }
      const uploadedDoc = await UploadSingleImage(aadharFile, folderPath);
      rider.documents.aadharCard = uploadedDoc;
    }

    const panFile = req.files?.panCard?.[0];
    if (panFile) {
      if (rider.documents?.panCard?.publicId) {
        try {
          await deleteSingleImage(rider.documents.panCard.publicId);
        } catch (e) {
          console.log("Failed to delete old panCard:", e.message);
        }
      }
      const uploadedDoc = await UploadSingleImage(panFile, folderPath);
      rider.documents.panCard = uploadedDoc;
    }

    await rider.save();

    res.status(200).json({
      message: "Rider documents uploaded successfully",
      data: rider.documents,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const ToggleRiderAvailability = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const targetAvailability =
      req.body.isAvailable !== undefined
        ? req.body.isAvailable === true || req.body.isAvailable === "true"
        : !rider.isAvailable;

    if (targetAvailability && rider.status !== "active") {
      const error = new Error(
        `Cannot go online. Your account is currently '${rider.status}'. Only active riders can go online.`
      );
      error.statusCode = 400;
      return next(error);
    }

    rider.isAvailable = targetAvailability;
    await rider.save();

    res.status(200).json({
      message: `Rider is now ${rider.isAvailable ? "online" : "offline"}`,
      data: {
        isAvailable: rider.isAvailable,
        status: rider.status,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const UpdateRiderLocation = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      const error = new Error("Both latitude (lat) and longitude (lon) are required");
      error.statusCode = 400;
      return next(error);
    }

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    rider.currentLocation.lat = String(lat);
    rider.currentLocation.lon = String(lon);

    await rider.save();

    res.status(200).json({
      message: "Rider location updated successfully",
      data: rider.currentLocation,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetRiderDashboard = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const activeStatuses = [
      "accepted",
      "preparing",
      "ready",
      "pickedUp",
      "outForDelivery",
    ];

    const activeOrdersCount = await Order.countDocuments({
      riderId: rider._id,
      orderStatus: { $in: activeStatuses },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayDeliveriesCount = await Order.countDocuments({
      riderId: rider._id,
      orderStatus: "delivered",
      updatedAt: { $gte: startOfToday },
    });

    const totalDeliveriesCount = await Order.countDocuments({
      riderId: rider._id,
      orderStatus: "delivered",
    });

    const DELIVERY_FEE = 40;
    const todayEarnings = todayDeliveriesCount * DELIVERY_FEE;
    const totalEarnings = totalDeliveriesCount * DELIVERY_FEE;

    res.status(200).json({
      message: "Rider dashboard statistics fetched successfully",
      data: {
        isAvailable: rider.isAvailable,
        status: rider.status,
        averageRating: rider.averageRating,
        activeOrdersCount,
        todayDeliveriesCount,
        totalDeliveriesCount,
        todayEarnings,
        totalEarnings,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetRiderEarnings = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const deliveredOrders = await Order.find({
      riderId: rider._id,
      orderStatus: "delivered",
    }).sort({ updatedAt: -1 });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const DELIVERY_FEE = 40;

    let todayDeliveriesCount = 0;
    let weeklyDeliveriesCount = 0;

    deliveredOrders.forEach((order) => {
      const orderDate = new Date(order.updatedAt);
      if (orderDate >= startOfToday) {
        todayDeliveriesCount += 1;
      }
      if (orderDate >= startOfWeek) {
        weeklyDeliveriesCount += 1;
      }
    });

    const totalDeliveriesCount = deliveredOrders.length;
    const todayEarnings = todayDeliveriesCount * DELIVERY_FEE;
    const weeklyEarnings = weeklyDeliveriesCount * DELIVERY_FEE;
    const totalEarnings = totalDeliveriesCount * DELIVERY_FEE;

    const transactions = deliveredOrders.map((order) => ({
      orderId: order._id,
      deliveredAt: order.updatedAt,
      deliveryFee: DELIVERY_FEE,
      paymentMethod: order.paymentDetails?.paymentMethod || "upi",
      paymentStatus: order.paymentDetails?.paymentStatus || "completed",
      deliveryAddress: {
        name: order.deliveryAddress?.name || "",
        address: order.deliveryAddress?.address || "",
        city: order.deliveryAddress?.city || "",
      },
    }));

    res.status(200).json({
      message: "Rider earnings fetched successfully",
      data: {
        summary: {
          todayEarnings,
          todayDeliveriesCount,
          weeklyEarnings,
          weeklyDeliveriesCount,
          totalEarnings,
          totalDeliveriesCount,
          perDeliveryFee: DELIVERY_FEE,
        },
        transactions,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetRiderOrders = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const { status } = req.query;

    let query = { riderId: rider._id };


    if (status === "active") {
      query.orderStatus = {
        $in: ["accepted", "preparing", "ready", "pickedUp", "outForDelivery"],
      };
    } else if (status === "completed") {
      query.orderStatus = {
        $in: ["delivered", "undeliverable"],
      };
    } else if (status && status !== "all") {
      query.orderStatus = status;
    }
    const orders = await Order.find(query)
      .populate(
        "restaurantId",
        "restaurantName address city contactDetails geoLocation"
      )
      .populate({
        path: "customerId",
        populate: {
          path: "customerId",
          select: "fullName phone email",
        },
      })
      .sort({ updatedAt: -1 });
    res.status(200).json({
      message: "Rider orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetRiderOrderDetails = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { orderId } = req.params;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }

    const order = await Order.findOne({
      _id: orderId,
      riderId: rider._id,
    })
      .populate(
        "restaurantId",
        "restaurantName address city contactDetails geoLocation"
      )
      .populate({
        path: "customerId",
        populate: {
          path: "customerId",
          select: "fullName phone email",
        },
      });

    if (!order) {
      const error = new Error("Order not found or not assigned to you");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      message: "Order details fetched successfully",
      data: order,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const AcceptAssignedOrder = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { orderId } = req.params;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }
    const order = await Order.findOne({
      _id: orderId,
      riderId: rider._id,
    });

    if (!order) {
      const error = new Error("Order not found or not assigned to you");
      error.statusCode = 404;
      return next(error);
    }
    const allowedStatuses = ["ready", "accepted"];
    if (!allowedStatuses.includes(order.orderStatus)) {
      const error = new Error(
        `Cannot accept order with current status '${order.orderStatus}'`
      );
      error.statusCode = 400;
      return next(error);
    }

    res.status(200).json({
      message: "Order accepted successfully",
      data: order,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const PickupOrder = async (req, res, next) => {
  try {

    const currentUser = req.user;
    const { orderId } = req.params;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }
    const order = await Order.findOne({
      _id: orderId,
      riderId: rider._id,
    });

    if (!order) {
      const error = new Error("Order not found or not assigned to you");
      error.statusCode = 404;
      return next(error);
    }

    const allowedStatuses = ["ready", "accepted"];
    if (!allowedStatuses.includes(order.orderStatus)) {
      const error = new Error(
        `Invalid order status transition from '${order.orderStatus}' to 'pickedUp'`
      );
      error.statusCode = 400;
      return next(error);
    } order.orderStatus = "pickedUp";
    await order.save();
    res.status(200).json({
      message: "Order marked as picked up",
      data: order,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
export const OutForDeliveryOrder = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { orderId } = req.params;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }
    const order = await Order.findOne({
      _id: orderId,
      riderId: rider._id,
    });

    if (!order) {
      const error = new Error("Order not found or not assigned to you");
      error.statusCode = 404;
      return next(error);
    }
    if (order.orderStatus !== "pickedUp") {
      const error = new Error(
        `Invalid order status transition from '${order.orderStatus}' to 'outForDelivery'. Order must be 'pickedUp' first.`
      );
      error.statusCode = 400;
      return next(error);
    }
    order.orderStatus = "outForDelivery";
    await order.save();
    res.status(200).json({
      message: "Order marked as out for delivery",
      data: order,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
export const DeliverOrder = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { orderId } = req.params;

    const rider = await Rider.findOne({ riderId: currentUser._id });
    if (!rider) {
      const error = new Error("Rider profile not found");
      error.statusCode = 404;
      return next(error);
    }
    const order = await Order.findOne({
      _id: orderId,
      riderId: rider._id,
    });
    if (!order) {
      const error = new Error("Order not found or not assigned to you");
      error.statusCode = 404;
      return next(error);
    }
    if (order.orderStatus !== "outForDelivery") {
      const error = new Error(
        `Invalid order status transition from '${order.orderStatus}' to 'delivered'. Order must be 'outForDelivery' first.`
      );
      error.statusCode = 400;
      return next(error);
    }
    order.orderStatus = "delivered";
    await order.save();
    res.status(200).json({
      message: "Order delivered successfully",
      data: order,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

