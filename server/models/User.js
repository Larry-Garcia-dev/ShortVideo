const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    // Requerimiento: User Name es el email 
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    // Requerimiento: Password encriptada 
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Requerimiento: User Status (Active/Disabled) 
    status: {
        type: DataTypes.ENUM('Active', 'Disabled', 'Locked'),
        defaultValue: 'Active'
    },
    // Campos necesarios para cumplir la Función 2.2 (Bloqueo tras 3 intentos) 
    failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lockUntil: {
        type: DataTypes.DATE, // Fecha hasta la cual está bloqueado
        allowNull: true
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

module.exports = User;