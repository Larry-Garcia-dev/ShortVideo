const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Gift = sequelize.define('Gift', {
    giftId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    coinCost: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'standard'
    },
    animation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Gift;
