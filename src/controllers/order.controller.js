
const orderService = require("../services/order.service");

const checkout = async (req, res) => {
    try {
        const order = await orderService.checkout(
            req.user.id,
            Number(req.body.addressId)
        );

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: order
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to place order"
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const result = await orderService.getMyOrders(
            req.user.id,
            req.query
        );

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: result.orders,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await orderService.getOrderById(
            req.user.id,
            Number(req.params.id)
        );

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to fetch order"
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await orderService.cancelOrder(
            req.user.id,
            Number(req.params.id)
        );

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: order
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to cancel order"
        });
    }
};



const getAllOrders = async (req, res) => {
    try {
        const result = await orderService.getAllOrders(req.query);

        return res.status(200).json({
            success: true,
            message: "All orders fetched successfully",
            data: result.orders,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const order = await orderService.updateOrderStatus(
            Number(req.params.id),
            req.body.orderStatus
        );

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to update order status"
        });
    }
};


module.exports = {
    checkout,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
};
