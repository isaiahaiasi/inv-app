const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category");
const Product = require("../models/product");
const Img = require("../models/img");

const { INV_URL_NAME } = require("../consts");
const { UPLOAD_PATH } = require("../rootdir");

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

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
    Category.findById(id).populate("img").exec(),
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

    const category = new Category({
      name: req.body.name,
      img: createDefaultImg(),
    });

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
          // TODO: placeholder; just redirecting is too confusing...
          res.redirect(foundCategory.url);
          return;
        }

        // no errors, data is valid, and category doesn't exist yet

        // if there's image data, upload to cloudinary & save url to category
        if (req.file?.filename) {
          const imageLocation = UPLOAD_PATH + "/" + req.file.filename;

          // upload the file
          cloudinary.uploader
            .upload(imageLocation, {
              folder: "category",
            })
            .then((image) => {
              // delete local copy, create an img document with data & save it
              fs.unlink(imageLocation, (err) => console.error(err));

              const { public_id, version } = image;

              // TODO: error checking?...
              const img = new Img({ public_id, version });

              return img.save();
            })
            .then((img) => {
              // save img document
              category.img = img._id;
              return category.save();
            })
            .then(() => res.redirect(category.url))
            .catch((err) => {
              next(err);
            });
        } else {
          // no image data, just save text fields
          category
            .save()
            .then(() => res.redirect(category.url))
            .catch((err) => next(err));
        }
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
          .then((removedCategory) => {
            console.log(
              `removed ${removedCategory.name} (${removedCategory._id})`
            );
            return Img.findByIdAndRemove(removedCategory.img).exec();
          })
          .then((removedImg) => {
            console.log(
              `removed img ${removedImg.public_id} (${removedImg.version})`
            );
            if (!removedImg.public_id) return;

            cloudinary.uploader
              .destroy(removedImg.public_id)
              .catch((err) => console.error(err));
          })
          .then(() => {
            // TODO: remove image from cloudinary
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

exports.postUpdateCategory = [
  ...validateAndSanitize,
  (req, res, next) => {
    // extract errors
    let errors = validationResult(req).array();

    const id = mongoose.Types.ObjectId(req.params.id);

    const category = new Category({ name: req.body.name, _id: id });

    if (req.body.adminpw !== process.env.ADMIN_PW) {
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

    if (!req.file?.filename) {
      // there isn't a new file, don't do any cloudinary stuff

      console.log("No file!!!");
      Category.findByIdAndUpdate(id, category, { new: true })
        .populate("img")
        .then((theCategory) => {
          console.log("the category: ", theCategory);
          res.redirect(theCategory.url);
          return;
        });
    } else {
      // there IS a new file, so DO do cloudinary stuff
      // Update
      let updatedCategory;
      Category.findByIdAndUpdate(id, category, { new: true })
        .populate("img")
        // Upload image to cloudinary
        .then((result) => {
          updatedCategory = result;
          const imageLocation = UPLOAD_PATH + "/" + req.file.filename;
          return cloudinary.uploader.upload(imageLocation, {
            public_id: updatedCategory.img.public_id,
            invalidate: true,
          });
        })
        // Update img document with new cloudinary image version
        .then((cld_img) => {
          const updatedImg = new Img({
            version: cld_img.version,
            public_id: updatedCategory.img.public_id ?? cld_img.public_id,
            _id: updatedCategory.img._id,
          });

          return Img.findByIdAndUpdate(updatedCategory.img._id, updatedImg);
        })
        .then(() => {
          res.redirect(updatedCategory.url);
        })
        .catch((err) => {
          next(err);
        });
    }
  },
];

// default img function
function createDefaultImg() {
  const img = new Img({});
  img.save().catch((err) => console.error(err));
  return img;
}
