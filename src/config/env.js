
require("dotenv").config();

const Joi = require("joi");

const envSchema = Joi.object({
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string()
        .valid("development", "production", "test")
        .default("development"),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow("").required(),

    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),

    CLOUDINARY_CLOUD_NAME: Joi.string().allow("").default(""),
    CLOUDINARY_API_KEY: Joi.string().allow("").default(""),
    CLOUDINARY_API_SECRET: Joi.string().allow("").default("")
}).unknown();

const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    convert: true
});

if (error) {
    throw new Error(`Environment Configuration Error: ${error.message}`);
}

module.exports = value;
