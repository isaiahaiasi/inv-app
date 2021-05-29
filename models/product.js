const { INV_URL_NAME } = require("../consts.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// extracted requirements shared by several fields
const positiveIntegerOptions = {
  type: Number,
  min: 1,
  validate: {
    validator: Number.isInteger,
    message: "{VALUE} is not an integer",
  },
};

const ProductSchema = new Schema({
  name: { type: String, minLength: 3, maxLength: 100, required: true },
  description: { type: String, minLength: 3, maxLength: 3000 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { ...positiveIntegerOptions, required: true },
  stock: { ...positiveIntegerOptions, required: true },
});

ProductSchema.virtual("url").get(function () {
  return `/${INV_URL_NAME}/product/${this._id}`;
});

ProductSchema.virtual("priceFormatted").get(function () {
  return "$" + this.price / 100;
});

ProductSchema.virtual("isLowStock").get(function () {
  return this.stock <= 5;
});

module.exports = mongoose.model("Product", ProductSchema);
