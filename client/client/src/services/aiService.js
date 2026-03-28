import axios from 'axios';
import { API_URL as BASE_API_URL } from '../config';

// Usa la URL base de la configuración para conectar con el backend
const API_URL = `${BASE_API_URL}/ai`; 

/**
 * Envía los datos para iniciar la generación del video
 */
export const generateVideo = async (videoData) => {
    try {
        const response = await axios.post(`${API_URL}/generate`, videoData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Consulta el estado actual de la tarea de generación
 */
export const checkVideoStatus = async (taskId) => {
    try {
        const response = await axios.get(`${API_URL}/task/${taskId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
