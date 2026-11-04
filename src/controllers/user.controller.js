
const { User, Role } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
        const offset = (page - 1) * limit;
        const search = req.query.search || "";

        const { count, rows } = await User.findAndCountAll({
            where: search
                ? {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                }
                : {},
            attributes: { exclude: ["password"] },
            include: [{ model: Role }],
            limit,
            offset,
            order: [["id", "DESC"]],
            distinct: true
        });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            totalUsers: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            users: rows
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

const getSingleUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ["password"] },
            include: [{ model: Role }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const updateData = {};

        if (name !== undefined) updateData.name = name.trim();
        if (email !== undefined) updateData.email = email.trim().toLowerCase();

        if (roleId !== undefined) {
            const role = await Role.findByPk(roleId);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found"
                });
            }

            updateData.roleId = roleId;
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 12);
        }

        await user.update(updateData);

        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ["password"] },
            include: [{ model: Role }]
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update user"
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.destroy();

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};

const activateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.update({ isActive: true });

        return res.status(200).json({
            success: true,
            message: "User activated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to activate user"
        });
    }
};

const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.update({ isActive: false });

        return res.status(200).json({
            success: true,
            message: "User deactivated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to deactivate user"
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ["password"] },
            include: [{ model: Role }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile"
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const updateData = {};

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Valid name is required"
                });
            }
            updateData.name = name.trim();
        }

        if (email !== undefined) {
            if (typeof email !== "string" || !email.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Valid email is required"
                });
            }
            updateData.email = email.trim().toLowerCase();
        }

        if (phone !== undefined) {
            if (typeof phone !== "string" || !phone.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Valid phone number is required"
                });
            }
            updateData.phone = phone.trim();
        }

        await user.update(updateData);

        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ["password"] },
            include: [{ model: Role }]
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid profile information"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters"
            });
        }

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to change password"
        });
    }
};

module.exports = {
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    getProfile,
    updateProfile,
    changePassword
};
