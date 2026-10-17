import { unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Inquiry from "../models/Inquiry.js";

const uploadFolder = fileURLToPath(
  new URL("../../uploads/", import.meta.url)
);

const idPattern = /^[a-fA-F0-9]{24}$/;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readQuery(query, filterName, allowedValues) {
  const search = query.search ?? "";
  const selectedFilter = query[filterName] ?? "";
  const pageText = query.page ?? "1";

  if (
    typeof search !== "string" ||
    typeof selectedFilter !== "string" ||
    typeof pageText !== "string"
  ) {
    return { error: "Query parameters must be text." };
  }

  const searchText = search.trim();

  if (searchText.length > 120) {
    return { error: "Search must not exceed 120 characters." };
  }

  if (
    selectedFilter !== "" &&
    !allowedValues.includes(selectedFilter)
  ) {
    return { error: `Invalid ${filterName} filter.` };
  }

  if (!/^[1-9][0-9]*$/.test(pageText)) {
    return { error: "Page must be a positive whole number." };
  }

  const page = Number(pageText);

  if (!Number.isSafeInteger(page) || page > 10000) {
    return { error: "Page number is too large." };
  }

  return { searchText, selectedFilter, page, limit: 12 };
}

function validId(req, res) {
  if (!idPattern.test(req.params.id)) {
    res.status(400).json({ message: "Invalid record ID." });
    return false;
  }

  return true;
}

export async function getAdminUsers(req, res) {
  try {
    const query = readQuery(req.query, "role", [
      "buyer",
      "seller",
      "admin",
    ]);

    if (query.error) {
      return res.status(400).json({ message: query.error });
    }

    const { searchText, selectedFilter, page, limit } = query;
    const filter = {};

    if (selectedFilter) filter.role = selectedFilter;

    if (searchText) {
      const searchPattern = escapeRegex(searchText);

      filter.$or = [
        { name: { $regex: searchPattern, $options: "i" } },
        { email: { $regex: searchPattern, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("_id name email role createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin user lookup failed:", error.name);
    return res.status(500).json({ message: "Unable to load users." });
  }
}

export async function getAdminStones(req, res) {
  try {
    const query = readQuery(req.query, "status", [
      "pending",
      "approved",
      "rejected",
    ]);

    if (query.error) {
      return res.status(400).json({ message: query.error });
    }

    const { searchText, selectedFilter, page, limit } = query;
    const filter = {};

    if (selectedFilter) filter.status = selectedFilter;

    if (searchText) {
      filter.title = {
        $regex: escapeRegex(searchText),
        $options: "i",
      };
    }

    const total = await Listing.countDocuments(filter);

    const listings = await Listing.find(filter)
      .select(
        "_id title description listingType gemType weightCarats " +
          "stoneCount askingPrice location photos seller status " +
          "rejectionReason createdAt"
      )
      .populate("seller", "_id name email")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      listings,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin listing lookup failed:", error.name);
    return res.status(500).json({ message: "Unable to load listings." });
  }
}

export async function changeUserRole(req, res) {
  if (!validId(req, res)) return;

  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid user role." });
    }

    if (id.toLowerCase() === req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot change your own role.",
      });
    }

    const account = await User.findById(id);

    if (!account) {
      return res.status(404).json({ message: "User not found." });
    }

    if (account.role === role) {
      return res.status(200).json({ message: "Role is already set." });
    }

    const hasListings = await Listing.exists({ seller: id });

    if (hasListings) {
      return res.status(409).json({
        message:
          "This user has listings. Their role cannot be changed while those listings exist.",
      });
    }

    const hasInquiries = await Inquiry.exists({
      $or: [{ buyer: id }, { seller: id }],
    });

    if (hasInquiries) {
      return res.status(409).json({
        message:
          "This user has inquiry history. Role changes are disabled to preserve access to those conversations.",
      });
    }

    // Match the previous role to detect a competing admin change.
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, role: account.role },
      { $set: { role } },
      { returnDocument: "after", runValidators: true }
    ).select("_id name email role");

    if (!updatedUser) {
      return res.status(409).json({
        message: "User changed. Refresh and try again.",
      });
    }

    return res.status(200).json({
      message: "User role updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Role update failed:", error.name);
    return res.status(500).json({ message: "Unable to change user role." });
  }
}

export async function deleteAdminUser(req, res) {
  if (!validId(req, res)) return;

  try {
    const { id } = req.params;

    if (id.toLowerCase() === req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot delete your own account.",
      });
    }

    const account = await User.findById(id).select("_id");

    if (!account) {
      return res.status(404).json({ message: "User not found." });
    }

    const hasListings = await Listing.exists({ seller: id });

    if (hasListings) {
      return res.status(409).json({
        message: "Cannot delete a user who still has listings.",
      });
    }

    const hasInquiries = await Inquiry.exists({
      $or: [{ buyer: id }, { seller: id }],
    });

    if (hasInquiries) {
      return res.status(409).json({
        message: "Cannot delete a user with inquiry history.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("User deletion failed:", error.name);
    return res.status(500).json({ message: "Unable to delete user." });
  }
}

export async function changeListingStatus(req, res) {
  if (!validId(req, res)) return;

  try {
    const { status, rejectionReason = "" } = req.body || {};

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid listing status.",
      });
    }

    if (typeof rejectionReason !== "string") {
      return res.status(400).json({
        message: "Rejection reason must be text.",
      });
    }

    const reason = rejectionReason.trim();

    if (
      status === "rejected" &&
      (reason.length < 5 || reason.length > 500)
    ) {
      return res.status(400).json({
        message: "Rejection reason must contain 5 to 500 characters.",
      });
    }

    const listing = await Listing.findById(req.params.id)
      .select("_id photos updatedAt");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    if (status === "approved" && listing.photos.length === 0) {
      return res.status(400).json({
        message: "A listing needs at least one photo before approval.",
      });
    }

    const updatedListing = await Listing.findOneAndUpdate(
      {
        _id: listing._id,
        updatedAt: listing.updatedAt,
      },
      {
        $set: {
          status,
          rejectionReason: status === "rejected" ? reason : "",
        },
      },
      { returnDocument: "after", runValidators: true }
    ).select("_id status rejectionReason");

    if (!updatedListing) {
      return res.status(409).json({
        message: "Listing changed. Refresh and review it again.",
      });
    }

    return res.status(200).json({
      message: `Listing marked as ${status}.`,
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Status update failed:", error.name);
    return res.status(500).json({
      message: "Unable to change listing status.",
    });
  }
}

export async function deleteAdminStone(req, res) {
  if (!validId(req, res)) return;

  try {
    const { id } = req.params;

    const hasInquiries = await Inquiry.exists({ listing: id });

    if (hasInquiries) {
      return res.status(409).json({
        message:
          "This listing has inquiries and cannot be deleted. Change its status to pending or rejected to remove it from public browsing.",
      });
    }

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    let cleanupFailed = false;

    for (const photoPath of listing.photos) {
      // Accept a single filename directly inside /uploads/.
      if (
        typeof photoPath !== "string" ||
        !/^\/uploads\/[^/\\]+\.webp$/i.test(photoPath)
      ) {
        cleanupFailed = true;
        continue;
      }

      const filename = path.basename(photoPath);

      try {
        await unlink(path.join(uploadFolder, filename));
      } catch (error) {
        if (error.code !== "ENOENT") {
          cleanupFailed = true;
          console.error("Photo cleanup failed:", error.code);
        }
      }
    }

    return res.status(200).json({
      message: cleanupFailed
        ? "Listing deleted, but some photo files could not be removed."
        : "Listing and its photos deleted successfully.",
    });
  } catch (error) {
    console.error("Admin listing deletion failed:", error.name);
    return res.status(500).json({
      message: "Unable to delete listing.",
    });
  }
}