const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { getImageUrl } = require("../cloudinaryHelpers");

const ImgSchema = new Schema({
  version: { type: Number, min: 1 },
});

ImgSchema.virtual("url").get(function () {
  return getImageUrl(this._id, this.version);
});

module.exports = mongoose.model("Img", ImgSchema);
