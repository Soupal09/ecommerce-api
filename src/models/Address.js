const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Address = sequelize.define("Address", {
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
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    addressLine1: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "address_line1"
    },
    addressLine2: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "address_line2"
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    postalCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "postal_code"
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_default"
    }
}, {
    tableName: "addresses",
    timestamps: true,
    underscored: true
});

module.exports = Address;