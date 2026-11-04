
const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/user.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

router.use(authenticate);
router.use(authorize(1));

router.get("/", getAllUsers);
router.get("/:id", getSingleUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/activate", activateUser);
router.patch("/:id/deactivate", deactivateUser);

module.exports = router;
