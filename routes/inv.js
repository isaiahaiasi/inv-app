const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");

router.get("/", productController.index);

router.get("/products", productController.productList);
router.get("/product/:id", productController.productDetail);

router.get("/categories", categoryController.categoryList);
router.get("/category/:id", categoryController.categoryDetail);
module.exports = router;
