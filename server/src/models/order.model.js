import mongoose from "mongoose";
const orderSchema = mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rider",
      required: false,
    },
    orderItems: {
      type: [
        {
          itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          itemName: {
            type: String,
            required: true,
            default: "Food Item",
          },
          itemPrice: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            default: "0",
          },
          quantity: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            default: "1",
          },
          image: {
            url: {
              type: String,
            },
            publicId: {
              type: String,
            },
          },
        },
      ],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "pickedUp",
        "outForDelivery",
        "undeliverable",
        "delivered",
        "cancelled",
        "failed",
        "rejected",
      ],
      default: "pending",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    billDetails: {
      type: {
        totalAmount: {
          type: Number,
          required: true,
          min: 0,
        },

        platformFee: {
          type: Number,
          required: true,
          min: 0,
        },

        convenienceFee: {
          type: Number,
          required: true,
          min: 0,
        },

        taxAmount: {
          type: Number,
          required: true,
          min: 0,
        },

        deliveryCharge: {
          type: Number,
          required: true,
          min: 0,
        },

        discountAmount: {
          type: Number,
          required: true,
          min: 0,
        },

        finalAmount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
      required: true,
    },

    deliveryAddress: {
      type: {
        name: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        geoLocation: {
          type: {
            lat: {
              type: String,
              default: "",
            },
            lon: {
              type: String,
              default: "",
            },
          },
          required: false,
          default: () => ({ lat: "", lon: "" }),
        },
        city: {
          type: String,
          required: true,
        },
        pinCode: {
          type: String,
          required: true,
        },
      },
    },
    paymentDetails: {
      type: {
        paymentMethod: {
          type: String,
          enum: ["card", "upi"],
          required: true,
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        razorpayOrderId: {
          type: String,
        },

        razorpayPaymentId: {
          type: String,
        },

        razorpaySignature: {
          type: String,
        },

        paidAt: {
          type: Date,
        },
      },
      required: true,
    },
    deliveryConfirmation: {
      type: {
        riderConfirmed: {
          type: Boolean,
          default: false,
        },
        riderConfirmedAt: {
          type: Date,
        },
        customerConfirmed: {
          type: Boolean,
          default: false,
        },
        customerConfirmedAt: {
          type: Date,
        },
      },
      default: () => ({
        riderConfirmed: false,
        customerConfirmed: false,
      }),
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("order", orderSchema);
export default Order;
