
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "category_id"
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(250),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    brand: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "base_price"
    },
    discountPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "discount_price"
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
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
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0
    }
}, {
    tableName: "products",
    underscored: true,
    timestamps: true
});

module.exports = Product;
