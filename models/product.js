const { INV_URL_NAME } = require("../consts.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const positiveIntegerOptions = {
  type: Number,
  min: 1,
  required: true,
  validate: {
    validator: Number.isInteger,
    message: "{VALUE} is not an integer",
  },
};

const ProductSchema = new Schema({
  name: { type: String, minLength: 3, maxLength: 100, required: true },
  description: { type: String, minLength: 3, maxLength: 100 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: positiveIntegerOptions,
  stock: positiveIntegerOptions,
});

ProductSchema.virtual("url").get(function () {
  return `${INV_URL_NAME}/product/${this._id}`;
});

module.exports = mongoose.model("Product", ProductSchema);
