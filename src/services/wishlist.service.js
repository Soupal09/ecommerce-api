
const { Wishlist, Product, ProductImage } = require("../models");

const createError = (message, statusCode) => {
    return Object.assign(new Error(message), { statusCode });
};

const addToWishlist = async (userId, productId) => {
    const product = await Product.findOne({
        where: {
            id: productId,
            status: "ACTIVE"
        }
    });

    if (!product) {
        throw createError("Active product not found", 404);
    }

    const [wishlistItem, created] = await Wishlist.findOrCreate({
        where: {
            userId,
            productId
        },
        defaults: {
            userId,
            productId
        }
    });

    if (!created) {
        throw createError("Product already exists in wishlist", 409);
    }

    return wishlistItem;
};

const getWishlist = async (userId) => {
    return await Wishlist.findAll({
        where: { userId },
        include: [
            {
                model: Product,
                where: {
                    status: "ACTIVE"
                },
                include: [
                    {
                        model: ProductImage
                    }
                ]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

const removeFromWishlist = async (userId, productId) => {
    const wishlistItem = await Wishlist.findOne({
        where: {
            userId,
            productId
        }
    });

    if (!wishlistItem) {
        throw createError("Product not found in wishlist", 404);
    }

    await wishlistItem.destroy();

    return true;
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};
