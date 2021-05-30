const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const Product = require("../models/product");
const Category = require("../models/category");

const validateAndSanitize = [
  body("name").trim().isLength({ min: 3, max: 100 }).escape(),
  body("description").trim().isLength({ min: 3, max: 3000 }).escape(),
  body("price").trim().isNumeric().escape(),
  body("stock").trim().isNumeric().escape(),
  body("category").trim().isUUID().escape(),
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
    Promise.all([
      Category.find({}).exec(),
      Category.findById(req.body.category).exec(), // ensure selected category exists
      Product.find({ name: req.body.name }).exec(), // ensure there isn't already a product with this name
    ])
      .then(([categories, category, matchedName]) => {
        const errors = validationResult(req).array();

        const product = new Product({
          ...req.body,
          category: category ?? categories[0],
        });

        // Only partial error API
        if (!category) {
          errors.push({
            msg: "Category was not valid",
            param: "category",
            value: req.body.category,
            location: "body",
          });
        }

        if (matchedName) {
          errors.push({
            msg: "Product name cannot already exist",
            param: "name",
            value: req.body.name,
            location: "body",
          });
        }

        if (!errors.length > 0) {
          res.render("product_form", {
            title: "Create Product",
            categories,
            product,
            errors: errors,
          });
          return;
        }

        // ALL ERROR CHECKING PASSED! SAVE PRODUCT & REDIRECT TO ITS PAGE
        product
          .save()
          .then(() => res.redirect(product.url))
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  },
];

exports.getDeleteProduct = (req, res, next) => {
  res.send("GET DELETE PRODUCT NOT YET IMPLEMENTED.");
};

exports.postDeleteProduct = (req, res, next) => {
  //res.type("json").send(JSON.stringify(req.body, null, 2) + "\n");
  res.send("POST DELETE PRODUCT NOT YET IMPLEMENTED.");
};

exports.getUpdateProduct = (req, res, next) => {
  res.send("GET UPDATE PRODUCT NOT YET IMPLEMENTED.");
};

exports.postUpdateProduct = (req, res, next) => {
  //res.type("json").send(JSON.stringify(req.body, null, 2) + "\n");
  res.send("POST UPDATE PRODUCT NOT YET IMPLEMENTED.");
};
