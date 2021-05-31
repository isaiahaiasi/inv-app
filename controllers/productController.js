const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const { INV_URL_NAME } = require("../consts");

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
  // no dependencies, so just make sure the product exists then ask to confirm
  const id = mongoose.Types.ObjectId(req.params.id);
  Product.findById(id)
    .exec()
    .then((product) => {
      if (product == null) {
        const err = new Error("Product not found!");
        err.status = 404;
        return next(err);
      }

      res.render("product_delete", {
        title: `Delete Product ${product.name}`,
        product,
      });
    })
    .catch((err) => next(err));
};

exports.postDeleteProduct = [
  body("productid").trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // this should never fail. If it does, throw an error
      const err = new Error("Product not found!");
      err.status = 404;
      return next(err);
    }

    const id = mongoose.Types.ObjectId(req.body.productid);
    console.log(id);
    Product.findByIdAndRemove(id)
      .exec()
      .then((product) => {
        // this is probably superfluous
        if (product == null) {
          const err = new Error("Product not found!");
          err.status = 404;
          return next(err);
        }

        res.redirect(`/${INV_URL_NAME}/products`);
      })
      .catch((err) => next(err));
  },
];

exports.getUpdateProduct = (req, res, next) => {
  res.send("GET UPDATE PRODUCT NOT YET IMPLEMENTED.");
};

exports.postUpdateProduct = (req, res, next) => {
  //res.type("json").send(JSON.stringify(req.body, null, 2) + "\n");
  res.send("POST UPDATE PRODUCT NOT YET IMPLEMENTED.");
};
