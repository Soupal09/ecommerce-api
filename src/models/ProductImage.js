
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductImage = sequelize.define("ProductImage", {
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
    imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: "image_url"
    },
    publicId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "public_id"
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_primary"
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "sort_order"
    }
}, {
    tableName: "product_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = ProductImage;
