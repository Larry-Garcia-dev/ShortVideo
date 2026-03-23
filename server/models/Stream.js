const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Stream = sequelize.define('Stream', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('live', 'ended'),
        defaultValue: 'live'
    },
    viewerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    peakViewers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalGiftsReceived: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalCoinsReceived: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    startedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    endedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Stream;
