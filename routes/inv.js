const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");

router.get("/", productController.index);

router.get("/products", productController.productList);
router.get("/product/:id", productController.productDetail);

// CATEGORY ROUTES
router.get("/categories", categoryController.categoryList);

router.get("/category/create", categoryController.getCreateCategory);
router.post("/category/create", categoryController.postCreateCategory);

router.get("/category/:id", categoryController.categoryDetail);

// Operations on specific categories (DELETE, UPDATE)
router.get("/category/:id/delete", categoryController.getDeleteCategory);
router.post("/category/:id/delete", categoryController.postDeleteCategory);
router.get("/category/:id/update", categoryController.getUpdateCategory);
router.post("/category/:id/update", categoryController.postUpdateCategory);

module.exports = router;
