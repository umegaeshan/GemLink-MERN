import Listing from "../models/Listing.js";

// Create a listing.
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

// Get listings owned by the logged-in seller.
export async function getMyListings(req, res) {
  try {
    const listings = await Listing.find({
      seller: req.user._id,
    }).sort({ createdAt: -1 });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Get my listings failed:", error.name);

    return res.status(500).json({
      message: "Unable to load your listings. Please try again later.",
    });
  }
}

// Update a listing owned by the logged-in seller.
export async function updateListing(req, res) {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid listing ID.",
      });
    }

    const listing = await Listing.findOne({
      _id: id,
      seller: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found.",
      });
    }

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

    listing.title = title;
    listing.description = description;
    listing.listingType = listingType;
    listing.gemType = gemType;
    listing.weightCarats = weightCarats;
    listing.stoneCount = stoneCount;
    listing.askingPrice = askingPrice;
    listing.location = location;

    listing.status = "pending";
    listing.rejectionReason = "";

    await listing.save();

    return res.status(200).json({
      message: "Listing updated and pending moderation.",
      listing,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check your listing details.",
      });
    }

    console.error("Update listing failed:", error.name);

    return res.status(500).json({
      message: "Unable to update listing. Please try again later.",
    });
  }
}