const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { getImageUrl } = require("../cloudinaryHelpers");

const ImgSchema = new Schema({
  public_id: { type: String, maxLength: 2048 },
  version: { type: Number, min: 1 },
});

ImgSchema.virtual("url").get(function () {
  return getImageUrl(this.public_id, this.version);
});

module.exports = mongoose.model("Img", ImgSchema);
