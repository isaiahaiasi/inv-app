const express = require("express");
const router = express.Router();

const { nanoid } = require("nanoid");

// TODO: I just want a reference to the root project directory...
// Is this the best way? I'm guessing not.
const { UPLOAD_PATH } = require("../rootdir");

// need to create directory if it doesn't already exist
const fs = require("fs");

// middleware for handling file uploads
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = UPLOAD_PATH.toString();

    console.log(dir);
    console.log(typeof dir);

    fs.access(dir, (err) => {
      if (err) {
        // directory does not exist yet, so I'll have to create it...
        fs.mkdir(dir, { recursive: true }, (err) => {
          if (err) {
            console.error(err);
            cb(err);
          }

          // directory has been created, should be safe to set destination
          cb(null, dir);
        });
      } else {
        // directory already exists, safe to set destination
        cb(null, dir);
      }
    });
  },

  filename: (req, file, cb) => {
    const splitMime = file.mimetype.split("/");
    const ext = splitMime[splitMime.length - 1];
    cb(null, `${nanoid(10)}.${ext}`);
  },
});

const upload = multer({ storage });

const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");

router.get("/", productController.index);

//-----------------------
// PRODUCT ROUTES
//-----------------------
router.get("/products", productController.productList);

// "CREATE" ROUTES (must go b/f :id urls)
router.get("/product/create", productController.getCreateProduct);
router.post("/product/create", [
  // TODO: handle image upload for product via multer
  // upload.single("icon"),
  productController.postCreateProduct,
]);

router.get("/product/:id", productController.productDetail);

// Operations on specific products (DELETE, UPDATE)
router.get("/product/:id/delete", productController.getDeleteProduct);
router.post("/product/:id/delete", productController.postDeleteProduct);
router.get("/product/:id/update", productController.getUpdateProduct);
router.post("/product/:id/update", [
  // TODO: handle image upload for product via multer
  //! upload.single("icon"),
  productController.postUpdateProduct,
]);

//-----------------------
// CATEGORY ROUTES
//-----------------------
router.get("/categories", categoryController.categoryList);

// "CREATE" ROUTES (must go b/f :id urls)
router.get("/category/create", categoryController.getCreateCategory);
router.post("/category/create", [
  // TODO: handle image upload for category via multer
  upload.single("icon_upload"),
  categoryController.postCreateCategory,
]);

router.get("/category/:id", categoryController.categoryDetail);

// Operations on specific categories (DELETE, UPDATE)
router.get("/category/:id/delete", categoryController.getDeleteCategory);
router.post("/category/:id/delete", categoryController.postDeleteCategory);
router.get("/category/:id/update", categoryController.getUpdateCategory);
router.post("/category/:id/update", [
  // TODO: handle image upload for category via multer
  //! upload.single("icon"),
  categoryController.postUpdateCategory,
]);

module.exports = router;
