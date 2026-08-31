import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";
import Order from "../models/order.model.js";
import {
  uploadMultipleImages,
  deleteMultipleImages,
  UploadSingleImage,
  deleteSingleImage,
} from "../utils/image.service.js";

// export const restaurantUpdateProfile = async (req, res, next) => {
//   try {
//     const currentUser = req.user;
//     const restaurantDataFromFE = req.body;
//     const coverImageFromFE = req.files?.coverImage;
//     const restaurantImageFromFE = req.files?.restaurantImage;

//     const dataKeys = Object.keys(restaurantDataFromFE);

//     dataKeys.forEach((key) => {
//       if (!restaurantDataFromFE[key]) {
//         const error = new Error(`Missing required field: ${key}`);
//         error.statusCode = 400;
//         return next(error);
//       }
//     });

//     const existingRestaurant = await Restaurant.findOne({
//       managerId: currentUser._id,
//     });

//     if (!existingRestaurant) {
//       if (coverImageFromFE) {
//         const coverImage = await UploadSingleImage(
//           coverImageFromFE,
//           `restaurant/${currentUser.phone}/coverPhoto`,
//         );
//         dataKeys.push("coverImage");
//         restaurantDataFromFE.coverImage = coverImage;
//       }

//       if (restaurantImageFromFE && restaurantImageFromFE.length > 0) {
//         const restaurantImage = await uploadMultipleImages(
//           restaurantImageFromFE,
//           `restaurant/${currentUser.phone}/restaurantPhotos`,
//         );
//         dataKeys.push("restaurantImage");
//         restaurantDataFromFE.restaurantImage = restaurantImage;
//       }

//       const newRestaurant = await Restaurant.create({
//         managerId: currentUser._id,
//         ...restaurantDataFromFE,
//       });
//       return res.status(201).json({
//         message: "Restaurant profile created successfully",
//         data: newRestaurant,
//       });
//     } else {
//       if (coverImageFromFE) {
//         await deleteSingleImage(existingRestaurant.coverImage);

//         const coverImage = await UploadSingleImage(
//           coverImageFromFE,
//           `restaurant/${currentUser.phone}/coverPhoto`,
//         );
//         dataKeys.push("coverImage");
//         restaurantDataFromFE.coverImage = coverImage;
//       }
//       if (restaurantImageFromFE && restaurantImageFromFE.length > 0) {
//         await deleteMultipleImages(existingRestaurant.restaurantImage);

//         const restaurantImage = await uploadMultipleImages(
//           restaurantImageFromFE,
//           `restaurant/${currentUser.phone}/restaurantPhotos`,
//         );
//         dataKeys.push("restaurantImage");
//         restaurantDataFromFE.restaurantImage = restaurantImage;
//       }
//       dataKeys.forEach((key) => {
//         existingRestaurant[key] =
//           restaurantDataFromFE[key] || existingRestaurant[key];
//       });
//       await existingRestaurant.save();
//       return res.status(200).json({
//         message: "Restaurant profile updated successfully",
//         data: existingRestaurant,
//       });
//     }
//   } catch (error) {
//     console.log(error.message);
//     next(error);
//   }
// };
export const RestaurantUpdateInfo = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const {
      restaurantName,
      description,
      restaurantType,
      cuisineTypes,
      contactEmail,
      contactPhone,
      openingTime,
      closingTime,
    } = req.body;

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    // Restaurant does not exist → creation requires all fields
    if (!existingRestaurant) {
      if (
        !restaurantName ||
        !description ||
        !restaurantType ||
        !cuisineTypes ||
        !contactEmail ||
        !contactPhone ||
        !openingTime ||
        !closingTime
      ) {
        const error = new Error(
          "All restaurant information fields are required",
        );
        error.statusCode = 400;
        return next(error);
      }

      const cuisineTypesArray = cuisineTypes
        .split(",")
        .map((type) => type.trim());

      const newRestaurant = await Restaurant.create({
        managerId: currentUser._id,
        restaurantName,
        description,
        restaurantType,
        cuisinesTypes: cuisineTypesArray,
        contactDetails: {
          email: contactEmail,
          phone: contactPhone,
        },
        servingHours: {
          openingTime,
          closingTime,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Restaurant information created successfully",
        data: newRestaurant,
      });
    }

    // Restaurant already exists → partial update
    const updateData = {};

    if (restaurantName !== undefined) {
      updateData.restaurantName = restaurantName;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (restaurantType !== undefined) {
      updateData.restaurantType = restaurantType;
    }

    if (cuisineTypes !== undefined) {
      updateData.cuisinesTypes = cuisineTypes
        .split(",")
        .map((type) => type.trim());
    }

    if (contactEmail !== undefined) {
      updateData["contactDetails.email"] = contactEmail;
    }

    if (contactPhone !== undefined) {
      updateData["contactDetails.phone"] = contactPhone;
    }

    if (openingTime !== undefined) {
      updateData["servingHours.openingTime"] = openingTime;
    }

    if (closingTime !== undefined) {
      updateData["servingHours.closingTime"] = closingTime;
    }

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      {
        managerId: currentUser._id,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Restaurant information updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log("RestaurantUpdateInfo ERROR:", error);
    next(error);
  }
};

export const RestaurantGetData = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const managerId = currentUser._id;

    console.log("currentUser:", currentUser);
    console.log("managerId:", managerId);

    const restaurantData = await Restaurant.findOne({
      managerId: managerId,
    });

    if (restaurantData) {
      return res.status(200).json({
        message: "Restaurant Fetched Successfully",
        data: restaurantData,
      });
    }

    return res.status(200).json({
      message: "Restaurant data not found",
      data: {},
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const OpenRestaurant = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const openStatus = req.params.openStatus === "true";

    console.log("openStatus : ", openStatus);
    const managerId = currentUser._id;
    const existingRestaurant = await Restaurant.findOne({
      managerId,
    });
    if (!existingRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }
    await Restaurant.updateOne({ managerId }, { $set: { isOpen: openStatus } });
    existingRestaurant.isOpen = openStatus;
    return res.status(200).json({
      message: `${openStatus === true ? "Restaurant is live now" : "Restaurant is offline"}`,
      data: existingRestaurant,
    });
  } catch (error) {
    console.error("OpenRestaurant ERROR:", error);
    return next(error);
  }
};

export const RestaurantUpdateLegalInfo = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { legalName, companyType } = req.body;

    if (!legalName || !companyType) {
      const error = new Error("All fields required");
      error.statusCode = 400;
      return next(error);
    }

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });
    if (!existingRestaurant) {
      const error = new Error("Restaurant Not Found");
      error.statusCode = 404;
      return next(error);
    }
    await Restaurant.updateOne(
      {
        _id: existingRestaurant._id,
      },
      {
        $set: {
          "legal.legalName": legalName,
          "legal.companyType": companyType,
        },
      },
    );

    const updatedRestaurant = await Restaurant.findById(existingRestaurant._id);
    res.status(200).json({
      message: "Legal information updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const RestaurantUpdateAddress = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { address, city, state, pinCode, country, geoLat, geoLon } = req.body;
    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });
    if (!existingRestaurant) {
      const error = new Error("Restaurant Not Found");
      error.statusCode = 404;
      return next(error);
    }
    const updateData = {
      address: address ?? existingRestaurant.address,
      city: city ?? existingRestaurant.city,
      state: state ?? existingRestaurant.state,
      pinCode: pinCode ?? existingRestaurant.pinCode,
      country: country ?? existingRestaurant.country,
    };
    if (geoLat !== undefined && geoLon !== undefined) {
      updateData.geoLocation = {
        lat: String(geoLat),
        lon: String(geoLon),
      };
    }
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      {
        managerId: currentUser._id,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({
      message: "Address updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const RestaurantUpdateBankingDocuments = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const {
      bankName,
      accountNumber,
      ifscCode,
      gstCertificate,
      fssaiCertificate,
      panCard,
    } = req.body;

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });
    if (!existingRestaurant) {
      const error = new Error("Restaurant Not Found");
      error.statusCode = 404;
      return next(error);
    }
    await Restaurant.updateOne(
      {
        _id: existingRestaurant._id,
      },
      {
        $set: {
          "documents.gstCertificate": gstCertificate,
          "documents.fssaiCertificate": fssaiCertificate,
          "documents.panCard": panCard,
          "financialDetails.bankName": bankName,
          "financialDetails.accountNumber": accountNumber,
          "financialDetails.ifscCode": ifscCode,
        },
      },
    );
    const updatedRestaurant = await Restaurant.findById(existingRestaurant._id);

    res.status(200).json({
      message: "Banking & Documents updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const RestaurantUpdateSocialMediaLinks = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const { socialMediaLinks } = req.body;

    if (!Array.isArray(socialMediaLinks)) {
      const error = new Error("socialMediaLinks must be an array");
      error.statusCode = 400;
      return next(error);
    }

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant Not Found");
      error.statusCode = 404;
      return next(error);
    }
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      {
        managerId: currentUser._id,
      },
      {
        $set: {
          socialMediaLinks: socialMediaLinks,
        },
      },
      {
        new: true,
      },
    );

    res.status(200).json({
      message: "Social media links updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const RestaurantUpdateCoverPhoto = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const coverImageFromFE = req.file;

    if (!coverImageFromFE) {
      const error = new Error("Cover image is required");
      error.statusCode = 400;
      return next(error);
    }

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant Not Found");
      error.statusCode = 404;
      return next(error);
    }

    // Delete old image from Cloudinary
    if (existingRestaurant.coverImage?.publicId) {
      await deleteSingleImage(existingRestaurant.coverImage.publicId);
    }

    // Upload new image
    const coverImage = await UploadSingleImage(
      coverImageFromFE,
      `restaurant/${currentUser.phone}/coverPhoto`,
    );

    // Update only coverImage
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      {
        managerId: currentUser._id,
      },
      {
        $set: {
          coverImage: coverImage,
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      message: "Cover photo updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
export const RestaurantUpdateRestaurantImages = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const restaurantImagesFromFE = req.files;

    if (!restaurantImagesFromFE || restaurantImagesFromFE.length === 0) {
      const error = new Error("At least one restaurant image is required");
      error.statusCode = 400;
      return next(error);
    }

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant Not Found");
      error.statusCode = 404;
      return next(error);
    }

    const currentCount = existingRestaurant.restaurantImage?.length || 0;
    if (currentCount + restaurantImagesFromFE.length > 8) {
      const error = new Error(
        `Cannot have more than 8 gallery images in total. You currently have ${currentCount} image(s).`,
      );
      error.statusCode = 400;
      return next(error);
    }

    // Upload new images to Cloudinary
    const newRestaurantImages = await uploadMultipleImages(
      restaurantImagesFromFE,
      `restaurant/${currentUser.phone}/restaurantPhotos`,
    );

    // Append new images to existing images array (preserves previous images)
    const combinedImages = [
      ...(existingRestaurant.restaurantImage || []),
      ...newRestaurantImages,
    ];

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      {
        managerId: currentUser._id,
      },
      {
        $set: {
          restaurantImage: combinedImages,
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      message: "Restaurant images uploaded successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log("RestaurantUpdateRestaurantImages ERROR:", error.message);
    next(error);
  }
};

export const RestaurantDeleteRestaurantImage = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { imageId } = req.params;
    const publicId = req.query?.publicId || req.body?.publicId;

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant Not Found");
      error.statusCode = 404;
      return next(error);
    }

    // Match image by subdocument _id or publicId
    const imageToDelete = existingRestaurant.restaurantImage.find(
      (img) =>
        img._id?.toString() === imageId ||
        img.publicId === imageId ||
        (publicId && img.publicId === publicId),
    );

    if (!imageToDelete) {
      const error = new Error("Image not found in restaurant gallery");
      error.statusCode = 404;
      return next(error);
    }

    // Remove from Cloudinary if publicId is present
    if (imageToDelete.publicId) {
      try {
        await deleteSingleImage(imageToDelete.publicId);
      } catch (err) {
        console.log("Cloudinary image deletion warning:", err.message);
      }
    }

    // Remove only the target image from database array
    const remainingImages = existingRestaurant.restaurantImage.filter(
      (img) =>
        img._id?.toString() !== imageToDelete._id?.toString() &&
        img.publicId !== imageToDelete.publicId,
    );

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      {
        managerId: currentUser._id,
      },
      {
        $set: {
          restaurantImage: remainingImages,
        },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      message: "Restaurant image deleted successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.log("RestaurantDeleteRestaurantImage ERROR:", error.message);
    next(error);
  }
};

// menu controller

export const RestaurantAddMenuItems = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const {
      itemName,
      itemPrice,
      description,
      category,
      foodType,
      status,
      isTopRated,
      isRecommended,
      isNew,
      isDeleted,
    } = req.body;
    const itemImageFromFE = req.file;
    if (!itemPrice || !description || !category || !foodType || !status) {
      const error = new Error("All fields required");
      error.statusCode = 400;
      return next(error);
    }
    if (!itemImageFromFE) {
      const error = new Error("Item image is required");
      error.statusCode = 400;
      return next(error);
    }
    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }
    console.log("Lets UploadImage");

    const itemImage = await UploadSingleImage(
      itemImageFromFE,
      `restaurant/${currentUser.phone}/menuitems`,
    );
    console.log("itemImage after upload:", itemImage);
    const existingMenuItem = await Menu.findOne({
      restaurantId: existingRestaurant._id,
    });
    if (existingMenuItem) {
      existingMenuItem.menuItems.push({
        itemName,
        description,
        itemPrice,
        category,
        foodType,
        status,
        isTopRated,
        isRecommended,
        isNew,
        isDeleted,
        image: itemImage,
      });
      console.log("Existing Menu Item after push");
      await existingMenuItem.save();
      return res.status(200).json({
        message: "Menu item added successfully",
        data: existingMenuItem,
      });
    } else {
      const newItem = {
        itemName,
        description,
        itemPrice,
        category,
        foodType,
        status,
        isTopRated,
        isRecommended,
        isNew,
        isDeleted,
        image: itemImage,
      };
      const newMenuItem = await Menu.create({
        restaurantId: existingRestaurant._id,
        menuItems: [newItem],
      });
      return res.status(200).json({
        message: "Menu item added successfully",
        data: newMenuItem,
      });
    }
  } catch (error) {
    console.error("RestaurantAddMenuItem ERROR:", error);
    next(error);
  }
};

export const RestaurantMenuItems = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });
    if (!existingRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }
    console.log("Existing Restaurant", existingRestaurant.menuItems);
    const existingMenuItem = await Menu.findOne({
      restaurantId: existingRestaurant._id,
    });
    if (!existingMenuItem) {
      const error = new Error("menu not found");
      error.statusCode = 404;
      return next(error);
    }
    const activeMenuItems = existingMenuItem.menuItems.filter((item) => {
      return !item.isDeleted;
    });
    return res.status(200).json({
      message: "Menu items fetched successfully",
      data: activeMenuItems,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const parseBoolean = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};

const getMenuContext = async (currentUser, itemId, next) => {
  const existingRestaurant = await Restaurant.findOne({
    managerId: currentUser._id,
  });
  if (!existingRestaurant) {
    const error = new Error("Restaurant not found");
    error.statusCode = 404;
    return next(error);
  }
  const existingMenu = await Menu.findOne({
    restaurantId: existingRestaurant._id,
  });
  if (!existingMenu) {
    const error = new Error("Menu Items Not Found");
    error.statusCode = 404;
    return next(error);
  }
  const menuItem = existingMenu.menuItems.id(itemId);
  if (!menuItem) {
    const error = new Error("Menu Item Not Found");
    error.statusCode = 404;
    return next(error);
  }

  return { existingMenu, menuItem, existingRestaurant };
};

export const RestaurantUpdateMenuItem = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { itemId } = req.params;
    const context = await getMenuContext(currentUser, itemId, next);

    if (!context) return;
    const { existingMenu, menuItem } = context;
    const body = req.body || {};
    const { itemName, description, itemPrice, category, foodType, status } =
      body;

    const itemImageFromFE = req.file;
    if (itemName !== undefined) menuItem.itemName = itemName;
    if (description !== undefined) menuItem.description = description;

    if (itemPrice !== undefined && itemPrice !== "") {
      menuItem.itemPrice = Number(itemPrice);
    }
    if (category !== undefined) menuItem.category = category;
    if (foodType !== undefined) menuItem.foodType = foodType;
    if (status !== undefined) menuItem.status = status;

    const isTopRated = parseBoolean(body.isTopRated);
    const isRecommended = parseBoolean(body.isRecommended);
    const isNew = parseBoolean(body.isNew);

    if (isTopRated !== undefined) menuItem.isTopRated = isTopRated;
    if (isRecommended !== undefined) menuItem.isRecommended = isRecommended;
    if (isNew !== undefined) menuItem.isNew = isNew;

    if (itemImageFromFE) {
      const updatedImage = await UploadSingleImage(
        itemImageFromFE,
        `restaurant/${currentUser.phone}/menuItems`,
      );
      if (menuItem.image?.publicId) {
        try {
          await deleteSingleImage(menuItem.image.publicId);
        } catch (err) {
          console.log("Delete old menu image warning:", err.message);
        }
      }
      menuItem.image = updatedImage;
    }
    existingMenu.markModified("menuItems");
    await existingMenu.save();
    return res.status(200).json({
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const RestaurantUpdateMenuItemStatus = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const status = req.query.status || req.body?.status;
    const { itemId } = req.params;

    if (!status) {
      const error = new Error("Status is required");
      error.statusCode = 400;
      return next(error);
    }
    const allowedStatus = ["available", "unavailable", "discontinued"];
    if (!allowedStatus.includes(status)) {
      const error = new Error("Invalid status value");
      error.statusCode = 400;
      return next(error);
    }
    const context = await getMenuContext(currentUser, itemId, next);
    if (!context) return;

    const { existingMenu, menuItem } = context;
    menuItem.status = status;
    existingMenu.markModified("menuItems");
    await existingMenu.save();
    return res.status(200).json({
      message: "Menu item status updated successfully",
      data: menuItem,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const RestaurantToggleMenuItemControl = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { itemId } = req.params;
    const control = req.query.control || req.body?.control;
    const allowedControls = ["isTopRated", "isRecommended", "isNew"];
    if (!allowedControls.includes(control)) {
      const error = new Error("Invalid control value");
      error.statusCode = 400;
      return next(error);
    }
    const context = await getMenuContext(currentUser, itemId, next);
    if (!context) return;
    const { existingMenu, menuItem } = context;
    menuItem[control] = !menuItem[control];
    existingMenu.markModified("menuItems");
    await existingMenu.save();

    return res.status(200).json({
      message: "Menu item control updated successfully",
      data: menuItem,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const RestaurantDeleteMenuItem = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { itemId } = req.params;
    const context = await getMenuContext(currentUser, itemId, next);
    if (!context) return;
    const { existingMenu, menuItem } = context;
    menuItem.isDeleted = true;
    menuItem.status = "discontinued";
    existingMenu.markModified("menuItems");
    await existingMenu.save();
    return res.status(200).json({
      message: "Menu item deleted successfully",
      data: menuItem,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// new controllers of restaurant

export const GetRestaurantOrders = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const orders = await Order.find({
      restaurantId: existingRestaurant._id,
    })
      .populate("customerId", "-password")
      .populate("riderId", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Restaurant orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log("GetRestaurantOrders ERROR:", error.message);
    return next(error);
  }
};

export const AcceptRestaurantOrder = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { orderId } = req.params;

    // Find restaurant belonging to authenticated manager
    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    // Find order belonging to this restaurant
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: existingRestaurant._id,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    // Only pending orders can be accepted
    if (order.orderStatus !== "pending") {
      const error = new Error(
        `Order cannot be accepted because its current status is "${order.orderStatus}"`,
      );
      error.statusCode = 400;
      return next(error);
    }

    // Update only orderStatus
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        restaurantId: existingRestaurant._id,
        orderStatus: "pending",
      },
      {
        $set: {
          orderStatus: "accepted",
        },
      },
      {
        new: true,
        runValidators: false,
      },
    );

    return res.status(200).json({
      message: "Order accepted successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("AcceptRestaurantOrder ERROR:", error.message);
    return next(error);
  }
};
export const PrepareRestaurantOrder = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { orderId } = req.params;

    // Find restaurant belonging to authenticated manager
    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    // Find order belonging to this restaurant
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: existingRestaurant._id,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    // Only accepted orders can move to preparing
    if (order.orderStatus !== "accepted") {
      const error = new Error(
        `Order cannot be moved to preparing because its current status is "${order.orderStatus}"`,
      );
      error.statusCode = 400;
      return next(error);
    }

    // Update only orderStatus
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        restaurantId: existingRestaurant._id,
        orderStatus: "accepted",
      },
      {
        $set: {
          orderStatus: "preparing",
        },
      },
      {
        new: true,
        runValidators: false,
      },
    );

    return res.status(200).json({
      message: "Order is now being prepared",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("PrepareRestaurantOrder ERROR:", error.message);
    return next(error);
  }
};

export const ReadyRestaurantOrder = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { orderId } = req.params;

    // Find restaurant belonging to authenticated manager
    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    // Find order belonging to this restaurant
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: existingRestaurant._id,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    // Only preparing orders can be marked ready
    if (order.orderStatus !== "preparing") {
      const error = new Error(
        `Order cannot be marked ready because its current status is "${order.orderStatus}"`,
      );
      error.statusCode = 400;
      return next(error);
    }

    // Update only orderStatus
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        restaurantId: existingRestaurant._id,
        orderStatus: "preparing",
      },
      {
        $set: {
          orderStatus: "ready",
        },
      },
      {
        new: true,
        runValidators: false,
      },
    );

    return res.status(200).json({
      message: "Order is ready for rider pickup",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("ReadyRestaurantOrder ERROR:", error.message);
    return next(error);
  }
};
