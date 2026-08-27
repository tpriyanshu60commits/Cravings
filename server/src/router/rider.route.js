import express from "express";
import multer from "multer";
import { RiderAuthProtect } from "../middleware/auth.middelware.js";
import {
  GetRiderProfile,
  UpdateRiderProfile,
  UploadRiderDocuments,
  ToggleRiderAvailability,
  UpdateRiderLocation,
  GetRiderDashboard,
  GetRiderEarnings,
  GetRiderOrders,
  GetRiderOrderDetails,
  AcceptAssignedOrder,
  PickupOrder,
  OutForDeliveryOrder,
  DeliverOrder,
} from "../controller/rider.controller.js";

const upload = multer();
const router = express.Router();

router.use(RiderAuthProtect);

// Profile
router.get("/profile", GetRiderProfile);
router.put("/profile", UpdateRiderProfile);

// Documents KYC Upload
router.put(
  "/upload-documents",
  upload.fields([
    { name: "drivingLicense", maxCount: 1 },
    { name: "vehicleRC", maxCount: 1 },
    { name: "vehicleRegistrationCertificate", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
    { name: "insuranceCertificate", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
  ]),
  UploadRiderDocuments
);

// Availability & Location
router.patch("/toggle-availability", ToggleRiderAvailability);
router.patch("/location", UpdateRiderLocation);

// Dashboard & Financials
router.get("/dashboard", GetRiderDashboard);
router.get("/earnings", GetRiderEarnings);

// Deliveries
router.get("/orders", GetRiderOrders);
router.get("/orders/:orderId", GetRiderOrderDetails);
router.patch("/orders/:orderId/accept", AcceptAssignedOrder);
router.patch("/orders/:orderId/pickup", PickupOrder);
router.patch("/orders/:orderId/out-for-delivery", OutForDeliveryOrder);
router.patch("/orders/:orderId/deliver", DeliverOrder);

export default router;






