const cloudinary = require("cloudinary");

// Currently I'm only getting the url, but I could potentially get a lot more info
exports.getImageUrl = (public_id, version, folder) => {
  return cloudinary.url(folder + "/" + public_id, { version });
};
