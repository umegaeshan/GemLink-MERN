import Listing from "../models/Listing.js";

export async function createListing(req, res) {
  try {
    const {
      title,
      description,
      listingType,
      gemType = "",
      weightCarats,
      stoneCount,
      askingPrice,
      location,
    } = req.body || {};

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof listingType !== "string" ||
      typeof gemType !== "string" ||
      typeof location !== "string"
    ) {
      return res.status(400).json({
        message: "Please provide valid text fields.",
      });
    }

    if (
      typeof weightCarats !== "number" ||
      typeof stoneCount !== "number" ||
      typeof askingPrice !== "number"
    ) {
      return res.status(400).json({
        message: "Weight, stone count and price must be numbers.",
      });
    }

    const listing = await Listing.create({
      title,
      description,
      listingType,
      gemType,
      weightCarats,
      stoneCount,
      askingPrice,
      location,
      seller: req.user._id,
      status: "pending",
      photos: [],
      rejectionReason: "",
    });

    return res.status(201).json({
      message: "Listing created and pending moderation.",
      listing,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check your listing details.",
      });
    }

    console.error("Create listing failed:", error.name);

    return res.status(500).json({
      message: "Unable to create listing. Please try again later.",
    });
  }
}