import express from "express";
import { CustomerAuthProtect } from "../middleware/auth.middelware.js";
import {
  GetAddressBook,
  AddAddress,
  UpdateAddress,
  DeleteAddress,
  GetAllOrders,
  GetCustomerOrderDetails,
  ConfirmOrderDeliveryByCustomer,
} from "../controller/customer.controller.js";

const router = express.Router();

router.use(CustomerAuthProtect);

router.get("/address-book", GetAddressBook);
router.post("/address-book", AddAddress);
router.put("/address-book/:addressId", UpdateAddress);
router.delete("/address-book/:addressId", DeleteAddress);

router.get("/all-orders", GetAllOrders);
router.get("/orders/:orderId", GetCustomerOrderDetails);
router.patch("/orders/:orderId/confirm-delivery", ConfirmOrderDeliveryByCustomer);
router.patch("/orders/:orderId/confirm-received", ConfirmOrderDeliveryByCustomer);
router.post("/orders/:orderId/confirm-delivery", ConfirmOrderDeliveryByCustomer);

export default router;
