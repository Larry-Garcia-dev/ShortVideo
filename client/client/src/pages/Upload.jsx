import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Obtener usuario del localStorage para enviar su ID
  const user = JSON.parse(localStorage.getItem('user'));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Selecciona un video');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userId', user ? user.id : 1); // ID del usuario logueado
    formData.append('videoFile', file); // 'videoFile' debe coincidir con el backend

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('¡Video subido con éxito!');
      navigate('/'); [cite_start]// Volver al inicio para ver el video nuevo [cite: 17]
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error al subir';
      alert(msg); [cite_start]// Aquí saldrá el error si dura más de 10 min [cite: 16]
    } finally {
      setLoading(false);
    }
  };

  // Si no hay usuario logueado, no debería estar aquí
  if (!user) {
    return <div style={{color:'white', padding: '20px'}}>Debes iniciar sesión para subir videos.</div>;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <form onSubmit={handleUpload} style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2>Subir Nuevo Video 📹</h2>
        
        <label>Título:</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required 
          style={{ padding: '10px', background: '#333', color: 'white', border: 'none' }} />

        <label>Descripción:</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3"
          style={{ padding: '10px', background: '#333', color: 'white', border: 'none' }} />

        <label>Archivo de Video (Máx 10 min):</label>
        <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} required />

        <button type="submit" disabled={loading} 
          style={{ padding: '12px', background: loading ? '#555' : '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Subiendo...' : 'Publicar Video'}
        </button>
      </form>
    </div>
  );
}

export default Upload;