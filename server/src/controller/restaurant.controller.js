import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";
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
    console.log("CONTROLLER REACHED");
    console.log("REQ.BODY:", req.body);
    const currentUser = req.user;
    const {
      restaurantName,
      description,
      restaurantType,
      cuisinesTypes,
      contactEmail,
      contactPhone,
      openingTime,
      closingTime,
    } = req.body;

    if (
      !restaurantName ||
      !description ||
      !restaurantType ||
      !cuisinesTypes ||
      !contactEmail ||
      !contactPhone ||
      !openingTime ||
      !closingTime
    ) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }
    const cuisinesTypeArray = cuisinesTypes
      .split(",")
      .map((type) => type.trim());
    const existingRestaurant = await Restaurant.findOne({
      managerId: currentUser._id,
    });
    if (!existingRestaurant) {
      const newRestaurant = await Restaurant.create({
        managerId: currentUser._id,
        restaurantName,
        description,
        cuisinesTypes: cuisinesTypeArray,
        restaurantType,
        contactDetails: {
          email: contactEmail,
          phone: contactPhone,
        },
        servingHours: {
          openingTime: openingTime,
          closingTime: closingTime,
        },
      });
      return res.status(201).json({
        message: "Restaurant Profile Created",
        data: newRestaurant,
      });
    } else {
      existingRestaurant.restaurantName = restaurantName;
      existingRestaurant.description = description;
      existingRestaurant.cuisinesTypes = cuisinesTypeArray;
      existingRestaurant.restaurantType = restaurantType;
      existingRestaurant.contactDetails.email = contactEmail;
      existingRestaurant.contactDetails.phone = contactPhone;
      existingRestaurant.servingHours.openingTime = openingTime;
      existingRestaurant.servingHours.closingTime = closingTime;
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

export const RestaurantGetData = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const managerId = req.query.id;
    console.log("currentUser : ", currentUser);
    console.log("managerId : ", managerId);

    if (currentUser._id.toString() !== managerId) {
      const error = new Error("Unauthorized access");
      error.statusCode = 401;
      return next(error);
    }

    const restaurantData = await Restaurant.findOne({ managerId });
    if (restaurantData) {
      res.status(200).json({
        message: "Restaurant Fetched Successfully",
        data: restaurantData,
      });
    } else {
      res.status(200).json({
        message: "Restaurant data not found",
        data: {},
      });
    }
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
    // await existingRestaurant.save();
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
    const { legalName, companyName } = req.body;

    if (!legalName || !companyName) {
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
    existingRestaurant.legal = {
      legalName,
      companyName,
    };
    await existingRestaurant.save();
    res.status(200).json({
      message: "Legal information updated successfully",
      data: existingRestaurant,
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
    existingRestaurant.address = address ?? existingRestaurant.address;
    existingRestaurant.city = city ?? existingRestaurant.city;
    existingRestaurant.state = state ?? existingRestaurant.state;
    existingRestaurant.pinCode = pinCode ?? existingRestaurant.pinCode;
    existingRestaurant.country = country ?? existingRestaurant.country;
    if (geoLat && geoLon) {
      existingRestaurant.geoLocation = {
        lat: String(geoLat),
        lon: String(geoLon),
      };
    }
    await existingRestaurant.save();
    res.status(200).json({
      message: "Address updated successfully",
      data: existingRestaurant,
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
    existingRestaurant.financialDetails = {
      bankName: bankName ?? existingRestaurant.financialDetails?.bankName ?? "",
      accountNumber:
        accountNumber ??
        existingRestaurant.financialDetails?.accountNumber ??
        "",
      ifscCode: ifscCode ?? existingRestaurant.financialDetails?.ifscCode ?? "",
    };
    existingRestaurant.documents = {
      gstCertificate:
        gstCertificate ?? existingRestaurant.documents?.gstCertificate ?? "",
      fssaiCertificate:
        fssaiCertificate ??
        existingRestaurant.documents?.fssaiCertificate ??
        "",
      panCard: panCard ?? existingRestaurant.documents?.panCard ?? "",
    };
    await existingRestaurant.save();
    res.status(200).json({
      message: "Banking & Documents updated successfully",
      data: existingRestaurant,
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
    existingRestaurant.socialMediaLinks = socialMediaLinks;
    await existingRestaurant.save();
    res.status(200).json({
      message: "Social media links updated successfully",
      data: existingRestaurant,
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
    if (existingRestaurant.coverImage?.publicId) {
      await deleteSingleImage(existingRestaurant.coverImage.publicId);
    }
    const coverImage = await UploadSingleImage(
      coverImageFromFE,
      `restaurant/${currentUser.phone}/coverPhoto`,
    );
    existingRestaurant.coverImage = coverImage;
    await existingRestaurant.save();
    return res.status(200).json({
      message: "Cover photo updated successfully",
      data: existingRestaurant,
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

    if (existingRestaurant.restaurantImage?.length > 0) {
      await deleteMultipleImages(existingRestaurant.restaurantImage);
    }

    const restaurantImages = await uploadMultipleImages(
      restaurantImagesFromFE,
      `restaurant/${currentUser.phone}/restaurantPhotos`,
    );
    existingRestaurant.restaurantImage = restaurantImages;

    await existingRestaurant.save();
    return res.status(200).json({
      message: "Restaurant images updated successfully",
      data: existingRestaurant,
    });
  } catch (error) {
    console.log(error.message);
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
    if (existingRestaurant) {
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
      await existingRestaurant.save();
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
    console.log(error.message);
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
  const menuItem = existingMenu.menuItem.id(itemId);
  if (!menuItem) {
    const error = new Error("Menu Item Not Found");
    error.statusCode = 404;
    return next(error);
  }

  return (existingMenu, menuItem, existingRestaurant);
};

export const RestaurantUpdateMenuItem = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { itemId } = req.params;
    const context = await getMenuContext(currentUser, itemId, next);

    if (!context) return;
    const { existingMenu, menuItem } = context;
    const { itemName, description, price, category, foodType, status } =
      req.body;
    const itemImageFromFE = req.file;
    if (itemName !== undefined) menuItem.itemName = itemName;
    if (description !== undefined) menuItem.description = description;
    if (price !== undefined && price !== "") menuItem.price = Number(price);
    if (category !== undefined) menuItem.category = category;
    if (foodType !== undefined) menuItem.foodType = foodType;
    if (status !== undefined) menuItem.status = status;

    const isTopRated = parseBoolean(req.body.isTopRated);
    const isRecommended = parseBoolean(req.body.isRecommended);
    const isNew = parseBoolean(req.body.isNew);

    if (isTopRated !== undefined) menuItem.isTopRated = isTopRated;
    if (isRecommended !== undefined) menuItem.isRecommended = isRecommended;
    if (isNew !== undefined) menuItem.isNew = isNew;

    if (itemImageFromFE) {
      const updatedImage = await UploadSingleImage(
        itemImageFromFE,
        `restaurant/${currentUser.phone}/menuItems`,
      );
      await deleteSingleImage(menuItem.image);
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
