const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    status: {
        type: DataTypes.ENUM('Active', 'Disabled', 'Locked'),
        defaultValue: 'Active'
    },
    // Req 2.2: Bloqueo de cuenta
    failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Req 2.3: Recuperación de contraseña
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Req 7: Preferencia de idioma
    language: {
        type: DataTypes.ENUM('en', 'es', 'zh'), // Inglés, Español, Chino
        defaultValue: 'en'
    }
}, {
    timestamps: true
});

module.exports = User;