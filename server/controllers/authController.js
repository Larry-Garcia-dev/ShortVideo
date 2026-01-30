const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Regla de contraseña: 8-12 chars, 1 Mayúscula, 1 Número, 1 Especial
// 
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,12}$/;

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validar complejidad de la contraseña
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'La contraseña debe tener 8-12 caracteres, incluir 1 mayúscula, 1 número y 1 símbolo.'
            });
        }

        // 2. Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        // 3. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Crear usuario (Status activo por defecto) [cite: 10]
        const newUser = await User.create({
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'Usuario creado exitosamente', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // 1. Verificar si está bloqueado (Función 2.2) 
        if (user.status === 'Locked') {
            // Opcional: Podríamos verificar si pasó el tiempo de bloqueo (lockUntil) aquí
            // Por ahora, asumimos bloqueo estricto hasta que recupere contraseña
            return res.status(403).json({ message: 'Cuenta bloqueada por demasiados intentos fallidos. Use "Olvidé mi contraseña".' });
        }

        // 2. Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Manejo de intentos fallidos
            const newAttempts = user.failedLoginAttempts + 1;
            let updateData = { failedLoginAttempts: newAttempts };

            // Si llega a 3 intentos, bloquear cuenta 
            if (newAttempts >= 3) {
                updateData.status = 'Locked';
                updateData.lockUntil = new Date(); // Marca la hora del bloqueo
            }

            await user.update(updateData);

            if (updateData.status === 'Locked') {
                return res.status(403).json({ message: 'Cuenta bloqueada. Ha excedido el número de intentos.' });
            }

            return res.status(401).json({ 
                message: `Contraseña incorrecta. Intento ${newAttempts} de 3.` 
            });
        }

        // 3. Login Exitoso: Resetear contadores
        if (user.status !== 'Active') {
             // Si estaba deshabilitado (no bloqueado por intentos), verificar lógica extra aquí
        }
        
        await user.update({ failedLoginAttempts: 0, lockUntil: null, status: 'Active' });

        // Aquí normalmente devolveríamos un Token (JWT). Por ahora devolvemos éxito.
        res.status(200).json({ 
            message: 'Login exitoso', 
            user: { id: user.id, email: user.email, status: user.status } 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error en el login', error });
    }
};