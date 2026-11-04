
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const {
    Order,
    OrderItem,
    Cart,
    CartItem,
    Product,
    ProductVariant,
    Address
} = require("../models");

const createError = (message, statusCode) => {
    return Object.assign(new Error(message), { statusCode });
};

const generateOrderNumber = () => {
    return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const checkout = async (userId, addressId) => {
    return await sequelize.transaction(async (transaction) => {
        const address = await Address.findOne({
            where: {
                id: addressId,
                userId
            },
            transaction
        });

        if (!address) {
            throw createError("Shipping address not found", 404);
        }

        const cart = await Cart.findOne({
            where: { userId },
            include: [
                {
                    model: CartItem,
                    include: [
                        { model: Product },
                        { model: ProductVariant }
                    ]
                }
            ],
            transaction
        });

        if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
            throw createError("Cart is empty", 400);
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.CartItems) {
            const product = item.Product;
            const variant = item.ProductVariant;

            if (!product || product.status !== "ACTIVE") {
                throw createError("Product is unavailable", 400);
            }

            if (item.variantId) {
                if (!variant || variant.status !== "ACTIVE") {
                    throw createError("Product variant is unavailable", 400);
                }

                if (variant.stock < item.quantity) {
                    throw createError("Insufficient variant stock", 400);
                }
            } else if (product.stock < item.quantity) {
                throw createError("Insufficient product stock", 400);
            }

            const unitPrice = Number(
                variant
                    ? variant.price
                    : product.discountPrice || product.basePrice
            );

            const subtotal = unitPrice * item.quantity;

            totalAmount += subtotal;

            orderItems.push({
                productId: product.id,
                variantId: item.variantId,
                productName: product.name,
                sku: variant ? variant.sku : product.sku,
                quantity: item.quantity,
                unitPrice,
                subtotal
            });
        }

        const order = await Order.create({
            userId,
            orderNumber: generateOrderNumber(),
            totalAmount,
            shippingAmount: 0,
            discountAmount: 0,
            finalAmount: totalAmount,
            paymentStatus: "PENDING",
            orderStatus: "PENDING",
            shippingAddress: address.toJSON()
        }, { transaction });

        for (const item of orderItems) {
            await OrderItem.create({
                orderId: order.id,
                ...item
            }, { transaction });

            if (item.variantId) {
                await ProductVariant.decrement("stock", {
                    by: item.quantity,
                    where: {
                        id: item.variantId,
                        stock: { [Op.gte]: item.quantity }
                    },
                    transaction
                });
            } else {
                await Product.decrement("stock", {
                    by: item.quantity,
                    where: {
                        id: item.productId,
                        stock: { [Op.gte]: item.quantity }
                    },
                    transaction
                });
            }
        }

        await CartItem.destroy({
            where: { cartId: cart.id },
            transaction
        });

        return order;
    });
};

const getMyOrders = async (userId, query) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(query.limit, 10) || 10)
    );

    const { count, rows } = await Order.findAndCountAll({
        where: { userId },
        include: [{ model: OrderItem }],
        order: [["createdAt", "DESC"]],
        limit,
        offset: (page - 1) * limit,
        distinct: true
    });

    return {
        orders: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const getOrderById = async (userId, orderId) => {
    const order = await Order.findOne({
        where: {
            id: orderId,
            userId
        },
        include: [{ model: OrderItem }]
    });

    if (!order) {
        throw createError("Order not found", 404);
    }

    return order;
};

const cancelOrder = async (userId, orderId) => {
    return await sequelize.transaction(async (transaction) => {
        const order = await Order.findOne({
            where: {
                id: orderId,
                userId
            },
            include: [{ model: OrderItem }],
            transaction
        });

        if (!order) {
            throw createError("Order not found", 404);
        }

        if (!["PENDING", "CONFIRMED"].includes(order.orderStatus)) {
            throw createError("This order cannot be cancelled", 400);
        }

        for (const item of order.OrderItems) {
            if (item.variantId) {
                await ProductVariant.increment("stock", {
                    by: item.quantity,
                    where: { id: item.variantId },
                    transaction
                });
            } else {
                await Product.increment("stock", {
                    by: item.quantity,
                    where: { id: item.productId },
                    transaction
                });
            }
        }

        await order.update({
            orderStatus: "CANCELLED"
        }, { transaction });

        return order;
    });
};


const getAllOrders = async (query) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10));

    const where = {};

    if (query.orderStatus) {
        where.orderStatus = query.orderStatus;
    }

    if (query.paymentStatus) {
        where.paymentStatus = query.paymentStatus;
    }

    const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{ model: OrderItem }],
        order: [["createdAt", "DESC"]],
        limit,
        offset: (page - 1) * limit,
        distinct: true
    });

    return {
        orders: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const updateOrderStatus = async (orderId, orderStatus) => {
    const allowedStatuses = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED"
    ];

    if (!allowedStatuses.includes(orderStatus)) {
        throw createError("Invalid order status", 400);
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
        throw createError("Order not found", 404);
    }

    await order.update({ orderStatus });

    return order;
};

module.exports = {
    checkout,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
};
