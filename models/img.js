const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { getImageUrl } = require("../cloudinaryHelpers");

const ImgSchema = new Schema({
  version: { type: Number, min: 1 },
  folder: { type: String },
});

ImgSchema.virtual("url").get(function () {
  return this.version
    ? getImageUrl(this._id, this.version, this.folder)
    : "/images/img-404.png";
});

ImgSchema.virtual("full_path").get(function () {
  return `${this.folder}/${this._id}`;
});

module.exports = mongoose.model("Img", ImgSchema);
