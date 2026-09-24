import multer from "multer";

// We use memoryStorage so the prescription file buffer stays in memory
// and can be directly converted to base64 for Gemini without saving sensitive files to disk.
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/heic",
  "application/pdf",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Please upload an image (JPG, PNG, WEBP) or a PDF prescription."
      ),
      false
    );
  }
};

export const uploadPrescription = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
  },
  fileFilter,
});
