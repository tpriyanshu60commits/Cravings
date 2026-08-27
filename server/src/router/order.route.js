import express from "express";
import { CustomerAuthProtect } from "../middleware/auth.middelware.js";
import { CreateOrder } from "../controller/order.controller.js";

const router = express.Router();

router.post("/create-order/:restaurantId", CustomerAuthProtect, CreateOrder);

export default router;
