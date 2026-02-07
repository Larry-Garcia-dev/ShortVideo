const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize'); // Operadores de Sequelize

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
            language: language || 'en' // Default inglés
        });

        res.status(201).json({ 
            message: 'Usuario creado exitosamente', 
            user: { id: newUser.id, email: newUser.email, language: newUser.language }
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
            // Verificar si el tiempo de bloqueo ya pasó (ej. 30 minutos)
            // Si quieres desbloqueo automático, descomenta esto:
            /*
            if (user.lockUntil && user.lockUntil < new Date()) {
                await user.update({ status: 'Active', failedLoginAttempts: 0, lockUntil: null });
            } else {
                return res.status(403).json({ message: 'Cuenta bloqueada. Intente más tarde o recupere su contraseña.' });
            }
            */
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

        res.status(200).json({ 
            message: 'Login exitoso', 
            user: { 
                id: user.id, 
                email: user.email, 
                status: user.status,
                language: user.language 
            } 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error en el login', error: error.message });
    }
};

// Req 2.3: Olvidé mi contraseña (Generar Token)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'No existe usuario con ese email' });
        }

        // Generar token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hashear token para guardar en DB (Seguridad)
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos

        await user.update({
            resetPasswordToken,
            resetPasswordExpire
        });

        // Crear URL de reset (Simulación de envío de correo)
        // En producción: usar nodemailer
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

// Req 2.3: Resetear Password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hashear el token recibido para comparar con DB
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken,
                resetPasswordExpire: { [Op.gt]: Date.now() } // Que no haya expirado
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        // Validar nueva contraseña
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'La contraseña debe tener 8-12 caracteres, incluir 1 mayúscula, 1 número y 1 símbolo.'
            });
        }

        // Encriptar nueva pass
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await user.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpire: null,
            status: 'Active', // Desbloquear si estaba bloqueado
            failedLoginAttempts: 0
        });

        res.status(200).json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        res.status(500).json({ message: 'Error al resetear contraseña' });
    }
};