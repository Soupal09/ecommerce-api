
const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");

const {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require("../controllers/cart.controller");

router.use(authenticate);

router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:id", updateCartItem);
router.delete("/items/:id", removeCartItem);
router.delete("/", clearCart);

module.exports = router;
