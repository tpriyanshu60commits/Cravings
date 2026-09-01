import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../config/dbConnection.config.js";
import User from "../models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether run from server/ or workspace root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

/**
 * Idempotent Admin Seeder
 * - Verifies if an admin with ADMIN_EMAIL already exists
 * - If admin exists, leaves it untouched and logs a message
 * - If email exists with another role, logs an error without modifying data
 * - If admin does not exist, safely creates it using bcrypt hashing
 */
export const adminSeed = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME || "Admin";
  const adminPhone = process.env.ADMIN_PHONE || "9876543210";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Missing required environment variables: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env"
    );
  }

  const normalizedEmail = adminEmail.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.userType === "admin") {
      console.log("Admin already exists");
      return;
    } else {
      console.error(
        `User with this email already exists but is not an admin (current role: ${existingUser.userType}).`
      );
      return;
    }
  }

  console.log("Creating new Admin user...");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const initialLetter = adminFullName.trim().charAt(0).toUpperCase() || "A";

  const newAdmin = {
    fullName: adminFullName,
    email: normalizedEmail,
    phone: adminPhone,
    dob: new Date("2000-01-01"),
    gender: "other",
    password: hashedPassword,
    photo: {
      url: `https://placehold.co/600x400?text=${encodeURIComponent(initialLetter)}`,
      publicId: null,
    },
    userType: "admin",
  };

  await User.create(newAdmin);
  console.log("Admin created successfully");
};

// Standalone execution wrapper for CLI usage (npm run seed:admin)
const runStandalone = async () => {
  try {
    await connectDB();
    await adminSeed();
  } catch (error) {
    console.error("Admin seed error:", error.message);
    process.exitCode = 1;
  } finally {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("Database connection closed cleanly.");
      }
    } catch (closeErr) {
      console.error("Error closing database connection:", closeErr.message);
    }
    process.exit(process.exitCode || 0);
  }
};

const executedFilePath = process.argv[1] ? path.resolve(process.argv[1]).toLowerCase() : "";
const currentFilePath = path.resolve(__filename).toLowerCase();

if (executedFilePath && executedFilePath === currentFilePath) {
  runStandalone();
}

export default adminSeed;
