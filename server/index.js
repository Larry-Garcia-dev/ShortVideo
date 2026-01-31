const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const path = require('path'); // Importante para la carpeta uploads
require('dotenv').config();

// --- 1. IMPORTAR MODELOS ---
const { User, Video, Comment, Like, Campaign } = require('./models');

// --- 2. IMPORTAR RUTAS (Aquí faltaba la de videos) ---
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes'); // <--- ¡ESTA ES LA QUE FALTABA!
const campaignRoutes = require('./routes/campaignRoutes'); // <--- IMPORTAR
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Hacer pública la carpeta uploads para ver los videos desde el navegador
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. USAR RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes); // Ahora sí funcionará porque videoRoutes ya existe
app.use('/api/campaigns', campaignRoutes); // <--- USAR RUTA
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Ruta base
app.get('/', (req, res) => {
    res.send('API de ShortVideo funcionando 🚀');
});

// Arrancar servidor
const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false })
    .then(() => {
        console.log('Tablas sincronizadas con MySQL');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar con la BD:', error);
    });