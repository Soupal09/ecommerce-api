
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CartItem = sequelize.define("CartItem", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "cart_id"
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "product_id"
    },
    variantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "variant_id"
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: "cart_items",
    timestamps: true,
    underscored: true
});

module.exports = CartItem;
