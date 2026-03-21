const { Op } = require('sequelize');
const User = require('../models/User');

// Buscar usuarios (Solo Admin)
exports.searchUsers = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Proporciona un email para buscar.' });

        const users = await User.findAll({
            where: { email: { [Op.like]: `%${email}%` } },
            attributes: ['id', 'email', 'role', 'status', 'createdAt'] // Protegemos las contraseñas
        });
        
        res.status(200).json(users);
    } catch (error) {
        console.error("Error en adminController - searchUsers:", error);
        res.status(500).json({ message: 'Error al buscar usuarios.' });
    }
};

// Cambiar el rol de un usuario (Solo Admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Rol inválido.' });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        await user.update({ role });
        res.status(200).json({ message: `Rol de ${user.email} actualizado a ${role}.` });
    } catch (error) {
        console.error("Error en adminController - updateUserRole:", error);
        res.status(500).json({ message: 'Error al actualizar el rol.' });
    }
};