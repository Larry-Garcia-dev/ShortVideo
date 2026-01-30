const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Video = sequelize.define('Video', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    videoUrl: { // Ruta donde se guarda el archivo
        type: DataTypes.STRING,
        allowNull: false
    },
    thumbnailUrl: { // Imagen de portada
        type: DataTypes.STRING,
        allowNull: true
    },
    duration: { // Duración en segundos o minutos (para validar < 10 min)
        type: DataTypes.FLOAT, 
        allowNull: false
    },
    views: { // Contador de visitas en vivo
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true // Crea automatically Upload Date (createdAt)
});

module.exports = Video;