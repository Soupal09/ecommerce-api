
const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

const {
    uploadProductImages,
    getProductImages,
    setPrimaryImage,
    deleteProductImage
} = require("../controllers/productImage.controller");

router.get("/:productId", getProductImages);

router.post(
    "/:productId",
    authenticate,
    authorize(1),
    upload.array("images", 5),
    uploadProductImages
);

router.patch(
    "/:productId/:imageId/primary",
    authenticate,
    authorize(1),
    setPrimaryImage
);

router.delete(
    "/:productId/:imageId",
    authenticate,
    authorize(1),
    deleteProductImage
);

module.exports = router;
