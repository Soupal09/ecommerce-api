
const { Product, ProductImage } = require("../models");
const cloudinaryService = require("../services/cloudinary.service");

const uploadProductImages = async (req, res) => {
    const uploadedImages = [];

    try {
        const product = await Product.findByPk(req.params.productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one image"
            });
        }

        const existingCount = await ProductImage.count({
            where: { productId: product.id }
        });

        if (existingCount + req.files.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 images allowed per product"
            });
        }

        for (const file of req.files) {
            const result = await cloudinaryService.uploadImage(file);

            uploadedImages.push(result);

            const image = await ProductImage.create({
                productId: product.id,
                imageUrl: result.imageUrl,
                publicId: result.publicId,
                isPrimary: existingCount === 0 && uploadedImages.length === 1,
                sortOrder: existingCount + uploadedImages.length
            });

            uploadedImages[uploadedImages.length - 1].id = image.id;
        }

        return res.status(201).json({
            success: true,
            message: "Product images uploaded successfully",
            data: uploadedImages
        });
    } catch (error) {
        for (const image of uploadedImages) {
            await ProductImage.destroy({
                where: { id: image.id }
            }).catch(() => {});

            await cloudinaryService.deleteImage(image.publicId).catch(() => {});
        }

        return res.status(500).json({
            success: false,
            message: "Failed to upload product images"
        });
    }
};

const getProductImages = async (req, res) => {
    try {
        const images = await ProductImage.findAll({
            where: {
                productId: req.params.productId
            },
            order: [["sortOrder", "ASC"]]
        });

        return res.status(200).json({
            success: true,
            message: "Product images fetched successfully",
            data: images
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product images"
        });
    }
};

const setPrimaryImage = async (req, res) => {
    try {
        const image = await ProductImage.findOne({
            where: {
                id: req.params.imageId,
                productId: req.params.productId
            }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Product image not found"
            });
        }

        await ProductImage.update(
            { isPrimary: false },
            { where: { productId: req.params.productId } }
        );

        await image.update({ isPrimary: true });

        return res.status(200).json({
            success: true,
            message: "Primary image updated successfully",
            data: image
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update primary image"
        });
    }
};

const deleteProductImage = async (req, res) => {
    try {
        const image = await ProductImage.findOne({
            where: {
                id: req.params.imageId,
                productId: req.params.productId
            }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Product image not found"
            });
        }

        await cloudinaryService.deleteImage(image.publicId);
        await image.destroy();

        return res.status(200).json({
            success: true,
            message: "Product image deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete product image"
        });
    }
};

module.exports = {
    uploadProductImages,
    getProductImages,
    setPrimaryImage,
    deleteProductImage
};
