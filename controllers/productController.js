const Product = require("../models/product");

exports.index = (req, res, next) => {
  // get the products
  Product.countDocuments({ stock: { $gte: 1 } })
    .then((count) => {
      console.log("count: ", count);
      res.render("index", { title: "Inv App", count });
    })
    .catch((err) => {
      next(err);
    });
};
