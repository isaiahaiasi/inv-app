const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");

router.get("/", productController.index);

router.get("/products", productController.productList);
router.get("/product/:id", productController.productDetail);

router.get("/categories", categoryController.categoryList);

router.get("/category/create", categoryController.getCreateCategory);
router.post("/category/create", categoryController.postCreateCategory);

router.get("/category/:id", categoryController.categoryDetail);

router.get("/category/:id/delete", categoryController.getDeleteCategory);

module.exports = router;
