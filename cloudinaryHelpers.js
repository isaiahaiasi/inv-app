const cloudinary = require("cloudinary");

// Currently I'm only getting the url, but I could potentially get a lot more info
exports.getImageUrl = (public_id, version) => {
  // If img_id doesn't exist/isn't associated with an image,
  // return static 404 image. Otherwise, return image url

  console.log("public_id: ", public_id);
  console.log("version: ", version);

  const url = public_id
    ? cloudinary.url("category/" + public_id, { version })
    : "/images/img-404.png";

  console.log(url);
  return url;
};
