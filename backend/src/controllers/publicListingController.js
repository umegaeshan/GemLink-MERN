import Listing from "../models/Listing.js";

// Escape special characters before using text in a regex search.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Get approved listings with filters and pagination.
export async function getPublicListings(req, res) {
  try {
    const {
      search = "",
      listingType = "",
      location = "",
      minPrice = "",
      maxPrice = "",
      page = "1",
    } = req.query;

    const values = [
      search,
      listingType,
      location,
      minPrice,
      maxPrice,
      page,
    ];

    if (values.some((value) => typeof value !== "string")) {
      return res.status(400).json({
        message: "Query parameters must be text.",
      });
    }

    if (!/^[1-9][0-9]*$/.test(page)) {
      return res.status(400).json({
        message: "Page must be a positive whole number.",
      });
    }

    const pageNumber = Number(page);
    const limit = 12;

    if (!Number.isSafeInteger(pageNumber) || pageNumber > 10000) {
      return res.status(400).json({
        message: "Page number is too large.",
      });
    }

    const searchText = search.trim();
    const locationText = location.trim();

    if (searchText.length > 120 || locationText.length > 120) {
      return res.status(400).json({
        message: "Search and location must not exceed 120 characters.",
      });
    }

    if (
      listingType !== "" &&
      !["individual", "lot"].includes(listingType)
    ) {
      return res.status(400).json({
        message: "Listing type must be individual or lot.",
      });
    }

    const pricePattern = /^[0-9]+([.][0-9]{1,2})?$/;

    for (const price of [minPrice, maxPrice]) {
      if (
        price !== "" &&
        (!pricePattern.test(price) ||
          !Number.isFinite(Number(price)) ||
          Number(price) > Number.MAX_SAFE_INTEGER)
      ) {
        return res.status(400).json({
          message: "Prices must be valid non-negative numbers.",
        });
      }
    }

    if (
      minPrice !== "" &&
      maxPrice !== "" &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return res.status(400).json({
        message: "Minimum price cannot exceed maximum price.",
      });
    }

    const filter = {
      status: "approved",
    };

    if (searchText) {
      filter.title = {
        $regex: escapeRegex(searchText),
        $options: "i",
      };
    }

    if (locationText) {
      filter.location = {
        $regex: escapeRegex(locationText),
        $options: "i",
      };
    }

    if (listingType) {
      filter.listingType = listingType;
    }

    if (minPrice !== "" || maxPrice !== "") {
      filter.askingPrice = {};

      if (minPrice !== "") {
        filter.askingPrice.$gte = Number(minPrice);
      }

      if (maxPrice !== "") {
        filter.askingPrice.$lte = Number(maxPrice);
      }
    }

    const total = await Listing.countDocuments(filter);

    const listings = await Listing.find(filter)
      .select(
        "title listingType gemType weightCarats stoneCount askingPrice location photos createdAt"
      )
      .sort({ createdAt: -1, _id: -1 })
      .skip((pageNumber - 1) * limit)
      .limit(limit)
      .lean();

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      page: pageNumber,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      listings,
    });
  } catch (error) {
    console.error("Get public listings failed:", error.name);

    return res.status(500).json({
      message: "Unable to load listings.",
    });
  }
}

// Get the details of one approved listing.
export async function getPublicListing(req, res) {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid listing ID.",
      });
    }

    const listing = await Listing.findOne({
      _id: id,
      status: "approved",
    })
      .select(
        "title description listingType gemType weightCarats stoneCount askingPrice location photos createdAt"
      )
      .lean();

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      listing,
      authenticityNotice:
        "Gem type and details are seller-provided. Listing approval does not certify authenticity.",
    });
  } catch (error) {
    console.error("Get public listing failed:", error.name);

    return res.status(500).json({
      message: "Unable to load listing.",
    });
  }
}