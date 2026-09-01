import User from "../models/user.model.js";
import Customer from "../models/customer.model.js";
import Rider from "../models/rider.model.js";
import bcrypt from "bcrypt";

const userSeed = async () => {
  try {
    const rawUsers = [
      {
        fullName: "Manager1",
        email: "Manager1@gmail.com",
        plainPassword: "Manager@123",
        dob: "2000-01-01",
        gender: "other",
        userType: "restaurant",
        phone: "9876543210",
        photo: { url: "https://placehold.co/600x400?text=M", publicId: null },
      },
      {
        fullName: "Customer1",
        email: "Customer1@gmail.com",
        plainPassword: "Customer@123",
        dob: "2000-01-01",
        gender: "other",
        userType: "customer",
        phone: "9876543210",
        photo: { url: "https://placehold.co/600x400?text=C", publicId: null },
      },
      {
        fullName: "Rider1",
        email: "Rider1@gmail.com",
        plainPassword: "Rider@123",
        dob: "2000-01-01",
        gender: "other",
        userType: "rider",
        phone: "9876543210",
        photo: { url: "https://placehold.co/600x400?text=R", publicId: null },
      },
    ];

    for (const userData of rawUsers) {
      const normalizedEmail = userData.email.toLowerCase().trim();
      let user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        console.log(`Creating new ${userData.userType}: ${userData.email}`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.plainPassword, salt);

        user = await User.create({
          fullName: userData.fullName,
          email: normalizedEmail,
          password: hashedPassword,
          dob: new Date(userData.dob),
          gender: userData.gender,
          userType: userData.userType,
          phone: userData.phone,
          photo: userData.photo,
        });
        console.log(`${userData.userType} created successfully`);
      } else {
        console.log(`${userData.userType} already exists: ${userData.email}`);
      }

      // Ensure corresponding role-specific profile exists without duplication
      if (user.userType === "customer") {
        await Customer.findOrCreateByUserId(user._id);
      } else if (user.userType === "rider") {
        const existingRider = await Rider.findOne({ riderId: user._id });
        if (!existingRider) {
          await Rider.create({ riderId: user._id });
        }
      }
    }
  } catch (error) {
    console.error("userSeed error:", error.message);
    throw error;
  }
};

export default userSeed;