
require("dotenv").config();

const sequelize = require("../config/database");
const { Role } = require("../models");

const seedRoles = async () => {
    try {
        await sequelize.authenticate();

        await Role.findOrCreate({
            where: { name: "Admin" },
            defaults: { name: "Admin" }
        });

        await Role.findOrCreate({
            where: { name: "Customer" },
            defaults: { name: "Customer" }
        });

        console.log("Roles Seeded Successfully");

    } catch (error) {
        console.error("Role Seeder Error:", error.message);
    } finally {
        await sequelize.close();
    }
};

seedRoles();
