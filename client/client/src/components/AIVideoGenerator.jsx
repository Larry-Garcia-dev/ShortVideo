import React, { useState, useEffect } from 'react';
import { generateVideo, checkVideoStatus } from '../services/aiService';

const AIVideoGenerator = () => {
    const [formData, setFormData] = useState({
        prompt: '',
        img_url: '',
        audio_url: ''
    });
    const [status, setStatus] = useState('IDLE'); // IDLE, LOADING, PROCESSING, SUCCESS, ERROR
    const [taskId, setTaskId] = useState(null);
    const [videoResult, setVideoResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('LOADING');
        setErrorMessage('');
        setVideoResult(null);

        try {
            const data = await generateVideo(formData);
            // Dependiendo de cómo responda exactamente Aliyun en la primera petición,
            // normalmente devuelve el ID de la tarea aquí:
            const newTaskId = data.task.output.task_id; 
            setTaskId(newTaskId);
            setStatus('PROCESSING');
        } catch (error) {
            setStatus('ERROR');
            setErrorMessage(error.message || 'Error al iniciar la generación');
        }
    };

    // Lógica de Polling: Se ejecuta cuando estamos en estado 'PROCESSING' y tenemos un taskId
    useEffect(() => {
        let intervalId;

        if (status === 'PROCESSING' && taskId) {
            intervalId = setInterval(async () => {
                try {
                    const response = await checkVideoStatus(taskId);
                    const taskStatus = response.data.output.task_status; // PENDING, RUNNING, SUCCEEDED, FAILED

                    if (taskStatus === 'SUCCEEDED') {
                        setStatus('SUCCESS');
                        setVideoResult(response.data.output.video_url); // Ajusta la ruta según la respuesta exacta
                        clearInterval(intervalId);
                    } else if (taskStatus === 'FAILED') {
                        setStatus('ERROR');
                        setErrorMessage('La IA falló al generar el video.');
                        clearInterval(intervalId);
                    }
                    // Si es PENDING o RUNNING, el intervalo sigue ejecutándose
                } catch (error) {
                    setStatus('ERROR');
                    setErrorMessage('Perdimos conexión con el servidor al verificar el estado.');
                    clearInterval(intervalId);
                }
            }, 5000); // Consulta cada 5 segundos
        }

        // Limpiar el intervalo si el componente se desmonta
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [status, taskId]);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Generar Video con IA</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prompt (Descripción)</label>
                    <textarea 
                        name="prompt"
                        value={formData.prompt}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Ej: Un pingüino cantando..."
                        rows="3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">URL de la Imagen base</label>
                    <input 
                        type="url"
                        name="img_url"
                        value={formData.img_url}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://ejemplo.com/imagen.jpg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">URL del Audio (Opcional)</label>
                    <input 
                        type="url"
                        name="audio_url"
                        value={formData.audio_url}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://ejemplo.com/audio.mp3"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={status === 'LOADING' || status === 'PROCESSING'}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {status === 'LOADING' ? 'Iniciando...' : status === 'PROCESSING' ? 'Generando Video (Esto puede tardar)...' : 'Generar Video'}
                </button>
            </form>

            {/* Mensajes de Estado */}
            {status === 'ERROR' && (
                <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-md">
                    {errorMessage}
                </div>
            )}

            {status === 'SUCCESS' && videoResult && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-green-600 mb-2">¡Video Generado con Éxito!</h3>
                    <video controls className="w-full rounded-lg shadow-lg">
                        <source src={videoResult} type="video/mp4" />
                        Tu navegador no soporta el elemento de video.
                    </video>
                </div>
            )}
        </div>
    );
};

export default AIVideoGenerator;