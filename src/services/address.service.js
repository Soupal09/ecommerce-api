
const { Address } = require("../models");
const sequelize = require("../config/database");

const createAddress = async (userId, data) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            name,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault
        } = data;

        if (
            !name ||
            !phone ||
            !addressLine1 ||
            !city ||
            !state ||
            !postalCode ||
            !country
        ) {
            throw Object.assign(
                new Error("All required address fields must be provided"),
                { statusCode: 400 }
            );
        }

        const addressCount = await Address.count({
            where: { userId },
            transaction
        });

        const shouldBeDefault = Boolean(isDefault) || addressCount === 0;

        if (shouldBeDefault) {
            await Address.update(
                { isDefault: false },
                { where: { userId }, transaction }
            );
        }

        const address = await Address.create({
            userId,
            name,
            phone,
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            state,
            postalCode,
            country,
            isDefault: shouldBeDefault
        }, { transaction });

        await transaction.commit();

        return address;
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        throw error;
    }
};

const getAddresses = async (userId) => {
    return await Address.findAll({
        where: { userId },
        order: [
            ["isDefault", "DESC"],
            ["createdAt", "DESC"]
        ]
    });
};

const updateAddress = async (userId, addressId, data) => {
    const transaction = await sequelize.transaction();

    try {
        const address = await Address.findOne({
            where: {
                id: addressId,
                userId
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!address) {
            throw Object.assign(
                new Error("Address not found"),
                { statusCode: 404 }
            );
        }

        const allowedFields = [
            "name",
            "phone",
            "addressLine1",
            "addressLine2",
            "city",
            "state",
            "postalCode",
            "country"
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        if (data.isDefault === true) {
            await Address.update(
                { isDefault: false },
                {
                    where: { userId },
                    transaction
                }
            );

            updateData.isDefault = true;
        }

        if (data.isDefault === false && address.isDefault) {
            throw Object.assign(
                new Error("Set another default address before removing this default"),
                { statusCode: 400 }
            );
        }

        await address.update(updateData, { transaction });

        await transaction.commit();

        return address;
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        throw error;
    }
};

const deleteAddress = async (userId, addressId) => {
    const transaction = await sequelize.transaction();

    try {
        const address = await Address.findOne({
            where: {
                id: addressId,
                userId
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!address) {
            throw Object.assign(
                new Error("Address not found"),
                { statusCode: 404 }
            );
        }

        await address.destroy({ transaction });

        await transaction.commit();

        return true;
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createAddress,
    getAddresses,
    updateAddress,
    deleteAddress
};
