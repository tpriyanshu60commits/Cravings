import Restaurant from "../models/restaurant.model.js";
import {
  uploadMultipleImages,
  deleteMultipleImages,
  UploadSingleImage,
  deleteSingleImage,
} from "../utils/image.service.js";

export const restaurantUpdateProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const restaurantDataFromFE = req.body;
    const coverImageFromFE = req.files?.coverImage;
    const restaurantImageFromFE = req.files?.restaurantImage;

    const dataKeys = Object.keys(restaurantDataFromFE);

    dataKeys.forEach((key) => {
      if (!restaurantDataFromFE[key]) {
        const error = new Error(`Missing required field: ${key}`);
        error.statusCode = 400;
        return next(error);
      }
    });

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      if (coverImageFromFE) {
        const coverImage = await UploadSingleImage(
          coverImageFromFE,
          `restaurant/${currentUser.phone}/coverPhoto`,
        );
        dataKeys.push("coverImage");
        restaurantDataFromFE.coverImage = coverImage;
      }

      if (restaurantImageFromFE && restaurantImageFromFE.length > 0) {
        const restaurantImage = await uploadMultipleImages(
          restaurantImageFromFE,
          `restaurant/${currentUser.phone}/restaurantPhotos`,
        );
        dataKeys.push("restaurantImage");
        restaurantDataFromFE.restaurantImage = restaurantImage;
      }

      const newRestaurant = await Restaurant.create({
        managerId: currentUser._id,
        ...restaurantDataFromFE,
      });
      return res.status(201).json({
        message: "Restaurant profile created successfully",
        data: newRestaurant,
      });
    } else {
      if (coverImageFromFE) {
        await deleteSingleImage(existingRestaurant.coverImage);

        const coverImage = await UploadSingleImage(
          coverImageFromFE,
          `restaurant/${currentUser.phone}/coverPhoto`,
        );
        dataKeys.push("coverImage");
        restaurantDataFromFE.coverImage = coverImage;
      }
      if (restaurantImageFromFE && restaurantImageFromFE.length > 0) {
        await deleteMultipleImages(existingRestaurant.restaurantImage);

        const restaurantImage = await uploadMultipleImages(
          restaurantImageFromFE,
          `restaurant/${currentUser.phone}/restaurantPhotos`,
        );
        dataKeys.push("restaurantImage");
        restaurantDataFromFE.restaurantImage = restaurantImage;
      }
      dataKeys.forEach((key) => {
        existingRestaurant[key] =
          restaurantDataFromFE[key] || existingRestaurant[key];
      });
      await existingRestaurant.save();
      return res.status(200).json({
        message: "Restaurant profile updated successfully",
        data: existingRestaurant,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};