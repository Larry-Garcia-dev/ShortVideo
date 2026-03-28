const axios = require('axios');

// Recuerda agregar DASHSCOPE_API_KEY a tu archivo .env
const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-fc565dd26b854621bf394d123456';
const BASE_URL = 'https://dashscope-intl.aliyuncs.com/api/v1';

// Controlador para iniciar la tarea de generación de video
exports.generateVideo = async (req, res) => {
    try {
        const { prompt, img_url, audio_url } = req.body;

        // Validaciones básicas
        if (!prompt || !img_url) {
            return res.status(400).json({ 
                success: false, 
                message: 'Los campos prompt y img_url son obligatorios.' 
            });
        }

        const payload = {
            model: "wan2.1-i2v-turbo",
            input: { prompt, img_url, audio_url },
            parameters: {
                resolution: "720P",
                prompt_extend: true,
                duration: 5,
                shot_type: "multi"
            }
        };

        const response = await axios.post(`${BASE_URL}/services/aigc/video-generation/video-synthesis`, payload, {
            headers: {
                'X-DashScope-Async': 'enable',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.status(202).json({ 
            success: true, 
            message: 'Tarea de generación de video iniciada con éxito', 
            task: response.data 
        });

    } catch (error) {
        console.error('Error en generateVideo:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error al comunicarse con la API de IA', 
            error: error.response?.data || error.message 
        });
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