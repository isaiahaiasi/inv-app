const { INV_URL_NAME } = require("../consts.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, minLength: 3, maxLength: 100, required: true },
  description: { type: String, minLength: 3, maxLength: 3000 },
  img: { type: Schema.Types.ObjectId, ref: "Img", required: true },
});

CategorySchema.virtual("url").get(function () {
  return `/${INV_URL_NAME}/category/${this._id}`;
});

module.exports = mongoose.model("Category", CategorySchema);
