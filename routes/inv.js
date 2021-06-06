const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");

const upload = require("../multerHandler");

router.get("/", productController.index);

//-----------------------
// PRODUCT ROUTES
//-----------------------
router.get("/products", productController.productList);

// CREATE (must go b/f :id urls)
router.get("/product/create", productController.getCreateProduct);
router.post("/product/create", [
  //! NOTE: ONCE ENCTYPE ADDED TO FORM, REQ.BODY BREAKS W/O MULTER MIDDLEWARE
  upload.single("icon_upload"),
  productController.postCreateProduct,
]);

// GET DETAILS
router.get("/product/:id", productController.productDetail);

// DELETE
// TODO: remove image from cloudinary storage
router.get("/product/:id/delete", productController.getDeleteProduct);
router.post("/product/:id/delete", productController.postDeleteProduct);

// UPDATE
router.get("/product/:id/update", productController.getUpdateProduct);
router.post("/product/:id/update", [
  upload.single("icon_upload"),
  productController.postUpdateProduct,
]);

//-----------------------
// CATEGORY ROUTES
//-----------------------
router.get("/categories", categoryController.categoryList);

// CREATE (must go b/f :id urls)
router.get("/category/create", categoryController.getCreateCategory);
router.post("/category/create", [
  upload.single("icon_upload"),
  categoryController.postCreateCategory,
]);

// READ
router.get("/category/:id", categoryController.categoryDetail);

// DELETE
router.get("/category/:id/delete", categoryController.getDeleteCategory);
router.post("/category/:id/delete", categoryController.postDeleteCategory);

// UPDATE
router.get("/category/:id/update", categoryController.getUpdateCategory);
router.post("/category/:id/update", [
  upload.single("icon_upload"),
  categoryController.postUpdateCategory,
]);

module.exports = router;
