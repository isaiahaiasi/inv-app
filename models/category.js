const { INV_URL_NAME } = require("../consts.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { getImageData } = require("../cloudinaryHelpers");
const CategorySchema = new Schema({
  name: { type: String, minLength: 3, maxLength: 100, required: true },
  description: { type: String, minLength: 3, maxLength: 3000 },
  img_id: { type: String, maxLength: 2048 },
});

CategorySchema.virtual("url").get(function () {
  return `/${INV_URL_NAME}/category/${this._id}`;
});

CategorySchema.virtual("img_url").get(function () {
  // if img_id doesn't exist/isn't associated with an image, return static 404 image
  // otherwise, return image url
  const img404Uri = "/images/img-404.png";

  if (!this.img_id) {
    return img404Uri;
  }

  // not sure how to save
  const imgData = getImageData(this.img_id);

  console.log("image data", imgData);

  return imgData?.url ?? img404Uri;
});

module.exports = mongoose.model("Category", CategorySchema);
