const Product = require("../models/product");
const Category = require("../models/category");
const mongoose = require("mongoose");

exports.index = (req, res, next) => {
  // get the products
  Promise.all([
    Product.countDocuments({ stock: { $gte: 1 } }).exec(),
    Category.countDocuments({}).exec(),
  ])
    .then(([productCount, categoryCount]) => {
      res.render("index", { title: "Inv App", productCount, categoryCount });
    })
    .catch((err) => {
      next(err);
    });
};

exports.productList = (req, res, next) => {
  Product.find({})
    .sort("price")
    .populate("category")
    .exec()
    .then((results) => {
      res.render("product_list", { title: "Product List", products: results });
    })
    .catch((err) => {
      next(err);
    });
};

exports.productDetail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  Product.findById(id)
    .populate("category")
    .exec()
    .then((product) => {
      console.log(product);
      res.render("product_detail", {
        title: `${product.name} detail`,
        product,
      });
    })
    .catch((err) => {
      next(err);
    });
};
