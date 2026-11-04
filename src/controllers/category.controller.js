
const categoryService = require("../services/category.service");

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to create category"
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const result = await categoryService.getAllCategories(req.query);

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: result.categories,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(
            Number(req.params.id)
        );

        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: category
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to fetch category"
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(
            Number(req.params.id),
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to update category"
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(Number(req.params.id));

        return res.status(200).json({
            success: true,
            message: "Category deactivated successfully"
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Failed to deactivate category"
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
