
const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} = require("../controllers/wishlist.controller");

router.use(authenticate);

router.post("/", addToWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
