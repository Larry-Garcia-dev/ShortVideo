const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserCoins = sequelize.define('UserCoins', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    balance: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalPurchased: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalSpent: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalReceived: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = UserCoins;
