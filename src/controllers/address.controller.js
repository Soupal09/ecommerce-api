
const addressService = require("../services/address.service");

const createAddress = async (req, res) => {
    try {
        const address = await addressService.createAddress(
            req.user.id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: address
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to create address"
        });
    }
};

const getAddresses = async (req, res) => {
    try {
        const addresses = await addressService.getAddresses(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Addresses fetched successfully",
            data: addresses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch addresses"
        });
    }
};

const updateAddress = async (req, res) => {
    try {
        const address = await addressService.updateAddress(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to update address"
        });
    }
};

const deleteAddress = async (req, res) => {
    try {
        await addressService.deleteAddress(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to delete address"
        });
    }
};

module.exports = {
    createAddress,
    getAddresses,
    updateAddress,
    deleteAddress
};
