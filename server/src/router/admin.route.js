import express from "express";
import { AdminAuthProtect } from "../middleware/auth.middelware.js";
import {
  GetAdminDashboardStats,
  GetAllCustomers,
  GetCustomerDetails,
  UpdateCustomerStatus,
  GetAllRestaurants,
  GetRestaurantDetails,
  UpdateRestaurantStatus,
  GetRestaurantOrders,
  GetAllRiders,
  GetRiderDetails,
  UpdateRiderStatus,
  GetRiderOrders,
  GetRiderEarnings,
  GetAllOrders,
  GetOrderDetails,
  AssignRiderToOrder,
  UpdateOrderStatus,
} from "../controller/admin.controller.js";

const router = express.Router();

router.use(AdminAuthProtect);

// Dashboard
router.get("/dashboard", GetAdminDashboardStats);

// Customers
router.get("/customers", GetAllCustomers);
router.get("/customers/:customerId", GetCustomerDetails);
router.patch("/customers/:customerId/status", UpdateCustomerStatus);

// Restaurants
router.get("/restaurants", GetAllRestaurants);
router.get("/restaurants/:restaurantId", GetRestaurantDetails);
router.patch("/restaurants/:restaurantId/status", UpdateRestaurantStatus);
router.get("/restaurants/:restaurantId/orders", GetRestaurantOrders);

// Riders
router.get("/riders", GetAllRiders);
router.get("/riders/:riderId", GetRiderDetails);
router.patch("/riders/:riderId/status", UpdateRiderStatus);
router.get("/riders/:riderId/orders", GetRiderOrders);
router.get("/riders/:riderId/earnings", GetRiderEarnings);

// Orders & Dispatch
router.get("/orders", GetAllOrders);
router.get("/orders/:orderId", GetOrderDetails);
router.patch("/orders/:orderId/assign-rider", AssignRiderToOrder);
router.patch("/orders/:orderId/status", UpdateOrderStatus);

export default router;
