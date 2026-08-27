import express from "express";
import { CustomerAuthProtect } from "../middleware/auth.middelware.js";
import {
  GetAddressBook,
  AddAddress,
  UpdateAddress,
  DeleteAddress,
  GetAllOrders,
  GetCustomerOrderDetails,
} from "../controller/customer.controller.js";

const router = express.Router();

router.use(CustomerAuthProtect);

router.get("/address-book", GetAddressBook);
router.post("/address-book", AddAddress);
router.put("/address-book/:addressId", UpdateAddress);
router.delete("/address-book/:addressId", DeleteAddress);

router.get("/all-orders", GetAllOrders);
router.get("/orders/:orderId", GetCustomerOrderDetails);

export default router;
