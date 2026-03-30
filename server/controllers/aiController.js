const axios = require('axios');

// Recuerda agregar DASHSCOPE_API_KEY a tu archivo .env
const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-fc565dd26b854621bf394d123456';
const BASE_URL = 'https://dashscope-intl.aliyuncs.com/api/v1';

// Helper para construir URL pública de archivos
const getPublicUrl = (req, filePath) => {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/${filePath}`;
};

// Controlador para subir imagen
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ninguna imagen'
            });
        }

        const imageUrl = getPublicUrl(req, req.file.path);

        res.status(200).json({
            success: true,
            message: 'Imagen subida exitosamente',
            url: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error en uploadImage:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al subir la imagen',
            error: error.message
        });
    }
};

// Controlador para subir audio
exports.uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ningún audio'
            });
        }

        const audioUrl = getPublicUrl(req, req.file.path);

        res.status(200).json({
            success: true,
            message: 'Audio subido exitosamente',
            url: audioUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error en uploadAudio:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al subir el audio',
            error: error.message
        });
    }
};

// Controlador para subir audio recortado (blob)
exports.uploadTrimmedAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ningún audio recortado'
            });
        }

        const audioUrl = getPublicUrl(req, req.file.path);

        res.status(200).json({
            success: true,
            message: 'Audio recortado subido exitosamente',
            url: audioUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error en uploadTrimmedAudio:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al subir el audio recortado',
            error: error.message
        });
    }
};

// Controlador para iniciar la tarea de generación de video
exports.generateVideo = async (req, res) => {
    try {
        const { prompt, img_url, audio_url, quality, duration } = req.body;

        if (!prompt || !img_url) {
            return res.status(400).json({ 
                success: false, 
                message: 'Los campos prompt y img_url son obligatorios.' 
            });
        }

        // Validar y normalizar quality (720P o 1080P)
        const validQualities = ['720P', '1080P'];
        const normalizedQuality = validQualities.includes(quality) 
            ? quality 
            : '720P';

        // Validar y normalizar duration (5, 10 o 15 segundos)
        const validDurations = [5, 10, 15];
        const normalizedDuration = validDurations.includes(Number(duration)) 
            ? Number(duration) 
            : 5;

        const payload = {
            model: "wan2.6-i2v",
            input: { 
                prompt, 
                img_url, 
                audio_url 
            },
            parameters: {
                resolution: normalizedQuality,
                prompt_extend: true,
                duration: normalizedDuration,
                audio: true,
                shot_type: "multi"
            }
        };
         console.log("=== DEBUG PARAMS PARA DASHSCOPE ===");
        console.log("IMG URL:", img_url);
        console.log("AUDIO URL:", audio_url);
        console.log("QUALITY:", normalizedQuality);
        console.log("DURATION:", normalizedDuration, "seconds");
        console.log("===================================");

        const response = await axios.post(`${BASE_URL}/services/aigc/video-generation/video-synthesis`, payload, {
            headers: {
                'X-DashScope-Async': 'enable',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.status(202).json({ 
            success: true, 
            message: 'Tarea de generación iniciada', 
            task: response.data 
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Controlador para consultar el estado de la tarea
exports.getTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return res.status(400).json({ 
                success: false, 
                message: 'El ID de la tarea (taskId) es obligatorio.' 
            });
        }

        const response = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Error en getTaskStatus:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error al consultar el estado de la tarea', 
            error: error.response?.data || error.message 
        });
    }
};
