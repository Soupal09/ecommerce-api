const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { User, Role, RefreshToken } = require("../models");
const sequelize = require("../config/database");
const env = require("../config/env");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const parseDuration = (duration) => {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);

  if (!match) {
    throw new Error("Invalid token expiration format");
  }

  const value = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      roleId: user.roleId,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  );
};

const generateRefreshToken = async (user, transaction) => {
  const refreshToken = crypto.randomBytes(64).toString("hex");

  const expiresAt = new Date(
    Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN),
  );

  await RefreshToken.create(
    {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
    { transaction },
  );

  return refreshToken;
};

const createAuthResponse = async (user, transaction) => {
  const accessToken = generateAccessToken(user);

  const refreshToken = await generateRefreshToken(user, transaction);

  return {
    accessToken,
    refreshToken,
  };
};

const register = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const customerRole = await Role.findOne({
      where: { name: "Customer" },
      transaction,
    });

    if (!customerRole) {
      await transaction.rollback();

      return res.status(500).json({
        success: false,
        message: "Customer role not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create(
      {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        roleId: customerRole.id,
        isActive: true,
      },
      { transaction },
    );

    const tokens = await createAuthResponse(user, transaction);

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.error("Registration Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const tokens = await createAuthResponse(user, transaction);

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Login successful",
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roleId: user.roleId,
        },
      });
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      throw error;
    }
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const refreshToken = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const tokenHash = hashToken(token);

    const storedToken = await RefreshToken.findOne({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!storedToken) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findByPk(storedToken.userId, {
      transaction,
    });

    if (!user || !user.isActive) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
    }

    storedToken.revokedAt = new Date();

    await storedToken.save({ transaction });

    const tokens = await createAuthResponse(user, transaction);

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      ...tokens,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Refresh Token Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Token refresh failed",
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const tokenHash = hashToken(token);

    await RefreshToken.update(
    { revokedAt: new Date() },
    {
        where: {
            tokenHash,
            userId: req.user.id,
            revokedAt: null
        }
    }
);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
