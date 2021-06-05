const cloudinary = require("cloudinary");

// Currently I'm only getting the url, but I could potentially get a lot more info
// (the problem is my choices seem to be "url, or html img element". I *could*
// destructure the img I suppose, but I feel like there must be a better way)
exports.getImageData = (imgId) => {
  return { url: cloudinary.url(imgId) };
};
