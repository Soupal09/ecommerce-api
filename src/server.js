
require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
    try {
        await sequelize.authenticate();

        console.log("MySQL Database Connected Successfully");

        if (NODE_ENV === "development") {
            await sequelize.sync();
            console.log("Database Tables Synchronized Successfully");
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${NODE_ENV}`);
        });

    } catch (error) {
        console.error("Server Startup Failed:", error.message);
        process.exit(1);
    }
};

startServer();
