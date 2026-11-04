const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id"
    },
    orderNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: "order_number"
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_amount"
    },
    shippingAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: "shipping_amount"
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: "discount_amount"
    },
    finalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "final_amount"
    },
    paymentStatus: {
        type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING",
        field: "payment_status"
    },
    orderStatus: {
        type: DataTypes.ENUM(
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
        field: "order_status"
    },
    shippingAddress: {
        type: DataTypes.JSON,
        allowNull: false,
        field: "shipping_address"
    }
}, {
    tableName: "orders",
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ["user_id"]
        },
        {
            fields: ["order_number"]
        }
    ]
});

module.exports = Order;