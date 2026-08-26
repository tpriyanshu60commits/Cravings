import express from "express";
import { AuthProtect } from "../middleware/auth.middelware.js";
import { CreateOrder } from "../controller/order.controller.js";

const router = express.Router();

router.post("/create-order/:restaurantId", AuthProtect, CreateOrder);

export default router;
