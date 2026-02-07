const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const path = require('path');
require('dotenv').config();

// Modelos
const { User, Video, Comment, Like, Campaign, Follow } = require('./models');

// Rutas
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const userRoutes = require('./routes/userRoutes'); // Nueva ruta

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para parsear form-data si es necesario

// Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/users', userRoutes); // Endpoint de usuarios

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('API ShortVideo v1.0.0 Online');
});

// Server Start
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }) // 'alter: true' actualiza las tablas sin borrar datos
    .then(() => {
        console.log('✅ Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        });
    })
    .catch(error => {
        console.error('❌ Error conexión BD:', error);
    });
