import Listing from "../models/Listing.js";

export async function getPendingListings(req, res) {
  try {
    const listings = await Listing.find({
      status: "pending",
    }).sort({ createdAt: 1, _id: 1 });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Get pending listings failed:", error.name);

    return res.status(500).json({
      message: "Unable to load pending listings.",
    });
  }
}

export async function approveListing(req, res) {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid listing ID.",
      });
    }

    const listing = await Listing.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
        "photos.0": { $exists: true },
      },
      {
        $set: {
          status: "approved",
          rejectionReason: "",
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!listing) {
      return res.status(409).json({
        message:
          "Listing must exist, be pending and have at least one photo.",
      });
    }

    return res.status(200).json({
      message: "Listing approved.",
      listing,
    });
  } catch (error) {
    console.error("Approve listing failed:", error.name);

    return res.status(500).json({
      message: "Unable to approve listing.",
    });
  }
}

export async function rejectListing(req, res) {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body || {};

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid listing ID.",
      });
    }

    if (
      typeof rejectionReason !== "string" ||
      rejectionReason.trim().length < 5 ||
      rejectionReason.trim().length > 500
    ) {
      return res.status(400).json({
        message: "Provide a rejection reason between 5 and 500 characters.",
      });
    }

    const listing = await Listing.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!listing) {
      return res.status(409).json({
        message: "Listing does not exist or is no longer pending.",
      });
    }

    return res.status(200).json({
      message: "Listing rejected.",
      listing,
    });
  } catch (error) {
    console.error("Reject listing failed:", error.name);

    return res.status(500).json({
      message: "Unable to reject listing.",
    });
  }
}