const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const { INV_URL_NAME } = require("../consts");

const Product = require("../models/product");
const Category = require("../models/category");
const Img = require("../models/img");
const { UPLOAD_PATH } = require("../rootdir");

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const validateAndSanitize = [
  body("name").trim().isLength({ min: 3, max: 100 }),
  body("description").trim().isLength({ min: 3, max: 3000 }),
  body("price").trim().isNumeric().escape(),
  body("stock").trim().isNumeric({ no_symbols: true }),
  //body("category").trim().isUUID().escape(),
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
    .populate(["category", "img"])
    .exec()
    .then((product) => {
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
      // get full list of categories, to provide as options
      Category.find({}).exec(),
      // ensure selected category exists
      Category.findById(req.body.category).exec(),
      // ensure there isn't already a product with this name
      Product.find({ name: req.body.name }).exec(),
    ])
      .then(([categories, category, matchedName]) => {
        const errors = validationResult(req).array();

        const img = new Img({ folder: "product" });

        const { name, description, price, stock } = req.body;
        const product = new Product({
          name,
          description,
          price,
          stock,
          img: img._id,
          category: category ?? categories[0],
        });

        // Only partial error API
        if (req.body.adminpw !== process.env.ADMIN_PW) {
          // password is incorrect. Don't bother with further error checking
          res.status = 401;
          errors.push({
            msg: "Invalid password",
            param: "adminpw",
            location: "body",
          });
        } else {
          if (!category) {
            errors.push({
              msg: "Category was not valid",
              param: "category",
              value: req.body.category,
              location: "body",
            });
          }

          if (matchedName && matchedName.length > 0) {
            errors.push({
              msg: "Product name cannot already exist",
              param: "name",
              value: req.body.name,
              location: "body",
            });
          }
        }

        if (errors.length > 0) {
          res.render("product_form", {
            title: "Create Product",
            categories,
            product,
            errors,
          });
          return;
        }

        // ALL ERROR CHECKING PASSED!
        if (!req.file?.filename) {
          console.log("NOT attempting upload to cloudinary...");
          Promise.all([product.save(), img.save()])
            .then(() => res.redirect(product.url))
            .catch(next);
        } else {
          const imageLocation = UPLOAD_PATH + "/" + req.file.filename;
          console.log("Attempting upload to cloudinary");
          cloudinary.uploader
            .upload(imageLocation, {
              folder: img.folder,
              public_id: img._id,
            })
            .then((cloudUploadResponse) => {
              fs.unlink(imageLocation, console.error);
              img.version = cloudUploadResponse.version;
              return img.save();
            })
            .then(() => product.save())
            .then(({ url }) => res.redirect(url))
            .catch(next);
        }
      })
      .catch(next);
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
    const errors = validationResult(req).array();

    if (req.body.adminpw !== process.env.ADMIN_PW) {
      res.status = 401;
      errors.push({
        msg: "Invalid password",
        param: "adminpw",
        location: "body",
      });
    }

    // TODO: this doesn't really make sense anymore
    if (errors.length > 0) {
      const err = new Error("Product not found!");
      err.status = 404;
      return next(err);
    }

    const id = mongoose.Types.ObjectId(req.body.productid);
    Product.findByIdAndRemove(id)
      .exec()
      .then((removedProduct) => {
        // this is probably superfluous
        if (removedProduct == null) {
          const err = new Error("Product not found!");
          err.status = 404;
          return next(err);
        }

        return Img.findByIdAndRemove(removedProduct.img);
      })
      .then((removedImg) => {
        return cloudinary.uploader.destroy(removedImg.full_path, {
          invalidate: true,
          version: removedImg.version,
        });
      })
      .then(() => res.redirect(`/${INV_URL_NAME}/products`))
      .catch((err) => next(err));
  },
];

exports.getUpdateProduct = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  Promise.all([Product.findById(id).exec(), Category.find({}).exec()])
    .then(([product, categories]) => {
      if (product == null) {
        const err = new Error("Product not found!");
        err.status = 404;
        return next(err);
      }

      res.render("product_form", {
        title: `Update Product ${product.name}`,
        product,
        categories,
      });
    })
    .catch((err) => next(err));
};

exports.postUpdateProduct = [
  ...validateAndSanitize,
  (req, res, next) => {
    const id = mongoose.Types.ObjectId(req.params.id);

    Promise.all([
      Product.findById(id).exec(),
      // find any products that already have the same name
      Product.find({ name: req.body.name, _id: { $ne: req.params.id } }).exec(),
      // find the selected category
      Category.findById(mongoose.Types.ObjectId(req.body.category)).exec(),
    ])
      .then(([oldProduct, matchedProducts, category]) => {
        console.log("req.body:");
        console.log(req.body);
        console.log("oldProduct:");
        console.log(oldProduct);
        const { name, description, price, stock } = req.body;

        // representing product w object literal, since I don't know
        const product = new Product({
          name,
          description,
          price,
          stock,
          category,
          img: oldProduct.img,
          _id: id,
        });

        const errors = validationResult(req).array();

        if (req.body.adminpw !== process.env.ADMIN_PW) {
          res.status = 401;
          errors.push({
            msg: "Invalid password",
            param: "adminpw",
            location: "body",
          });
        } else {
          if (matchedProducts.length > 0) {
            // given name is invalid (already exists on a different product)
            errors.push({
              msg: "Product name is already in use. Cannot use an existing product name",
              param: "name",
              value: req.body.name,
              location: "body",
            });
          }

          if (!category) {
            // given category doesn't exist
            errors.push({
              msg: "Selected category could not be found. Please select a valid category",
              param: "category",
              value: req.body.category,
              location: "body",
            });
          }
        }

        // send back with any validation errors
        if (errors.length > 0) {
          // first, get list of categories to populate form
          Category.find({})
            .exec()
            .then((categories) => {
              res.render("product_form", {
                title: `Update Product ${oldProduct.name}`,
                product,
                categories,
                errors,
              });
            })
            .catch((err) => next(err));
          return;
        }

        // all validation passed

        if (!req.file?.filename) {
          Product.findByIdAndUpdate(id, product)
            .exec()
            .then((updatedProduct) => {
              res.redirect(updatedProduct.url);
            })
            .catch((err) => next(err));
        } else {
          const localImagePath = UPLOAD_PATH + "/" + req.file.filename;

          const updateProductPromise = Product.findByIdAndUpdate(id, product, {
            new: true,
          })
            .populate("img")
            .exec();

          const uploadImgPromise = updateProductPromise.then(
            (updatedProduct) => {
              return cloudinary.uploader.upload(localImagePath, {
                folder: updatedProduct.img.folder,
                public_id: updatedProduct.img._id,
                invalidate: true,
              });
            }
          );

          const updateImgPromise = Promise.all([
            updateProductPromise,
            uploadImgPromise,
          ]).then(([updatedProduct, cloudUploadResponse]) => {
            fs.unlink(localImagePath, console.error);

            const updatedImg = {
              version: cloudUploadResponse.version,
              _id: updatedProduct.img._id,
            };

            return Img.findByIdAndUpdate(updatedImg._id, updatedImg, {
              new: true,
            });
          });

          Promise.all([updateProductPromise, updateImgPromise]).then(
            ([updatedProduct]) => {
              res.redirect(updatedProduct.url);
            }
          );
        }
      })
      .catch(next);
  },
];
