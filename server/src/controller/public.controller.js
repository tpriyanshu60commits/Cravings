import Contact from "../models/contact.model.js";
import Menu from "../models/menu.model.js";
import Restaurant from "../models/restaurant.model.js";

export const ContactUsForm = async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !phone || !subject || !message) {
      const error = new Error("All fields Required");
      error.statusCode = 400;
      return next(error);
    }

    await Contact.create({
      fullName,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      message: "Thanks for Contacting us! You will hear back from us soon",
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const GetAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ status: "active" });
    res.status(200).json({
      data: restaurants,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const GetRestaurantDetails = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      status: "active",
    }).populate({
      path: "managerId",
      select: "-password",
    });

    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const menu = await Menu.findOne({ restaurantId });

    const restaurantDetails = {
      _id: menu?._id || null,
      restaurantId: restaurant,
      menuItems: menu?.menuItems || [],
    };

    res.status(200).json({ data: restaurantDetails });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

