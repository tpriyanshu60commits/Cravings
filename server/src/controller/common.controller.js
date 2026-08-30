import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.config.js";
import bcrypt from "bcrypt";

export const EditUserProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const newPhoto = req.file;

    console.log("Req Body :", req.body);
    console.log("Req File :", req.file);

    if (!fullName || !phone) {
      const error = new Error("All fields Required");
      error.statusCode = 400;
      return next(error);
    }
    const existingUser = await User.findById(req.user._id);

    if (!existingUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (newPhoto) {
      existingUser?.photo?.publicId &&
        (await cloudinary.uploader.destroy(existingUser.photo.publicId));

      const b64 = Buffer.from(newPhoto.buffer).toString("base64");
      const dataURI = `data:${newPhoto.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "Cravings678/profile",
        width: 500,
        height: 500,
        crop: "fill",
      });

      existingUser.photo.url = result.secure_url;
      existingUser.photo.publicId = result.public_id;
    }

    existingUser.fullName = fullName;
    existingUser.phone = phone;

    await existingUser.save();
    const userResponse = existingUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "User Updated Successfully",
      data: userResponse,
    });
  } catch (error) {
    console.log(error.message);
    return next(error);
  }
};

export const UpdateUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      const error = new Error("All fields Required");
      error.statusCode = 400;
      return next(error);
    }

    // User Already Verified By Auth Protect Middleware
    // const existingUser = await User.findOne({ email });
    // if (!existingUser) {
    //   const error = new Error("Email not registred");
    //   error.statusCode = 404;
    //   return next(error);
    // }

    // we can use req.user to get the current user since the user is already verified by the auth protect middleware
    const currentUser = req.user;

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      currentUser.password,
    );
    if (!isPasswordMatch) {
      const error = new Error("Old password is incorrect");
      error.statusCode = 400;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(currentUser._id, {
      $set: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};