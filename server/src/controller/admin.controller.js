import Customer from "../models/customer.model.js";
import Restaurant from "../models/restaurant.model.js";
import Rider from "../models/rider.model.js";
import Order from "../models/order.model.js";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import Menu from "../models/menu.model.js";

export const GetAdminDashboardStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalCustomers = await Customer.countDocuments();
    const verifiedCustomers = await Customer.countDocuments({
      status: "verified",
    });
    const pendingCustomers = await Customer.countDocuments({
      status: "pending",
    });
    const suspendedCustomers = await Customer.countDocuments({
      status: "suspended",
    });

    const totalRestaurants = await Restaurant.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({
      status: "active",
    });
    const pendingRestaurants = await Restaurant.countDocuments({
      status: { $in: ["inactive", "pending"] },
    });
    const blockedRestaurants = await Restaurant.countDocuments({
      status: "blocked",
    });

    const totalRiders = await Rider.countDocuments();
    const activeRiders = await Rider.countDocuments({ status: "active" });
    const availableRiders = await Rider.countDocuments({
      status: "active",
      isAvailable: true,
    });
    const pendingRiders = await Rider.countDocuments({
      status: { $in: ["pending", "inactive"] },
    });
    const blockedRiders = await Rider.countDocuments({ status: "blocked" });

    const totalOrders = await Order.countDocuments();
    const activeDeliveries = await Order.countDocuments({
      orderStatus: {
        $in: ["accepted", "preparing", "ready", "pickedUp", "outForDelivery"],
      },
    });
    const deliveredOrders = await Order.countDocuments({
      orderStatus: "delivered",
    });
    const cancelledOrders = await Order.countDocuments({
      orderStatus: {
        $in: ["cancelled", "failed", "rejected", "undeliverable"],
      },
    });

    const completedOrders = await Order.find({
      "paymentDetails.paymentStatus": "completed",
    });

    let totalRevenue = 0;
    let todayRevenue = 0;

    completedOrders.forEach((order) => {
      const amount = order.billDetails?.finalAmount || 0;
      totalRevenue += amount;

      const orderDate = new Date(order.updatedAt || order.createdAt);
      if (orderDate >= startOfToday) {
        todayRevenue += amount;
      }
    });
    res.status(200).json({
      message: "Admin dashboard statistics fetched successfully",
      data: {
        customers: {
          total: totalCustomers,
          verified: verifiedCustomers,
          pending: pendingCustomers,
          suspended: suspendedCustomers,
        },
        restaurants: {
          total: totalRestaurants,
          active: activeRestaurants,
          pendingApproval: pendingRestaurants,
          blocked: blockedRestaurants,
        },
        riders: {
          total: totalRiders,
          active: activeRiders,
          available: availableRiders,
          pendingApproval: pendingRiders,
          blocked: blockedRiders,
        },
        orders: {
          total: totalOrders,
          activeDeliveries,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        revenue: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          todayRevenue: Math.round(todayRevenue * 100) / 100,
        },
        pendingApprovals: {
          riders: pendingRiders,
          restaurants: pendingRestaurants,
          customers: pendingCustomers,
        },
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetAllCustomers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let customerFilter = {};
    if (status) {
      customerFilter.status = status;
    }
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");

      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { phone: { $regex: searchRegex } },
        ],
      }).select("_id");
      const userIds = matchingUsers.map((user) => user._id);

      customerFilter.customerId = { $in: userIds };
    }
    const customers = await Customer.find(customerFilter)
      .populate("customerId", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetCustomerDetails = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    let customer = await Customer.findById(customerId).populate(
      "customerId",
      "-password"
    );
    if (!customer) {
      customer = await Customer.findOne({ customerId }).populate(
        "customerId",
        "-password"
      );
    }
    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      return next(error);
    }
    const orders = await Order.find({ customerId: customer._id })
      .populate("restaurantId", "restaurantName address city contactDetails")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Customer details fetched successfully",
      data: {
        customer,
        orders,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const UpdateCustomerStatus = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { status, isActive } = req.body;

    let customer = await Customer.findById(customerId);
    if (!customer) {
      customer = await Customer.findOne({ customerId });
    }
    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      return next(error);
    }

    const updateFields = {};

    if (status) {
      const allowedStatuses = ["pending", "verified", "suspended"];
      if (!allowedStatuses.includes(status)) {
        const error = new Error(
          `Invalid status '${status}'. Allowed values are: ${allowedStatuses.join(", ")}`
        );
        error.statusCode = 400;
        return next(error);
      }
      updateFields.status = status;
      if (status === "suspended") {
        updateFields.isActive = false;
      } else if (status === "verified") {
        updateFields.isActive = true;
      }
    } else {
      if (customer.status === "verified") {
        updateFields.status = "suspended";
        updateFields.isActive = false;
      } else {
        updateFields.status = "verified";
        updateFields.isActive = true;
      }
    }

    if (typeof isActive === "boolean") {
      updateFields.isActive = isActive;
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customer._id,
      { $set: updateFields },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      message: "Customer status updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// GET /admin/restaurants
export const GetAllRestaurants = async (req, res, next) => {
  try {
    // 1. Extract query parameters (status, search, isOpen, city)
    const { status, search, isOpen, city } = req.query;

    // 2. Prepare filter object
    let restaurantFilter = {};

    // 3. Status filter: 'active', 'inactive', 'pending', 'blocked'
    if (status) {
      const allowedStatuses = ["active", "inactive", "pending", "blocked"];
      if (allowedStatuses.includes(status)) {
        if (status === "inactive" || status === "pending") {
          restaurantFilter.status = { $in: ["inactive", "pending"] };
        } else {
          restaurantFilter.status = status;
        }
      }
    }

    // 4. Filter by open/closed status if provided
    if (isOpen !== undefined) {
      restaurantFilter.isOpen = isOpen === "true" || isOpen === true;
    }

    // 5. Filter by city if provided
    if (city && city.trim() !== "") {
      restaurantFilter.city = new RegExp(city.trim(), "i");
    }

    // 6. Search across restaurantName, address, or city with regex
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      restaurantFilter.$or = [
        { restaurantName: { $regex: searchRegex } },
        { address: { $regex: searchRegex } },
        { city: { $regex: searchRegex } },
      ];
    }

    // 7. Fetch all matching restaurants with populated manager details (excluding password)
    const restaurants = await Restaurant.find(restaurantFilter)
      .populate("managerId", "-password")
      .sort({ createdAt: -1 });

    // 8. Return response
    res.status(200).json({
      message: "Restaurants fetched successfully",
      data: restaurants,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
export const GetRestaurantDetails = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    let restaurant = await Restaurant.findById(restaurantId).populate(
      "managerId",
      "-password"
    );
    if (!restaurant) {
      restaurant = await Restaurant.findOne({
        managerId: restaurantId,
      }).populate("managerId", "-password");
    }
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }
    const menuDoc = await Menu.findOne({ restaurantId: restaurant._id });
    const menuItems = menuDoc ? menuDoc.menuItems : [];
    res.status(200).json({
      message: "Restaurant details fetched successfully",
      data: {
        restaurant,
        menu: menuItems,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const UpdateRestaurantStatus = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.body;

    if (!status) {
      const error = new Error("Status is required");
      error.statusCode = 400;
      return next(error);
    }

    const allowedStatuses = ["active", "inactive", "pending", "blocked"];
    if (!allowedStatuses.includes(status)) {
      const error = new Error(
        `Invalid status '${status}'. Allowed values are: ${allowedStatuses.join(", ")}`
      );
      error.statusCode = 400;
      return next(error);
    }

    let restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      restaurant = await Restaurant.findOne({ managerId: restaurantId });
    }

    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const updateFields = { status };
    if (status === "blocked" || status === "inactive" || status === "pending") {
      updateFields.isOpen = false;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurant._id,
      { $set: updateFields },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      message: "Restaurant status updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetRestaurantOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.query;

    let restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      restaurant = await Restaurant.findOne({ managerId: restaurantId });
    }

    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    let orderFilter = { restaurantId: restaurant._id };
    if (status) {
      orderFilter.orderStatus = status;
    }

    const orders = await Order.find(orderFilter)
      .populate({
        path: "customerId",
        populate: {
          path: "customerId",
          select: "fullName email phone photo",
        },
      })
      .populate({
        path: "riderId",
        populate: {
          path: "riderId",
          select: "fullName phone",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Restaurant orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetAllRiders = async (req, res, next) => {
  try {
    const { status, isAvailable, search } = req.query;

    let riderFilter = {};

    if (status) {
      const allowedStatuses = ["pending", "active", "inactive", "blocked"];
      if (allowedStatuses.includes(status)) {
        if (status === "pending" || status === "inactive") {
          riderFilter.status = { $in: ["pending", "inactive"] };
        } else {
          riderFilter.status = status;
        }
      }
    }

    if (isAvailable !== undefined) {
      riderFilter.isAvailable = isAvailable === "true" || isAvailable === true;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");

      const matchingUsers = await User.find({
        userType: "rider",
        $or: [
          { fullName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { phone: { $regex: searchRegex } },
        ],
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);

      riderFilter.$or = [
        { riderId: { $in: userIds } },
        { "vehicleDetails.vehicleNumber": { $regex: searchRegex } },
        { "vehicleDetails.vehicleType": { $regex: searchRegex } },
        { "currentAddress.city": { $regex: searchRegex } },
      ];
    }

    const riders = await Rider.find(riderFilter)
      .populate("riderId", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Riders fetched successfully",
      data: riders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetRiderDetails = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    let rider = await Rider.findById(riderId).populate("riderId", "-password");
    if (!rider) {
      rider = await Rider.findOne({ riderId }).populate(
        "riderId",
        "-password"
      );
    }

    if (!rider) {
      const error = new Error("Rider not found");
      error.statusCode = 404;
      return next(error);
    }

    const activeOrders = await Order.find({
      riderId: rider._id,
      orderStatus: { $in: ["ready", "pickedUp", "outForDelivery"] },
    })
      .populate("restaurantId", "restaurantName address contactDetails")
      .sort({ createdAt: -1 });

    const totalDeliveredOrders = await Order.countDocuments({
      riderId: rider._id,
      orderStatus: "delivered",
    });

    res.status(200).json({
      message: "Rider details fetched successfully",
      data: {
        rider,
        activeOrders,
        activeOrderLoad: activeOrders.length,
        totalCompletedDeliveries: totalDeliveredOrders,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const UpdateRiderStatus = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const { status } = req.body;

    if (!status) {
      const error = new Error("Status is required");
      error.statusCode = 400;
      return next(error);
    }

    const allowedStatuses = ["pending", "active", "inactive", "blocked"];
    if (!allowedStatuses.includes(status)) {
      const error = new Error(
        `Invalid status '${status}'. Allowed values are: ${allowedStatuses.join(", ")}`
      );
      error.statusCode = 400;
      return next(error);
    }

    let rider = await Rider.findById(riderId);
    if (!rider) {
      rider = await Rider.findOne({ riderId });
    }

    if (!rider) {
      const error = new Error("Rider not found");
      error.statusCode = 404;
      return next(error);
    }

    const updateFields = { status };
    if (status === "blocked" || status === "inactive") {
      updateFields.isAvailable = false;
    }

    const updatedRider = await Rider.findByIdAndUpdate(
      rider._id,
      { $set: updateFields },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      message: "Rider status updated successfully",
      data: updatedRider,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetRiderOrders = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const { status } = req.query;

    let rider = await Rider.findById(riderId);
    if (!rider) {
      rider = await Rider.findOne({ riderId });
    }

    if (!rider) {
      const error = new Error("Rider not found");
      error.statusCode = 404;
      return next(error);
    }

    let orderFilter = { riderId: rider._id };
    if (status) {
      orderFilter.orderStatus = status;
    }

    const orders = await Order.find(orderFilter)
      .populate("restaurantId", "restaurantName address contactDetails")
      .populate({
        path: "customerId",
        populate: {
          path: "customerId",
          select: "fullName email phone photo",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Rider orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetRiderEarnings = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    let rider = await Rider.findById(riderId);
    if (!rider) {
      rider = await Rider.findOne({ riderId });
    }

    if (!rider) {
      const error = new Error("Rider not found");
      error.statusCode = 404;
      return next(error);
    }

    const deliveredOrders = await Order.find({
      riderId: rider._id,
      orderStatus: "delivered",
    }).sort({ createdAt: -1 });

    const DELIVERY_FEE = 40;
    const totalDeliveries = deliveredOrders.length;
    const totalEarnings = totalDeliveries * DELIVERY_FEE;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let todayDeliveries = 0;
    deliveredOrders.forEach((order) => {
      const orderDate = new Date(order.updatedAt || order.createdAt);
      if (orderDate >= startOfToday) {
        todayDeliveries += 1;
      }
    });

    const todayEarnings = todayDeliveries * DELIVERY_FEE;

    res.status(200).json({
      message: "Rider earnings report fetched successfully",
      data: {
        riderId: rider._id,
        perDeliveryFee: DELIVERY_FEE,
        totalDeliveries,
        totalEarnings,
        todayDeliveries,
        todayEarnings,
        deliveredOrders,
      },
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetAllOrders = async (req, res, next) => {
  try {
    const { status, restaurantId, customerId, riderId, startDate, endDate, search } =
      req.query;

    let filter = {};

    if (status) {
      filter.orderStatus = status;
    }
    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }
    if (customerId) {
      filter.customerId = customerId;
    }
    if (riderId) {
      filter.riderId = riderId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search && search.trim() !== "") {
      const searchTrim = search.trim();
      const searchRegex = new RegExp(searchTrim, "i");
      const isObjectId = mongoose.Types.ObjectId.isValid(searchTrim) && searchTrim.length === 24;

      const [matchingUsers, matchingRestaurants] = await Promise.all([
        User.find({
          $or: [
            { fullName: { $regex: searchRegex } },
            { email: { $regex: searchRegex } },
            { phone: { $regex: searchRegex } },
          ],
        }).select("_id"),
        Restaurant.find({
          restaurantName: { $regex: searchRegex },
        }).select("_id"),
      ]);

      const userIds = matchingUsers.map((u) => u._id);
      const restIds = matchingRestaurants.map((r) => r._id);

      const [matchingCustomers, matchingRiders] = await Promise.all([
        Customer.find({ customerId: { $in: userIds } }).select("_id"),
        Rider.find({ riderId: { $in: userIds } }).select("_id"),
      ]);

      const customerDocIds = matchingCustomers.map((c) => c._id);
      const riderDocIds = matchingRiders.map((r) => r._id);

      const orConditions = [
        { "deliveryAddress.name": { $regex: searchRegex } },
        { "deliveryAddress.phone": { $regex: searchRegex } },
        { "deliveryAddress.city": { $regex: searchRegex } },
        { restaurantId: { $in: restIds } },
        { customerId: { $in: customerDocIds } },
        { riderId: { $in: riderDocIds } },
      ];

      if (isObjectId) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(searchTrim) });
      }

      filter.$or = orConditions;
    }

    const orders = await Order.find(filter)
      .populate("restaurantId", "restaurantName address contactDetails")
      .populate({
        path: "customerId",
        populate: {
          path: "customerId",
          select: "fullName email phone photo",
        },
      })
      .populate({
        path: "riderId",
        populate: {
          path: "riderId",
          select: "fullName phone",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const GetOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate(
        "restaurantId",
        "restaurantName address city state pinCode geoLocation contactDetails legal"
      )
      .populate({
        path: "customerId",
        populate: {
          path: "customerId",
          select: "fullName email phone photo dob gender",
        },
      })
      .populate({
        path: "riderId",
        populate: {
          path: "riderId",
          select: "fullName phone photo",
        },
      });

    if (!order) {
      const error = new Error("Order not found");
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

export const AssignRiderToOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    if (!riderId) {
      const error = new Error("Rider ID is required");
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    const validStatusesForAssignment = [
      "ready",
      "accepted",
      "preparing",
    ];
    if (!validStatusesForAssignment.includes(order.orderStatus)) {
      const error = new Error(
        `Cannot assign rider to order with current status '${order.orderStatus}'`
      );
      error.statusCode = 400;
      return next(error);
    }

    let rider = await Rider.findById(riderId);
    if (!rider) {
      rider = await Rider.findOne({ riderId });
    }

    if (!rider) {
      const error = new Error("Rider not found");
      error.statusCode = 404;
      return next(error);
    }

    if (rider.status !== "active") {
      const error = new Error("Cannot assign order to a non-active rider");
      error.statusCode = 400;
      return next(error);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      { $set: { riderId: rider._id } },
      { new: true, runValidators: false }
    )
      .populate("restaurantId", "restaurantName address contactDetails")
      .populate({
        path: "riderId",
        populate: {
          path: "riderId",
          select: "fullName phone",
        },
      });

    res.status(200).json({
      message: "Rider assigned to order successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const UpdateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, cancellationReason, paymentStatus } = req.body;

    if (!status) {
      const error = new Error("Status is required");
      error.statusCode = 400;
      return next(error);
    }

    const allowedStatuses = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "pickedUp",
      "outForDelivery",
      "undeliverable",
      "delivered",
      "cancelled",
      "failed",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      const error = new Error(
        `Invalid status '${status}'. Allowed statuses are: ${allowedStatuses.join(", ")}`
      );
      error.statusCode = 400;
      return next(error);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    const updateFields = { orderStatus: status };

    if (cancellationReason) {
      updateFields.cancellationReason = cancellationReason;
    }

    if (paymentStatus) {
      updateFields["paymentDetails.paymentStatus"] = paymentStatus;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      { $set: updateFields },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

