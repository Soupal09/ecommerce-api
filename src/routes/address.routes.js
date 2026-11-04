
const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");

const {
    createAddress,
    getAddresses,
    updateAddress,
    deleteAddress
} = require("../controllers/address.controller");

router.use(authenticate);

router.post("/", createAddress);
router.get("/", getAddresses);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
