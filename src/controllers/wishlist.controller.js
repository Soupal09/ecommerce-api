
const wishlistService = require("../services/wishlist.service");

const addToWishlist = async (req, res) => {
    try {
        const wishlistItem = await wishlistService.addToWishlist(
            req.user.id,
            Number(req.body.productId)
        );

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist successfully",
            data: wishlistItem
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to add product to wishlist"
        });
    }
};

const getWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.getWishlist(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully",
            data: wishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist"
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        await wishlistService.removeFromWishlist(
            req.user.id,
            Number(req.params.productId)
        );

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully"
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to remove product from wishlist"
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};
