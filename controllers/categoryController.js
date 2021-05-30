const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category");
const Product = require("../models/product");

// same validation for create & update
const validateAndSanitize = [body("name").trim().isLength({ min: 1 }).escape()];

exports.categoryList = (req, res, next) => {
  Category.find({})
    .sort("name")
    .exec()
    .then((categories) => {
      res.render("category_list", { title: "Category List", categories });
    })
    .catch((err) => {
      next(err);
    });
};

exports.categoryDetail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  Promise.all([
    Category.findById(id).exec(),
    Product.find({ category: id }).exec(),
  ])
    .then(([category, products]) => {
      res.render("category_detail", {
        title: `${category.name} detail`,
        category,
        products,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCreateCategory = (req, res) => {
  res.render("category_form", { title: "Add Category" });
};

exports.postCreateCategory = [
  // validate & sanitize
  ...validateAndSanitize,
  (req, res, next) => {
    // extract validation errors
    const errors = validationResult(req);

    const category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category,
        errors: errors.array(),
      });
      return;
    }

    // if the category already exists, just redirect to that category
    // otherwise, add it to the db & redirect to that page
    Category.findOne({ name: req.body.name })
      .exec()
      .then((foundCategory) => {
        if (foundCategory) {
          res.redirect(foundCategory.url);
          return;
        }

        // no errors, data is valid, and category doesn't exist yet
        category
          .save()
          .then(() => res.redirect(category.url))
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  },
];
