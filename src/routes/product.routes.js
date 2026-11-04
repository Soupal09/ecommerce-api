const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/product.controller");

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", authenticate, authorize(1), createProduct);
router.put("/:id", authenticate, authorize(1), updateProduct);
router.delete("/:id", authenticate, authorize(1), deleteProduct);

module.exports = router;