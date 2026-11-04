const User = require("./User");
const Role = require("./Role");
const RefreshToken = require("./RefreshToken");
const Category = require("./Category");
const Product = require("./Product");
const ProductImage = require("./ProductImage");
const ProductVariant = require("./ProductVariant");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Wishlist = require("./Wishlist");
const Address = require("./Address");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

Role.hasMany(User, {
    foreignKey: "roleId"
});

User.belongsTo(Role, {
    foreignKey: "roleId"
});

User.hasMany(RefreshToken, {
    foreignKey: "userId",
    onDelete: "CASCADE"
});

RefreshToken.belongsTo(User, {
    foreignKey: "userId"
});

Category.hasMany(Product, {
    foreignKey: "categoryId"
});

Product.belongsTo(Category, {
    foreignKey: "categoryId"
});

Product.hasMany(ProductImage, {
    foreignKey: "productId",
    onDelete: "CASCADE"
});

ProductImage.belongsTo(Product, {
    foreignKey: "productId"
});

Product.hasMany(ProductVariant, {
    foreignKey: "productId",
    onDelete: "CASCADE"
});

ProductVariant.belongsTo(Product, {
    foreignKey: "productId"
});

User.hasOne(Cart, {
    foreignKey: "userId",
    onDelete: "CASCADE"
});

Cart.belongsTo(User, {
    foreignKey: "userId"
});

Cart.hasMany(CartItem, {
    foreignKey: "cartId",
    onDelete: "CASCADE"
});

CartItem.belongsTo(Cart, {
    foreignKey: "cartId"
});

CartItem.belongsTo(Product, {
    foreignKey: "productId"
});

Product.hasMany(CartItem, {
    foreignKey: "productId"
});

CartItem.belongsTo(ProductVariant, {
    foreignKey: "variantId"
});

ProductVariant.hasMany(CartItem, {
    foreignKey: "variantId"
});

User.hasMany(Wishlist, {
    foreignKey: "userId",
    onDelete: "CASCADE"
});

Wishlist.belongsTo(User, {
    foreignKey: "userId"
});

Product.hasMany(Wishlist, {
    foreignKey: "productId",
    onDelete: "CASCADE"
});

Wishlist.belongsTo(Product, {
    foreignKey: "productId"
});

User.hasMany(Address, {
    foreignKey: "userId",
    onDelete: "CASCADE"
});

Address.belongsTo(User, {
    foreignKey: "userId"
});

User.hasMany(Order, {
    foreignKey: "userId",
    onDelete: "CASCADE"
});

Order.belongsTo(User, {
    foreignKey: "userId"
});

Order.hasMany(OrderItem, {
    foreignKey: "orderId",
    onDelete: "CASCADE"
});

OrderItem.belongsTo(Order, {
    foreignKey: "orderId"
});

OrderItem.belongsTo(Product, {
    foreignKey: "productId"
});

Product.hasMany(OrderItem, {
    foreignKey: "productId"
});

OrderItem.belongsTo(ProductVariant, {
    foreignKey: "variantId"
});

ProductVariant.hasMany(OrderItem, {
    foreignKey: "variantId"
});

module.exports = {
    User,
    Role,
    RefreshToken,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Cart,
    CartItem,
    Wishlist,
    Address,
    Order,
    OrderItem
};