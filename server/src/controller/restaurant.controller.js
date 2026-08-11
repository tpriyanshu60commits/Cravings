import Restaurant from "../models/restaurant.model.js";
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
    const openStatus = req.params.openStatus;

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
    existingRestaurant.isOpen = openStatus;
    await existingRestaurant.save();
    return res.status(200).json({
      message: `${openStatus === "true" ? "Restaurant is live now" : "Restaurant is offline"}`,
      data: existingRestaurant,
    });
  } catch (error) {
    console.log(error.message);
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
}
