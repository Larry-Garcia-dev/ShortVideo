const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CoinTransaction = sequelize.define('CoinTransaction', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('purchase', 'gift_sent', 'gift_received'),
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // For purchases
    packageId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priceUSD: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    // For gifts
    streamId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    giftId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    recipientId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Payment status for purchases
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'completed'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = CoinTransaction;
