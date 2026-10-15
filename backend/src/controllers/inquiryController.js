import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";

export async function createInquiry(req, res) {
  try {
    const {
      listingId,
      message,
      offerPrice = null,
    } = req.body || {};

    if (
      typeof listingId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(listingId)
    ) {
      return res.status(400).json({
        message: "Please provide a valid listing ID.",
      });
    }

    if (
      typeof message !== "string" ||
      message.trim().length < 10 ||
      message.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Message must contain between 10 and 1000 characters.",
      });
    }

    if (
      offerPrice !== null &&
      (
        typeof offerPrice !== "number" ||
        !Number.isFinite(offerPrice) ||
        offerPrice <= 0
      )
    ) {
      return res.status(400).json({
        message: "Offer price must be a positive number.",
      });
    }

    const listing = await Listing.findOne({
      _id: listingId,
      status: "approved",
    }).select("_id seller");

    if (!listing) {
      return res.status(404).json({
        message: "Approved listing not found.",
      });
    }

    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot send an inquiry to your own listing.",
      });
    }

    const inquiry = await Inquiry.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
      message: message.trim(),
      offerPrice,
      status: "pending",
      sellerReply: "",
    });

    res.set("Cache-Control", "no-store");

    return res.status(201).json({
      message: "Inquiry sent successfully.",
      inquiry,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check your inquiry details.",
      });
    }

    console.error("Create inquiry failed:", error.name);

    return res.status(500).json({
      message: "Unable to send inquiry. Please try again later.",
    });
  }
}

export async function getMyInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find({
      buyer: req.user._id,
    })
      .populate("listing", "title")
      .sort({ createdAt: -1, _id: -1 });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error("Get buyer inquiries failed:", error.name);

    return res.status(500).json({
      message: "Unable to load your inquiries.",
    });
  }
}

export async function getReceivedInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find({
      seller: req.user._id,
    })
      .populate("listing", "title")
      .populate("buyer", "name")
      .sort({ createdAt: -1, _id: -1 });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error("Get seller inquiries failed:", error.name);

    return res.status(500).json({
      message: "Unable to load received inquiries.",
    });
  }
}