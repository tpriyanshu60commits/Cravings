// models/rider.model.js

import mongoose from "mongoose";

const RiderSchema = mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },

    vehicleDetails: {
      vehicleType: { type: String, default: "" },
      vehicleNumber: { type: String, default: "" },
      vehicleModel: { type: String, default: "" },
      vehicleColor: { type: String, default: "" },
    },

    documents: {
      drivingLicense: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
      },

      vehicleRegistrationCertificate: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
      },

      insuranceCertificate: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
      },

      aadharCard: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
      },

      panCard: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
      },
    },

    currentAddress: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pinCode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive", "blocked"],
      default: "pending",
    },

    averageRating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    financialDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
    },

    currentLocation: {
      lat: { type: String, default: "" },
      lon: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const Rider = mongoose.model("rider", RiderSchema);

export default Rider;