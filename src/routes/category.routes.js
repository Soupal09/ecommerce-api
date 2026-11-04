
const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/category.controller");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/", authenticate, authorize(1), createCategory);
router.put("/:id", authenticate, authorize(1), updateCategory);
router.delete("/:id", authenticate, authorize(1), deleteCategory);

module.exports = router;
