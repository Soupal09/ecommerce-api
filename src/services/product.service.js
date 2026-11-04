
const { Op } = require("sequelize");
const {
    Product,
    Category,
    ProductImage,
    ProductVariant,
    OrderItem
} = require("../models");

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

const validateProductData = (data) => {
    const {
        name,
        categoryId,
        basePrice,
        discountPrice,
        sku,
        stock
    } = data;

    if (!name || typeof name !== "string" || !name.trim()) {
        throw createError("Product name is required", 400);
    }

    if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
        throw createError("Valid categoryId is required", 400);
    }

    if (!sku || typeof sku !== "string" || !sku.trim()) {
        throw createError("Product SKU is required", 400);
    }

    if (
        basePrice === undefined ||
        basePrice === null ||
        !Number.isFinite(Number(basePrice)) ||
        Number(basePrice) <= 0
    ) {
        throw createError("Valid basePrice is required", 400);
    }

    if (
        discountPrice !== undefined &&
        discountPrice !== null &&
        (
            !Number.isFinite(Number(discountPrice)) ||
            Number(discountPrice) < 0 ||
            Number(discountPrice) >= Number(basePrice)
        )
    ) {
        throw createError("Discount price must be less than base price", 400);
    }

    if (
        stock !== undefined &&
        (!Number.isInteger(Number(stock)) || Number(stock) < 0)
    ) {
        throw createError("Stock must be a non-negative integer", 400);
    }
};

const checkCategory = async (categoryId) => {
    const category = await Category.findOne({
        where: {
            id: categoryId,
            status: "ACTIVE"
        }
    });

    if (!category) {
        throw createError("Active category not found", 404);
    }

    return category;
};

const checkUniqueProduct = async (where, excludeId = null) => {
    const conditions = [];

    if (where.sku) {
        conditions.push({ sku: where.sku });
    }

    if (where.slug) {
        conditions.push({ slug: where.slug });
    }

    if (!conditions.length) {
        return;
    }

    const product = await Product.findOne({
        where: {
            [Op.or]: conditions,
            ...(excludeId && {
                id: { [Op.ne]: excludeId }
            })
        }
    });

    if (product) {
        if (product.sku === where.sku) {
            throw createError("Product SKU already exists", 409);
        }

        throw createError("Product slug already exists", 409);
    }
};

const createProduct = async (data) => {
    validateProductData(data);

    const categoryId = Number(data.categoryId);

    await checkCategory(categoryId);

    const slug = data.slug
        ? generateSlug(data.slug)
        : generateSlug(data.name);

    if (!slug) {
        throw createError("Valid product slug is required", 400);
    }

    const productData = {
        categoryId,
        name: data.name.trim(),
        slug,
        description: data.description || null,
        brand: data.brand || null,
        basePrice: Number(data.basePrice),
        discountPrice: data.discountPrice ?? null,
        sku: data.sku.trim(),
        stock: data.stock === undefined ? 0 : Number(data.stock),
        status: data.status || "ACTIVE"
    };

    if (!["ACTIVE", "INACTIVE"].includes(productData.status)) {
        throw createError("Invalid product status", 400);
    }

    await checkUniqueProduct({
        sku: productData.sku,
        slug: productData.slug
    });

    return await Product.create(productData);
};

const getAllProducts = async (query) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(query.limit, 10) || 20)
    );

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
        include: [
            {
                model: Category,
                attributes: ["id", "name", "slug"]
            },
            {
                model: ProductImage
            },
            {
                model: ProductVariant
            }
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        distinct: true
    });

    return {
        products: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const getProductById = async (id) => {
    const product = await Product.findByPk(id, {
        include: [
            {
                model: Category
            },
            {
                model: ProductImage
            },
            {
                model: ProductVariant
            }
        ]
    });

    if (!product) {
        throw createError("Product not found", 404);
    }

    return product;
};

const updateProduct = async (id, data) => {
    const product = await Product.findByPk(id);

    if (!product) {
        throw createError("Product not found", 404);
    }

    const allowedFields = [
        "name",
        "slug",
        "categoryId",
        "description",
        "brand",
        "basePrice",
        "discountPrice",
        "sku",
        "stock",
        "status"
    ];

    const updateData = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    const mergedData = {
        ...product.toJSON(),
        ...updateData
    };

    validateProductData(mergedData);

    if (updateData.categoryId !== undefined) {
        await checkCategory(Number(updateData.categoryId));
        updateData.categoryId = Number(updateData.categoryId);
    }

    if (updateData.name !== undefined) {
        updateData.name = updateData.name.trim();
    }

    if (updateData.sku !== undefined) {
        updateData.sku = updateData.sku.trim();
    }

    if (updateData.slug !== undefined) {
        updateData.slug = generateSlug(updateData.slug);
    } else if (updateData.name !== undefined) {
        updateData.slug = generateSlug(updateData.name);
    }

    if (updateData.basePrice !== undefined) {
        updateData.basePrice = Number(updateData.basePrice);
    }

    if (updateData.discountPrice !== undefined) {
        updateData.discountPrice =
            updateData.discountPrice === null
                ? null
                : Number(updateData.discountPrice);
    }

    if (updateData.stock !== undefined) {
        updateData.stock = Number(updateData.stock);
    }

    if (
        updateData.status !== undefined &&
        !["ACTIVE", "INACTIVE"].includes(updateData.status)
    ) {
        throw createError("Invalid product status", 400);
    }

    await checkUniqueProduct({
        sku: updateData.sku || product.sku,
        slug: updateData.slug || product.slug
    }, product.id);

    await product.update(updateData);

    return product;
};

const deleteProduct = async (id) => {
    const product = await Product.findByPk(id);

    if (!product) {
        throw createError("Product not found", 404);
    }

    const existingOrder = await OrderItem.findOne({
        where: {
            productId: id
        }
    });

    if (existingOrder) {
        throw createError(
            "Product cannot be deleted because it has order history",
            409
        );
    }

    await product.update({
        status: "INACTIVE"
    });

    return true;
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
