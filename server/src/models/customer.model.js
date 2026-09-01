import mongoose from "mongoose";

const customerSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
      index: true,
    },
    addressBook: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          address: {
            type: String,
            required: true,
          },
          city: {
            type: String,
            required: true,
          },
          state: {
            type: String,
            required: true,
          },
          pinCode: {
            type: String,
            required: true,
          },
          country: {
            type: String,
            required: true,
          },
          addressType: {
            type: String,
            enum: ["home", "work", "other"],
            required: true,
          },
          isDefault: {
            type: Boolean,
            default: false,
          },
          geoLocation: {
            type: {
              lat: {
                type: String,
              },
              lon: {
                type: String,
              },
            },
          },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "verified", "suspended"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Atomic, idempotent find-or-create helper to prevent duplicate Customer documents
 * caused by concurrent frontend requests.
 */
customerSchema.statics.findOrCreateByUserId = async function (
  userId,
  initialData = {},
) {
  try {
    let customer = await this.findOne({ customerId: userId });
    if (customer) {
      return customer;
    }

    customer = await this.findOneAndUpdate(
      { customerId: userId },
      {
        $setOnInsert: {
          customerId: userId,
          addressBook: initialData.addressBook || [],
          status: initialData.status || "pending",
          isActive:
            initialData.isActive !== undefined ? initialData.isActive : true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return customer;
  } catch (error) {
    if (error.code === 11000) {
      return await this.findOne({ customerId: userId });
    }
    throw error;
  }
};

const Customer = mongoose.model("customer", customerSchema);
export default Customer;
