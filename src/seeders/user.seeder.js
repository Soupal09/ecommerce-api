
require("dotenv").config();

const sequelize = require("../config/database");
const { User, Role } = require("../models");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();

        const adminRole = await Role.findOne({
            where: { name: "Admin" }
        });

        if (!adminRole) {
            throw new Error("Admin role not found. Run role seeder first.");
        }

        const existingAdmin = await User.findOne({
            where: { email: "admin@example.com" }
        });

        if (existingAdmin) {
            console.log("Admin User Already Exists");
            return;
        }

        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        await User.create({
            name: "Admin",
            email: "admin@example.com",
            password: hashedPassword,
            roleId: adminRole.id,
            isActive: true
        });

        console.log("Admin User Seeded Successfully");

    } catch (error) {
        console.error("Admin Seeder Error:", error.message);
        process.exitCode = 1;

    } finally {
        await sequelize.close();
    }
};

seedAdmin();
