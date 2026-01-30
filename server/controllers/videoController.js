const { Video, User, Comment, Like } = require('../models'); // Importar todos los modelos
const { getVideoDurationInSeconds } = require('get-video-duration');
const ffprobe = require('ffprobe-static');
const fs = require('fs');

// ... (Mantén aquí tu función uploadVideo tal cual como estaba) ...
// Para ahorrar espacio, solo pongo el código nuevo abajo, 
// pero asegúrate de NO borrar uploadVideo.

exports.uploadVideo = async (req, res) => {
    // ... (Tu código de uploadVideo que ya funciona) ...
    // COPIA AQUÍ TU LÓGICA DE UPLOAD QUE YA TIENES
    try {
        if (!req.file) return res.status(400).json({ message: 'No video' });
        const videoPath = req.file.path;
        const duration = await getVideoDurationInSeconds(videoPath, ffprobe.path);
        
        if (duration > 600) {
            fs.unlinkSync(videoPath);
            return res.status(400).json({ message: 'Video excede 10 min.' });
        }

        const newVideo = await Video.create({
            title: req.body.title,
            description: req.body.description,
            videoUrl: videoPath,
            duration: duration,
            userId: req.body.userId
        });
        res.status(201).json({ message: 'Subido', video: newVideo });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getAllVideos = async (req, res) => {
    try {
        const videos = await Video.findAll({
            // INCLUIR RELACIONES:
            include: [
                { model: User, attributes: ['email'] }, // Para ver quién lo subió
                { model: Like }                         // Para contar los likes reales
            ],
            order: [['createdAt', 'DESC']] // Opcional: Mostrar los más nuevos primero
        });
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener videos', error });
    }
};

// --- NUEVAS FUNCIONES ---

// 1. Obtener un solo video y sus detalles (Comentarios y Likes)
exports.getVideoById = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findByPk(id, {
            include: [
                { model: User, attributes: ['email'] }, // Dueño del video
                { model: Comment, include: [User] },    // Comentarios y sus autores
                { model: Like }                         // Likes
            ]
        });

        if (!video) return res.status(404).json({ message: 'Video no encontrado' });

        // Incrementar Vistas (Requerimiento 5.4)
        video.views += 1;
        await video.save();

        res.json(video);
    } catch (error) {
        res.status(500).json({ message: 'Error server', error });
    }
};

// 2. Dar Like (Requerimiento 5.5)
exports.likeVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        // Verificar si ya dio like
        const existingLike = await Like.findOne({ where: { videoId: id, userId } });
        
        if (existingLike) {
            return res.status(400).json({ message: 'Ya diste like a este video' });
        }

        await Like.create({ videoId: id, userId });
        res.json({ message: 'Like agregado' });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// 3. Comentar (Requerimiento 5.6)
exports.commentVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, text } = req.body;

        const newComment = await Comment.create({
            text,
            videoId: id,
            userId
        });
        
        // Devolvemos el comentario con el usuario para mostrarlo al instante
        const commentWithUser = await Comment.findByPk(newComment.id, { include: [User] });
        res.json(commentWithUser);
    } catch (error) {
        res.status(500).json({ error });
    }
};