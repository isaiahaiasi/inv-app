const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category");
const Product = require("../models/product");
const { INV_URL_NAME } = require("../consts");

// same validation for create & update
const validateAndSanitize = [
  body("name").trim().isLength({ min: 3, max: 100 }).escape(),
  // TODO: implement description in form & create/update routes
  // body("description").trim().isLength({ min: 3, max: 3000 }).escape(),
];

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
    let errors = validationResult(req).array();

    const category = new Category({ name: req.body.name });

    // if pw wrong, overwrite any other errors with unauthorized error
    if (req.body.adminpw !== process.env.ADMIN_PW) {
      res.status = 401;
      errors = [
        {
          msg: "Invalid password",
          param: "adminpw",
          location: "body",
        },
      ];
    }

    if (errors.length > 0) {
      res.render("category_form", {
        title: "Create Category",
        category,
        errors,
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

exports.getDeleteCategory = (req, res, next) => {
  // get category & all products of that category
  // render with those params
  const id = mongoose.Types.ObjectId(req.params.id);

  Promise.all([
    Category.findById(id).exec(),
    Product.find({ category: id }).exec(),
  ])
    .then(([category, products]) => {
      res.render("category_delete", {
        title: `Delete Category ${category.name}`,
        category,
        products,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postDeleteCategory = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.body.categoryid);
  // get category, associated products
  Promise.all([
    Category.findById(id).exec(),
    Product.find({ category: id }).exec(),
  ])
    .then(([category, products]) => {
      // unauthorized w/o correct pw
      if (req.body.adminpw !== process.env.ADMIN_PW) {
        const err = new Error("Invalid password");
        return next(err);
      }

      if (products.length > 0) {
        // there are still, somehow, associated products, render delete path
        res.render("category_delete", {
          title: `Delete Category ${category.name}`,
          category,
          products,
        });
      } else {
        // delete & send back to categories
        Category.findByIdAndRemove(id)
          .exec()
          .then(() => {
            res.redirect(`/${INV_URL_NAME}/categories`);
          })
          .catch((err) => next(err));
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUpdateCategory = (req, res, next) => {
  // get category
  // render category form and give it category
  const id = mongoose.Types.ObjectId(req.params.id);
  Category.findById(id)
    .exec()
    .then((category) => {
      res.render("category_form", {
        title: `Update Category ${category.name}`,
        category,
      });
    })
    .catch((err) => {
      next(err);
    });
};

// validate & sanitize
// make new genre
// if new genre already exists, just redirect
// otherwise, update the current record
exports.postUpdateCategory = [
  ...validateAndSanitize,
  (req, res, next) => {
    // extract errors
    let errors = validationResult(req).array();

    const id = mongoose.Types.ObjectId(req.params.id);

    const category = new Category({ name: req.body.name, _id: id });

    if (req.body.adminpw !== process.env.ADMIN_PW) {
      // res.status = 401;
      errors = [
        {
          msg: "Invalid password",
          param: "adminpw",
          location: "body",
        },
      ];
    }

    if (errors.length > 0) {
      res.render("category_form", {
        title: `Update Category ${category.name}`,
        category,
        errors,
      });
      return;
    }

    // Validation & sanitization passed
    // Make sure there isn't already a category with the same name
    Category.findOne({ name: req.body.name })
      .exec()
      .then((match) => {
        if (match) {
          // There's already a category with this name, so just link there
          res.redirect(`/${INV_URL_NAME}/category/${match._id}`);
          return;
        }

        // Update!
        Category.findByIdAndUpdate(id, category, {}, (err, theCategory) => {
          if (err) {
            return next(err);
          }

          res.redirect(theCategory.url);
        });
      })
      .catch((err) => {
        next(err);
      });
  },
];
