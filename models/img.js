const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { getImageUrl } = require("../cloudinaryHelpers");

const ImgSchema = new Schema({
  version: { type: Number, min: 1 },
});

ImgSchema.virtual("url").get(function () {
  return this.version
    ? getImageUrl(this._id, this.version, "category")
    : "/images/img-404.png";
});

module.exports = mongoose.model("Img", ImgSchema);
