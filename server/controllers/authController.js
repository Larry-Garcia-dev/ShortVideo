const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Importante agregar jwt
const { Op } = require('sequelize');

// Req 3.2: Regex de contraseña (8-12 chars, 1 Mayúscula, 1 Número, 1 Especial)
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,12}$/;

exports.register = async (req, res) => {
    try {
        const { email, password, language } = req.body;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'La contraseña debe tener 8-12 caracteres, incluir 1 mayúscula, 1 número y 1 símbolo.'
            });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            language: language || 'en',
            role: 'user' // Forzamos rol usuario por defecto
        });

        res.status(201).json({ 
            message: 'Usuario creado exitosamente', 
            user: { id: newUser.id, email: newUser.email, language: newUser.language, role: newUser.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Credenciales inválidas' });
        }

        // Req 2.2: Verificar bloqueo
        if (user.status === 'Locked') {
           return res.status(403).json({ message: 'Cuenta bloqueada por demasiados intentos fallidos.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const newAttempts = user.failedLoginAttempts + 1;
            let updateData = { failedLoginAttempts: newAttempts };

            if (newAttempts >= 3) {
                updateData.status = 'Locked';
                updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Bloqueo por 30 mins
            }

            await user.update(updateData);

            if (updateData.status === 'Locked') {
                return res.status(403).json({ message: 'Cuenta bloqueada. Ha excedido el número de intentos.' });
            }

            return res.status(401).json({ 
                message: `Contraseña incorrecta. Intento ${newAttempts} de 3.` 
            });
        }

        // Login Exitoso: Resetear contadores
        await user.update({ failedLoginAttempts: 0, lockUntil: null, status: 'Active' });

        // Generar Token con ID y ROLE
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Login exitoso', 
            token,
            user: { 
                id: user.id, 
                email: user.email, 
                status: user.status,
                language: user.language,
                role: user.role,
                avatar: user.avatar,
                googleId: user.googleId
            } 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error en el login', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'No existe usuario con ese email' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.update({ resetPasswordToken, resetPasswordExpire });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        console.log(`\n📧 SIMULACIÓN DE CORREO A: ${email}`);
        console.log(`🔗 Link de recuperación: ${resetUrl}\n`);

        res.status(200).json({ 
            message: 'Correo de recuperación enviado (revisa la consola del servidor)',
            token_debug: resetToken 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al procesar solicitud' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken,
                resetPasswordExpire: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'La contraseña debe tener 8-12 caracteres, incluir 1 mayúscula, 1 número y 1 símbolo.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await user.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpire: null,
            status: 'Active',
            failedLoginAttempts: 0
        });

        res.status(200).json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        res.status(500).json({ message: 'Error al resetear contraseña' });
    }
};

const axios = require('axios');

// Get current user data (refresh from DB)
exports.getMe = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByPk(userId, {
            attributes: ['id', 'email', 'role', 'language', 'avatar', 'googleId', 'status']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { accessToken } = req.body; // Recibimos el token del front

        // 1. Validar el token con Google
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const { email, sub: googleId, picture, locale } = googleResponse.data;

        // 2. Buscar si el usuario ya existe
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // 3. Si no existe, lo creamos
            user = await User.create({
                email,
                googleId,
                avatar: picture,
                language: locale === 'zh' ? 'zh' : (locale === 'es' ? 'es' : 'en'), // Adaptamos el idioma
                role: 'user',
                status: 'Active',
                password: null // Sin contraseña
            });
        } else {
            // Si existe pero no tenía googleId, lo actualizamos
            if (!user.googleId) {
                await user.update({ googleId, avatar: picture });
            }
            
            // Verificar bloqueo (tu lógica existente)
            if (user.status === 'Locked') {
                return res.status(403).json({ message: 'Cuenta bloqueada.' });
            }
        }

        // 4. Generar tu propio JWT (Igual que en tu login normal)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Google login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                language: user.language,
                avatar: user.avatar,
                googleId: user.googleId
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error.response?.data || error.message);
        res.status(401).json({ message: 'Token de Google inválido o expirado' });
    }
};
