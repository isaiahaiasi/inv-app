// middleware for handling file uploads
const multer = require("multer");

// to create directory if it doesn't already exist
const fs = require("fs");

// to generate UUIDs for tmp files
const { nanoid } = require("nanoid");

// TODO: more elegant solution
const { UPLOAD_PATH } = require("./rootdir");

const getFileExtension = (file) => {
  const splitMime = file.mimetype.split("/");
  return splitMime[splitMime.length - 1];
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = UPLOAD_PATH.toString();

    fs.access(dir, (err) => {
      if (err) {
        // directory does not exist yet, so I'll have to create it...
        fs.mkdir(dir, { recursive: true }, (err) => {
          if (err) {
            console.error(err);
            cb(err);
          }

          // directory has been created, should be safe to set destination
          cb(null, dir);
        });
      } else {
        // directory already exists, safe to set destination
        cb(null, dir);
      }
    });
  },

  filename: (req, file, cb) => {
    const uuid = nanoid(10);
    const nameWithExtension = uuid + "." + getFileExtension(file);
    cb(null, nameWithExtension);
  },
});

const fileFilter = (req, file, cb) => {
  // filter files that aren't jpeg or png (may add more for convenience)
  const ext = getFileExtension(file);
  const isValid = ext === "jpeg" || "png";
  cb(null, isValid);
};

const limits = {
  fieldSize: 255000,
};

const multerConfig = {
  storage,
  fileFilter,
  limits,
};

module.exports = multer(multerConfig);
