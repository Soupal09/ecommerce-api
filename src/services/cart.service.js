
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const {
    Cart,
    CartItem,
    Product,
    ProductImage,
    ProductVariant
} = require("../models");

const addToCart = async (userId, data) => {
    const { productId, variantId, quantity } = data;

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        throw Object.assign(new Error("Valid productId and positive quantity are required"), { statusCode: 400 });
    }

    const transaction = await sequelize.transaction();

    try {
        const product = await Product.findOne({
            where: {
                id: productId,
                status: "ACTIVE"
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!product) {
            throw Object.assign(new Error("Product not found or inactive"), { statusCode: 404 });
        }

        let variant = null;
        let availableStock = product.stock;
        let price = product.discountPrice || product.basePrice;

        if (variantId) {
            variant = await ProductVariant.findOne({
                where: {
                    id: variantId,
                    productId,
                    status: "ACTIVE"
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!variant) {
                throw Object.assign(new Error("Product variant not found or inactive"), { statusCode: 404 });
            }

            availableStock = variant.stock;
            price = variant.price;
        }

        let cart = await Cart.findOne({
            where: { userId },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!cart) {
            cart = await Cart.create({ userId }, { transaction });
        }

        const itemWhere = {
            cartId: cart.id,
            productId,
            variantId: variantId || { [Op.is]: null }
        };

        const existingItem = await CartItem.findOne({
            where: itemWhere,
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        const newQuantity = existingItem
            ? existingItem.quantity + quantity
            : quantity;

        if (newQuantity > availableStock) {
            throw Object.assign(new Error("Requested quantity exceeds available stock"), { statusCode: 400 });
        }

        let cartItem;

        if (existingItem) {
            await existingItem.update({
                quantity: newQuantity,
                price
            }, { transaction });

            cartItem = existingItem;
        } else {
            cartItem = await CartItem.create({
                cartId: cart.id,
                productId,
                variantId: variantId || null,
                quantity,
                price
            }, { transaction });
        }

        await transaction.commit();

        return cartItem;
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }

        throw error;
    }
};

const getCart = async (userId) => {
    const cart = await Cart.findOne({
        where: { userId },
        include: [{
            model: CartItem,
            include: [
                {
                    model: Product,
                    include: [{ model: ProductImage }]
                },
                {
                    model: ProductVariant
                }
            ]
        }]
    });

    if (!cart) {
        return {
            items: [],
            totalItems: 0,
            totalAmount: 0
        };
    }

    const items = cart.CartItems.map(item => {
        const subtotal = Number(item.price) * item.quantity;

        return {
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: Number(item.price),
            subtotal,
            product: item.Product,
            variant: item.ProductVariant
        };
    });

    const totalAmount = items.reduce(
        (total, item) => total + item.subtotal,
        0
    );

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return {
        id: cart.id,
        items,
        totalItems,
        totalAmount: Number(totalAmount.toFixed(2))
    };
};

const updateCartItem = async (userId, itemId, quantity) => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw Object.assign(new Error("Quantity must be a positive integer"), { statusCode: 400 });
    }

    const cart = await Cart.findOne({
        where: { userId }
    });

    if (!cart) {
        throw Object.assign(new Error("Cart not found"), { statusCode: 404 });
    }

    const transaction = await sequelize.transaction();

    try {
        const item = await CartItem.findOne({
            where: {
                id: itemId,
                cartId: cart.id
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!item) {
            throw Object.assign(new Error("Cart item not found"), { statusCode: 404 });
        }

        const product = await Product.findOne({
            where: {
                id: item.productId,
                status: "ACTIVE"
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!product) {
            throw Object.assign(new Error("Product not found or inactive"), { statusCode: 404 });
        }

        let availableStock = product.stock;
        let price = product.discountPrice || product.basePrice;

        if (item.variantId) {
            const variant = await ProductVariant.findOne({
                where: {
                    id: item.variantId,
                    productId: item.productId,
                    status: "ACTIVE"
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!variant) {
                throw Object.assign(new Error("Product variant not found or inactive"), { statusCode: 404 });
            }

            availableStock = variant.stock;
            price = variant.price;
        }

        if (quantity > availableStock) {
            throw Object.assign(new Error("Requested quantity exceeds available stock"), { statusCode: 400 });
        }

        await item.update({
            quantity,
            price
        }, { transaction });

        await transaction.commit();

        return item;
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }

        throw error;
    }
};

const removeCartItem = async (userId, itemId) => {
    const cart = await Cart.findOne({
        where: { userId }
    });

    if (!cart) {
        throw Object.assign(new Error("Cart not found"), { statusCode: 404 });
    }

    const item = await CartItem.findOne({
        where: {
            id: itemId,
            cartId: cart.id
        }
    });

    if (!item) {
        throw Object.assign(new Error("Cart item not found"), { statusCode: 404 });
    }

    await item.destroy();

    return true;
};

const clearCart = async (userId) => {
    const cart = await Cart.findOne({
        where: { userId }
    });

    if (!cart) {
        return true;
    }

    await CartItem.destroy({
        where: { cartId: cart.id }
    });

    return true;
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
