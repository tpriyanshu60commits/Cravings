import express from "express";
import { ContactUsForm } from "../controller/public.controller.js";
import { GetAllRestaurants } from "../controller/public.controller.js";
import { GetRestaurantDetails } from "../controller/public.controller.js";

const router = express.Router();

router.post("/contact-us", ContactUsForm);
router.get("/restaurants", GetAllRestaurants);
router.get("/restaurant-detail/:restaurantId", GetRestaurantDetails);

export default router;
