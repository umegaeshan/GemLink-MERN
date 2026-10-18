import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },

    listingType: {
      type: String,
      required: true,
      enum: ["individual", "lot"],
    },

    gemType: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    weightCarats: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value > 0;
        },
        message: "Weight must be a positive number.",
      },
    },

    stoneCount: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          if (!Number.isInteger(value)) {
            return false;
          }

          if (this.listingType === "individual") {
            return value === 1;
          }

          return value >= 2;
        },
        message: "Individual listings need 1 stone; lots need at least 2.",
      },
    },

    askingPrice: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value > 0;
        },
        message: "Asking price must be a positive number.",
      },
    },

    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    photos: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= 5;
        },
        message: "A listing can have at most 5 photos.",
      },
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;