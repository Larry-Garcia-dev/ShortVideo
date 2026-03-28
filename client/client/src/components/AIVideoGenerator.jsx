import React, { useState, useEffect } from 'react';
import { generateVideo, checkVideoStatus } from '../services/aiService';
import './AIVideoGenerator.css';

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
    const [progress, setProgress] = useState(0);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('LOADING');
        setErrorMessage('');
        setVideoResult(null);
        setProgress(0);

        try {
            const data = await generateVideo(formData);
            const newTaskId = data.task.output.task_id; 
            setTaskId(newTaskId);
            setStatus('PROCESSING');
        } catch (error) {
            setStatus('ERROR');
            setErrorMessage(error.message || 'Error al iniciar la generación');
        }
    };

    // Lógica de Polling
    useEffect(() => {
        let intervalId;
        let progressInterval;

        if (status === 'PROCESSING' && taskId) {
            // Simular progreso visual
            progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 2, 90));
            }, 1000);

            intervalId = setInterval(async () => {
                try {
                    const response = await checkVideoStatus(taskId);
                    const taskStatus = response.data.output.task_status;

                    if (taskStatus === 'SUCCEEDED') {
                        setStatus('SUCCESS');
                        setProgress(100);
                        setVideoResult(response.data.output.video_url);
                        clearInterval(intervalId);
                        clearInterval(progressInterval);
                    } else if (taskStatus === 'FAILED') {
                        setStatus('ERROR');
                        setErrorMessage('La IA falló al generar el video.');
                        clearInterval(intervalId);
                        clearInterval(progressInterval);
                    }
                } catch (error) {
                    setStatus('ERROR');
                    setErrorMessage('Perdimos conexión con el servidor al verificar el estado.');
                    clearInterval(intervalId);
                    clearInterval(progressInterval);
                }
            }, 5000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [status, taskId]);

    const resetForm = () => {
        setFormData({ prompt: '', img_url: '', audio_url: '' });
        setStatus('IDLE');
        setTaskId(null);
        setVideoResult(null);
        setErrorMessage('');
        setProgress(0);
    };

    return (
        <div className="ai-generator">
            {/* Header */}
            <div className="ai-generator-header">
                <div className="ai-generator-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div>
                    <h2 className="ai-generator-title">Generador de Video con IA</h2>
                    <p className="ai-generator-subtitle">Crea videos increíbles a partir de una imagen y descripción</p>
                </div>
            </div>

            {/* Status Badge */}
            <div className="ai-status-row">
                <span className={`ai-status-badge ${status.toLowerCase()}`}>
                    <span className="ai-status-dot"></span>
                    {status === 'IDLE' && 'Listo para crear'}
                    {status === 'LOADING' && 'Iniciando...'}
                    {status === 'PROCESSING' && 'Generando video...'}
                    {status === 'SUCCESS' && 'Completado'}
                    {status === 'ERROR' && 'Error'}
                </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="ai-form">
                <div className="ai-form-group">
                    <label className="ai-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Descripción del video
                    </label>
                    <textarea 
                        name="prompt"
                        value={formData.prompt}
                        onChange={handleChange}
                        required
                        className="ai-textarea"
                        placeholder="Describe lo que quieres que suceda en el video. Ej: Un pingüino bailando en la nieve con auroras boreales de fondo..."
                        rows="4"
                        disabled={status === 'LOADING' || status === 'PROCESSING'}
                    />
                </div>

                <div className="ai-form-row">
                    <div className="ai-form-group">
                        <label className="ai-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            URL de la imagen base
                        </label>
                        <input 
                            type="url"
                            name="img_url"
                            value={formData.img_url}
                            onChange={handleChange}
                            required
                            className="ai-input"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            disabled={status === 'LOADING' || status === 'PROCESSING'}
                        />
                    </div>

                    <div className="ai-form-group">
                        <label className="ai-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18V5l12-2v13"/>
                                <circle cx="6" cy="18" r="3"/>
                                <circle cx="18" cy="16" r="3"/>
                            </svg>
                            URL del audio
                            <span className="ai-label-optional">(Opcional)</span>
                        </label>
                        <input 
                            type="url"
                            name="audio_url"
                            value={formData.audio_url}
                            onChange={handleChange}
                            className="ai-input"
                            placeholder="https://ejemplo.com/audio.mp3"
                            disabled={status === 'LOADING' || status === 'PROCESSING'}
                        />
                    </div>
                </div>

                {/* Progress Bar */}
                {(status === 'LOADING' || status === 'PROCESSING') && (
                    <div className="ai-progress-container">
                        <div className="ai-progress-bar">
                            <div 
                                className="ai-progress-fill" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="ai-progress-text">{progress}%</span>
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={status === 'LOADING' || status === 'PROCESSING'}
                    className="ai-submit-btn"
                >
                    {status === 'LOADING' || status === 'PROCESSING' ? (
                        <>
                            <svg className="ai-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                            {status === 'LOADING' ? 'Iniciando...' : 'Generando video...'}
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                            </svg>
                            Generar Video
                        </>
                    )}
                </button>
            </form>

            {/* Error Message */}
            {status === 'ERROR' && (
                <div className="ai-error-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{errorMessage}</span>
                    <button className="ai-retry-btn" onClick={resetForm}>
                        Reintentar
                    </button>
                </div>
            )}

            {/* Success Result */}
            {status === 'SUCCESS' && videoResult && (
                <div className="ai-success-box">
                    <div className="ai-success-header">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span>Video generado exitosamente</span>
                    </div>
                    <div className="ai-video-container">
                        <video controls className="ai-video-player">
                            <source src={videoResult} type="video/mp4" />
                            Tu navegador no soporta el elemento de video.
                        </video>
                    </div>
                    <div className="ai-success-actions">
                        <a href={videoResult} download className="ai-download-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Descargar
                        </a>
                        <button className="ai-new-btn" onClick={resetForm}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Crear nuevo
                        </button>
                    </div>
                </div>
            )}

            {/* Tips Section */}
            {status === 'IDLE' && (
                <div className="ai-tips">
                    <h4 className="ai-tips-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Consejos para mejores resultados
                    </h4>
                    <ul className="ai-tips-list">
                        <li>Usa imágenes de alta resolución (mínimo 720p)</li>
                        <li>Describe el movimiento deseado con detalle</li>
                        <li>El audio debe ser MP3 o WAV</li>
                        <li>La generación puede tomar entre 1-5 minutos</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AIVideoGenerator;
