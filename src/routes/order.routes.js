
const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const {
    checkout,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/order.controller");

router.use(authenticate);

router.get("/admin/all", authorize(1), getAllOrders);
router.patch("/admin/:id/status", authorize(1), updateOrderStatus);

router.post("/checkout", checkout);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
