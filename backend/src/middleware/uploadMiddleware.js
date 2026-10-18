import multer from "multer";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
    fields: 0,
    parts: 6,
  },

  fileFilter(req, file, callback) {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG and WebP images are allowed.")
      );
    }

    callback(null, true);
  },
});

export function uploadListingPhotos(req, res, next) {
  upload.array("photos", 5)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Each photo must be 5 MB or smaller.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Upload a maximum of 5 photos per request.",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message:
          "Use the photos field for files and upload no more than 5 photos.",
      });
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message:
          "Send only photo files using the photos field, without extra text fields.",
      });
    }

    return res.status(400).json({
      message: "Unable to accept files. Use JPG, PNG or WebP images.",
    });
  });
}