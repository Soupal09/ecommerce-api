
const productService = require("../services/product.service");

const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to create product"
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const result = await productService.getAllProducts(req.query);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: result.products,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(
            Number(req.params.id)
        );

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to fetch product"
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(
            Number(req.params.id),
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to update product"
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(
            Number(req.params.id)
        );

        return res.status(200).json({
            success: true,
            message: "Product deactivated successfully"
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to deactivate product"
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
