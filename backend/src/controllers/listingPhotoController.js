import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Listing from "../models/Listing.js";

const uploadFolder = fileURLToPath(
  new URL("../../uploads/", import.meta.url)
);

const listingIdPattern = /^[a-fA-F0-9]{24}$/;

const photoNamePattern =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}[.]webp$/i;

export async function addListingPhotos(req, res) {
  const savedFiles = [];
  let databaseUpdated = false;

  try {
    const { id } = req.params;

    if (!listingIdPattern.test(id)) {
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

    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one photo.",
      });
    }

    const currentCount = listing.photos.length;

    if (currentCount + files.length > 5) {
      return res.status(400).json({
        message: "A listing can have a maximum of 5 photos.",
      });
    }

    const images = [];

    try {
      for (const file of files) {
        const image = sharp(file.buffer, {
          limitInputPixels: 25000000,
        });

        const metadata = await image.metadata();

        if (
          !["jpeg", "png", "webp"].includes(metadata.format) ||
          (metadata.pages || 1) > 1
        ) {
          throw new Error("Unsupported image.");
        }

        const buffer = await image
          .rotate()
          .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer();

        images.push(buffer);
      }
    } catch {
      return res.status(400).json({
        message:
          "Use valid, non-animated JPG, PNG or WebP images up to 25 megapixels.",
      });
    }

    await mkdir(uploadFolder, { recursive: true });

    const photoPaths = [];

    for (const buffer of images) {
      const filename = randomUUID() + ".webp";
      const fullPath = path.join(uploadFolder, filename);

      savedFiles.push(fullPath);
      await writeFile(fullPath, buffer);

      photoPaths.push("/uploads/" + filename);
    }

    const updatedListing = await Listing.findOneAndUpdate(
      {
        _id: id,
        seller: req.user._id,
        photos: { $size: currentCount },
      },
      {
        $push: {
          photos: { $each: photoPaths },
        },
        $set: {
          status: "pending",
          rejectionReason: "",
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedListing) {
      return res.status(409).json({
        message: "Listing changed. Refresh and try again.",
      });
    }

    databaseUpdated = true;

    return res.status(200).json({
      message: "Photos added and listing pending moderation.",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Photo upload failed:", error.name);

    return res.status(500).json({
      message: "Unable to upload photos. Please try again later.",
    });
  } finally {
    if (!databaseUpdated) {
      for (const fullPath of savedFiles) {
        try {
          await unlink(fullPath);
        } catch (error) {
          if (error.code !== "ENOENT") {
            console.error("Photo cleanup failed:", error.code);
          }
        }
      }
    }
  }
}

export async function getListingPhoto(req, res, next) {
  try {
    const { id, filename } = req.params;

    if (!listingIdPattern.test(id)) {
      return res.status(400).json({
        message: "Invalid listing ID.",
      });
    }

    if (!photoNamePattern.test(filename)) {
      return res.status(400).json({
        message: "Invalid photo filename. Use the generated WebP filename.",
      });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: "Photo not found.",
      });
    }

    const isOwner =
      listing.seller.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (listing.status !== "approved" && !isOwner && !isAdmin) {
      return res.status(404).json({
        message: "Photo not found.",
      });
    }

    const photoPath = "/uploads/" + filename;

    if (!listing.photos.includes(photoPath)) {
      return res.status(404).json({
        message: "Photo not found.",
      });
    }

    res.set("Cache-Control", "private, no-store");
    res.set("X-Content-Type-Options", "nosniff");

    return res.sendFile(
      path.join(uploadFolder, filename),
      (error) => {
        if (!error) {
          return;
        }

        if (res.headersSent) {
          return next(error);
        }

        const notFound =
          error.code === "ENOENT" || error.status === 404;

        return res.status(notFound ? 404 : 500).json({
          message: notFound
            ? "Photo file not found."
            : "Unable to load photo.",
        });
      }
    );
  } catch (error) {
    console.error("Load photo failed:", error.name);

    return res.status(500).json({
      message: "Unable to load photo.",
    });
  }
}