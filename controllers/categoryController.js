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
  ...validateAndSanitize,
  (req, res, next) => {
    // if pw wrong, can escape early
    if (req.body.adminpw !== process.env.ADMIN_PW) {
      res.status = 401;

      res.render("category_form", {
        title: "Create Category",
        errors: [
          {
            msg: "Invalid password",
            param: "adminpw",
            location: "body",
          },
        ],
      });
      return;
    }

    // other error checking:
    // - name already exists (async)
    // - validationResult returned errors
    Category.findOne({ name: req.body.name })
      .exec()
      .then((foundCategory) => {
        if (foundCategory) {
          // TODO: placeholder; just redirecting is too confusing...
          res.redirect(foundCategory.url);
          return;
        }

        // extract validation errors
        const errors = validationResult(req).array();

        const img = new Img({ folder: "category" });
        const category = new Category({
          name: req.body.name,
          img: img._id,
        });

        if (errors.length > 0) {
          res.render("category_form", {
            title: "Create Category",
            category,
            errors,
          });
          return;
        }

        // no errors, data is valid, and category doesn't exist yet:
        // ADD DOCUMENT
        if (!req.file?.filename) {
          // no image data: just save text fields
          Promise.all([category.save(), img.save()])
            .then(() => res.redirect(category.url))
            .catch(next);
        } else {
          // there's image data: upload to cloudinary w id of img._id
          const imageLocation = UPLOAD_PATH + "/" + req.file.filename;

          cloudinary.uploader
            .upload(imageLocation, {
              folder: "category",
              public_id: img._id,
            })
            .then((cld_img) => {
              console.log("!!!");
              console.log("CLOUDINARY UPLOAD RETURN:");
              console.log(cld_img);
              // delete local copy, create an img document with data & save it
              fs.unlink(imageLocation, console.error);
              img.version = cld_img.version;
              return img.save();
            })
            .then(() => category.save())
            .then(({ url }) => res.redirect(url))
            .catch(next);
        }
      })
      .catch(next);
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
    .catch(next);
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

        return;
      } else {
        // delete category & associated img, then send back to categories
        const removeCategoryPromise = Category.findByIdAndRemove(id).exec();
        const removeImgPromise = removeCategoryPromise.then(
          (removedCategory) => {
            console.log("removed category: ", removedCategory);
            return Img.findByIdAndRemove(removedCategory.img).exec();
          }
        );

        // (this feels really ugly, but I can't think of a nicer way to handle
        //  Promise B & Promise C both having a dependency on Promise A)
        Promise.all([removeCategoryPromise, removeImgPromise])
          .then(([removedCategory, removedImg]) => {
            console.log(
              `removed: ${removedCategory.name} (${removedCategory._id})`
            );
            console.log(
              `removed: img ${removedImg._id} (${removedImg.version})`
            );

            console.log("beginning to remove from cloudinary");

            return cloudinary.uploader
              .destroy(removedImg.full_path, {
                invalidate: true,
                version: removedImg.version,
              })
              .then(console.log);
          })
          .then(() => {
            console.log("should have removed from cloudinary");
            res.redirect(`/${INV_URL_NAME}/categories`);
          })
          .catch(next);
      }
    })
    .catch(next);
};

exports.getUpdateCategory = (req, res, next) => {
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

    if (req.body.adminpw !== process.env.ADMIN_PW) {
      errors = [
        {
          msg: "Invalid password",
          param: "adminpw",
          location: "body",
        },
      ];
    }

    const id = mongoose.Types.ObjectId(req.params.id);

    // b/c I'm updating, I can send an obj literal instead of an instance of my model
    const category = { name: req.body.name, _id: id };

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

      console.log("beginning update");

      const updateCategoryPromise = Category.findByIdAndUpdate(id, category, {
        new: true,
      })
        .populate("img")
        .exec();

      const updateImgPromise = updateCategoryPromise.then((updatedCategory) => {
        const localImagePath = UPLOAD_PATH + "/" + req.file.filename;
        const cloudinaryUploadPromise = cloudinary.uploader.upload(
          localImagePath,
          {
            folder: updatedCategory.img.folder,
            public_id: updatedCategory.img._id,
            invalidate: true,
          }
        );

        // clear local copy of image
        cloudinaryUploadPromise.then(() =>
          fs.unlink(localImagePath, console.error)
        );

        return cloudinaryUploadPromise;
      });

      Promise.all([updateCategoryPromise, updateImgPromise]).then(
        ([updatedCategory, cloudUploadResponse]) => {
          console.log("Cloud Image:");
          console.log(cloudUploadResponse);
          // Update img document with new cloudinary image version
          const updatedImg = {
            version: cloudUploadResponse.version,
            _id: updatedCategory.img._id,
          };

          return Img.findByIdAndUpdate(updatedImg._id, updatedImg);
        }
      );

      Promise.all([updateCategoryPromise, updateImgPromise])
        .then(([updatedCategory]) => {
          res.redirect(updatedCategory.url);
        })
        .catch((err) => {
          next(err);
        });
    }
  },
];
