const User = require('../models/User');

// Req 7.2: Permitir al usuario seleccionar idioma
exports.updateLanguage = async (req, res) => {
    try {
        const { userId, language } = req.body;

        // Validar idiomas soportados
        const validLangs = ['en', 'es', 'zh'];
        if (!validLangs.includes(language)) {
            return res.status(400).json({ message: 'Idioma no soportado. Use: en, es, zh' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await user.update({ language });

        res.json({ message: 'Idioma actualizado', language: user.language });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};