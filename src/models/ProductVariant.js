
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductVariant = sequelize.define("ProductVariant", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "product_id"
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    color: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    size: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE"
    }
}, {
    tableName: "product_variants",
    timestamps: true,
    underscored: true
});

module.exports = ProductVariant;
