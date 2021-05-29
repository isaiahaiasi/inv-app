const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

router.get("/", productController.index);
router.get("/products", productController.productList);
router.get("/product/:id", productController.productDetail);

module.exports = router;
