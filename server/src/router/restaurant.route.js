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
import { RestaurantMenuItems } from "../controller/restaurant.controller.js";
import { RestaurantUpdateCoverPhoto } from "../controller/restaurant.controller.js";
import { RestaurantUpdateRestaurantImages } from "../controller/restaurant.controller.js";
import { RestaurantUpdateMenuItemStatus } from "../controller/restaurant.controller.js";
import { RestaurantDeleteMenuItem } from "../controller/restaurant.controller.js";
import { RestaurantToggleMenuItemControl } from "../controller/restaurant.controller.js";
import {
  GetRestaurantOrders,
  AcceptRestaurantOrder,
  PrepareRestaurantOrder,
  ReadyRestaurantOrder,
  RestaurantUpdateMenuItem,
  RestaurantDeleteRestaurantImage,
} from "../controller/restaurant.controller.js";
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
  router.get("/get-restaurant-data", RestaurantAuthProtect, RestaurantGetData);
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

router.put(
  "/update-cover-photo",
  RestaurantAuthProtect,
  upload.single("coverImage"),
  RestaurantUpdateCoverPhoto,
);
router.put(
  "/update-restaurant-images",
  RestaurantAuthProtect,
  upload.array("restaurantImages", 8),
  RestaurantUpdateRestaurantImages,
);
router.delete(
  "/restaurant-image/:imageId",
  RestaurantAuthProtect,
  RestaurantDeleteRestaurantImage,
);

router.post(
  "/add-menu-item",
  RestaurantAuthProtect,
  upload.single("itemImage"),
  RestaurantAddMenuItems,
);
router.get("/menu-items", RestaurantAuthProtect, RestaurantMenuItems);
router.patch(
  "/menu-item/:itemId/status",
  RestaurantAuthProtect,
  RestaurantUpdateMenuItemStatus,
);
router.delete(
  "/menu-item/:itemId",
  RestaurantAuthProtect,
  RestaurantDeleteMenuItem,
);

router.patch(
  "/menu-item/:itemId/control",
  RestaurantAuthProtect,
  RestaurantToggleMenuItemControl,
);
// new routes
router.get(
  "/orders",
  RestaurantAuthProtect,
  GetRestaurantOrders
);

router.patch(
  "/orders/:orderId/accept",
  RestaurantAuthProtect,
  AcceptRestaurantOrder
);

router.patch(
  "/orders/:orderId/preparing",
  RestaurantAuthProtect,
  PrepareRestaurantOrder
);

router.patch(
  "/orders/:orderId/ready",
  RestaurantAuthProtect,
  ReadyRestaurantOrder
);

router.put(
  "/menu-item/:itemId",
  RestaurantAuthProtect,
  upload.single("itemImage"),
  RestaurantUpdateMenuItem
);
export default router;
