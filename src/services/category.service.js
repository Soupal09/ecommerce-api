
const { Op } = require("sequelize");
const { Category, Product } = require("../models");

const createError = (message, statusCode) => {
    return Object.assign(new Error(message), { statusCode });
};

const generateSlug = (value) => {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

const validateCategoryData = (data) => {
    if (
        !data.name ||
        typeof data.name !== "string" ||
        !data.name.trim()
    ) {
        throw createError("Category name is required", 400);
    }

    if (
        data.status !== undefined &&
        !["ACTIVE", "INACTIVE"].includes(data.status)
    ) {
        throw createError("Invalid category status", 400);
    }
};

const checkUniqueCategory = async (name, slug, excludeId = null) => {
    const conditions = [
        { name },
        { slug }
    ];

    const category = await Category.findOne({
        where: {
            [Op.or]: conditions,
            ...(excludeId && {
                id: { [Op.ne]: excludeId }
            })
        }
    });

    if (category) {
        if (category.name.toLowerCase() === name.toLowerCase()) {
            throw createError("Category name already exists", 409);
        }

        throw createError("Category slug already exists", 409);
    }
};

const createCategory = async (data) => {
    validateCategoryData(data);

    const name = data.name.trim();
    const slug = generateSlug(data.slug || name);

    if (!slug) {
        throw createError("Valid category slug is required", 400);
    }

    await checkUniqueCategory(name, slug);

    return await Category.create({
        name,
        slug,
        description: data.description || null,
        image: data.image || null,
        status: data.status || "ACTIVE"
    });
};

const getAllCategories = async (query) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(query.limit, 10) || 20)
    );

    const offset = (page - 1) * limit;

    const where = {};

    if (query.status) {
        where.status = query.status;
    }

    const { count, rows } = await Category.findAndCountAll({
        where,
        order: [["createdAt", "DESC"]],
        limit,
        offset
    });

    return {
        categories: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const getCategoryById = async (id) => {
    const category = await Category.findByPk(id);

    if (!category) {
        throw createError("Category not found", 404);
    }

    return category;
};

const updateCategory = async (id, data) => {
    const category = await Category.findByPk(id);

    if (!category) {
        throw createError("Category not found", 404);
    }

    const updateData = {};

    if (data.name !== undefined) {
        updateData.name = data.name.trim();
    }

    if (data.slug !== undefined) {
        updateData.slug = generateSlug(data.slug);
    } else if (updateData.name !== undefined) {
        updateData.slug = generateSlug(updateData.name);
    }

    if (data.description !== undefined) {
        updateData.description = data.description;
    }

    if (data.image !== undefined) {
        updateData.image = data.image;
    }

    if (data.status !== undefined) {
        updateData.status = data.status;
    }

    const mergedData = {
        ...category.toJSON(),
        ...updateData
    };

    validateCategoryData(mergedData);

    if (!mergedData.slug) {
        throw createError("Valid category slug is required", 400);
    }

    await checkUniqueCategory(
        mergedData.name,
        mergedData.slug,
        category.id
    );

    await category.update(updateData);

    return category;
};

const deleteCategory = async (id) => {
    const category = await Category.findByPk(id);

    if (!category) {
        throw createError("Category not found", 404);
    }

    const existingProduct = await Product.findOne({
        where: {
            categoryId: id
        }
    });

    if (existingProduct) {
        throw createError(
            "Category cannot be deleted because products are associated with it",
            409
        );
    }

    await category.update({
        status: "INACTIVE"
    });

    return true;
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
