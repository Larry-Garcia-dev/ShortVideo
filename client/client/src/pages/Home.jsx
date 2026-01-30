import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';

function Home() {
  const [videos, setVideos] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    axios.get('http://localhost:5000/api/videos')
      .then(response => {
        // Opcional: Ordenar para que los más nuevos salgan primero
        const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setVideos(sorted);
      })
      .catch(error => console.error(error));
  };

  // Función para el botón "Compartir"
  const handleShare = (videoId) => {
    const url = `${window.location.origin}/watch/${videoId}`;
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado al portapapeles! 📋');
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#121212', color: 'white', minHeight: '100vh', fontFamily: 'Arial' }}>
      
      {/* 1. PANEL IZQUIERDO: NAVEGACIÓN */}
      <Sidebar />

      {/* 2. PANEL CENTRAL: FEED */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', height: '100vh' }}>
        
        {/* Header Superior */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          {!user ? (
             <Link to="/login">
                <button style={{ padding: '8px 16px', background: '#e91e63', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Iniciar Sesión
                </button>
             </Link>
          ) : (
             <span style={{ color: '#aaa' }}>Hola, {user.email}</span>
          )}
        </div>

        <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Para Ti</h2>
        
        {/* LISTA DE VIDEOS */}
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {videos.map((video) => (
            <div key={video.id} style={{ borderBottom: '1px solid #333', paddingBottom: '30px' }}>
              
              {/* Info del Usuario */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #FFD700, #e91e63)' }}></div>
                 <div>
                    <strong style={{ fontSize: '1.1em' }}>{video.User ? video.User.email : 'Usuario'}</strong>
                    <br/>
                    <small style={{color:'#aaa'}}>Publicado el {new Date(video.createdAt).toLocaleDateString()}</small>
                 </div>
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: '10px', fontSize: '1.1em' }}>{video.description}</div>

              {/* Reproductor de Video */}
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'black' }}>
                <Link to={`/watch/${video.id}`}>
                    <video 
                      width="100%" 
                      src={`http://localhost:5000/${video.videoUrl.replace(/\\/g, '/')}`} 
                      style={{ maxHeight: '500px', display: 'block' }}
                      controls
                    />
                </Link>
              </div>

              {/* BARRA DE ACCIONES (Likes, Comentarios, Compartir, Vistas) */}
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                 
                 <div style={{ display: 'flex', gap: '25px' }}>
                    
                    {/* LIKES (Sincronizado) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e91e63', fontWeight: 'bold' }}>
                        <span>❤️</span>
                        <span>{video.Likes ? video.Likes.length : 0}</span>
                    </div>

                    {/* COMENTARIOS (Link al chat) */}
                    <Link to={`/watch/${video.id}`} style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>💬</span>
                        <span>Comentar</span>
                    </Link>

                    {/* COMPARTIR (Funcional) */}
                    <div 
                        onClick={() => handleShare(video.id)} 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#2196F3' }}
                    >
                        <span>🔗</span>
                        <span>Compartir</span>
                    </div>

                 </div>

                 {/* VISTAS */}
                 <div style={{ color: '#aaa', fontSize: '0.9em' }}>
                    👀 {video.views} vistas
                 </div>

              </div>
            </div>
          ))}

          {videos.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No hay videos aún. ¡Sé el primero en subir uno!</p>}
        </div>
      </div>

      {/* 3. PANEL DERECHO: TENDENCIAS */}
      <RightPanel />

    </div>
  );
}

export default Home;