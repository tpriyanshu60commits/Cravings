import express from "express";
import multer from "multer";
import { RestaurantAuthProtect } from "../middleware/auth.middelware.js";
import { RestaurantUpdateInfo } from "../controller/restaurant.controller.js";
const upload = multer();
const router = express.Router();

// router.post(
//   "/update-profile",
//   RestaurantAuthProtect,
//   upload.single("coverImage"),
//   upload.array("restaurantImage", 10),
//   restaurantUpdateProfile,
// );
router.put(
  "/update-restaurant-info",
  RestaurantAuthProtect,
  RestaurantUpdateInfo,
);

export default router;
