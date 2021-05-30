const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const Product = require("../models/product");
const Category = require("../models/category");

const validateAndSanitize = [
  body("name").trim().isLength({ min: 1, max: 100 }).escape(),
  body("description").trim().isLength({ min: 1, max: 3000 }).escape(),
  // TODO: complete the rest of the validation
];

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

exports.getCreateProduct = (req, res, next) => {
  Category.find({})
    .sort("name")
    .exec()
    .then((categories) => {
      res.render("product_form", {
        title: "Create Product",
        categories,
      });
    })
    .catch((err) => next(err));
};

exports.postCreateProduct = [
  ...validateAndSanitize,
  (req, res, next) => {
    res.type("json").send(JSON.stringify(req.body, null, 2) + "\n");
  },
];

exports.getDeleteProduct = (req, res, next) => {
  res.send("GET DELETE PRODUCT NOT YET IMPLEMENTED.");
};

exports.postDeleteProduct = (req, res, next) => {
  res.send("POST DELETE PRODUCT NOT YET IMPLEMENTED.");
};

exports.getUpdateProduct = (req, res, next) => {
  res.send("GET UPDATE PRODUCT NOT YET IMPLEMENTED.");
};

exports.postUpdateProduct = (req, res, next) => {
  res.send("POST UPDATE PRODUCT NOT YET IMPLEMENTED.");
};
