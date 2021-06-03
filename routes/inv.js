const express = require("express");
const router = express.Router();

// middleware for handling file uploads
const multer = require("multer");
const upload = multer({
  dest: "/tmp/uploads/",
  // TODO: fileFilter: function to control which files are accepted
  // (filter invalid MIMEtypes)
  // TODO: limits: (add filesize limit--1mb)
});

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
  //! upload.single("icon"),
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
  //! upload.single("icon"),
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
