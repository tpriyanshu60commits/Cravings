import express from "express";
import multer from "multer";
import { RestaurantAuthProtect } from "../middleware/auth.middelware.js";
import { RestaurantUpdateInfo } from "../controller/restaurant.controller.js";
import { RestaurantGetData } from "../controller/restaurant.controller.js";
import { OpenRestaurant } from "../controller/restaurant.controller.js";
import { RestaurantUpdateLegalInfo } from "../controller/restaurant.controller.js";
import { RestaurantUpdateAddress } from "../controller/restaurant.controller.js";
import { RestaurantUpdateBankingDocuments } from "../controller/restaurant.controller.js";
import { RestaurantUpdateSocialMediaLinks } from "../controller/restaurant.controller.js";
import { RestaurantAddMenuItems } from "../controller/restaurant.controller.js";
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
router.get("/get-resturant-data", RestaurantAuthProtect, RestaurantGetData);
router.patch(
  "/change-open-status/:openStatus",
  RestaurantAuthProtect,
  OpenRestaurant,
);
router.put(
  "/update-legal-info",
  RestaurantAuthProtect,
  RestaurantUpdateLegalInfo,
);
router.put("/update-address", RestaurantAuthProtect, RestaurantUpdateAddress);
router.put(
  "/update-banking-documents",
  RestaurantAuthProtect,
  RestaurantUpdateBankingDocuments,
);
router.put(
  "/update-social-media-links",
  RestaurantAuthProtect,
  RestaurantUpdateSocialMediaLinks,
);

router.post(
  "/add-menu-item",
  RestaurantAuthProtect,
  upload.single("itemImage"),
  RestaurantAddMenuItems,
);

export default router;
