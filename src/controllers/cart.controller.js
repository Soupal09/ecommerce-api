
const cartService = require("../services/cart.service");

const addToCart = async (req, res) => {
    try {
        const cartItem = await cartService.addToCart(req.user.id, req.body);

        return res.status(201).json({
            success: true,
            message: "Product added to cart successfully",
            data: cartItem
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to add product to cart"
        });
    }
};

const getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const cartItem = await cartService.updateCartItem(
            req.user.id,
            Number(req.params.id),
            req.body.quantity
        );

        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: cartItem
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to update cart item"
        });
    }
};

const removeCartItem = async (req, res) => {
    try {
        await cartService.removeCartItem(
            req.user.id,
            Number(req.params.id)
        );

        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully"
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to remove cart item"
        });
    }
};

const clearCart = async (req, res) => {
    try {
        await cartService.clearCart(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to clear cart"
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
