import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function RightPanel() {
  const [topVideos, setTopVideos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/videos')
      .then(res => {
        // LÓGICA DE POPULARIDAD:
        // Ordenamos los videos de mayor a menor según el número de vistas (views)
        // y tomamos los primeros 5.
        const sorted = res.data.sort((a, b) => b.views - a.views).slice(0, 5);
        setTopVideos(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ width: '350px', padding: '25px', borderLeft: '1px solid #333', display: 'none', '@media (min-width: 1000px)': { display: 'block' } }}>
      
      {/* SECCIÓN POPULARES */}
      <div style={{ background: '#1e1e1e', borderRadius: '12px', padding: '15px', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0, color: '#FFD700' }}>🔥 Lo más popular</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {topVideos.map((video, index) => (
            <div key={video.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              {/* Número de Ranking */}
              <span style={{ fontWeight: 'bold', color: '#e91e63', fontSize: '1.2em', width: '20px' }}>
                {index + 1}
              </span>
              
              <div style={{ flex: 1 }}>
                 <Link to={`/watch/${video.id}`} style={{ textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '0.95em' }}>
                    {video.title}
                 </Link>
                 <br/>
                 <small style={{ color: '#aaa' }}>{video.views} vistas • {video.Likes ? video.Likes.length : 0} likes</small>
              </div>
            </div>
          ))}
          
          {topVideos.length === 0 && <small>Cargando tendencias...</small>}
        </div>
      </div>
      
      {/* SECCIÓN HASHTAGS (Decorativa) */}
      <div>
        <h3 style={{ fontSize: '1em', color: '#aaa' }}>Tendencias para ti</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ border: '1px solid #444', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', cursor: 'pointer' }}>#Gaming</span>
            <span style={{ border: '1px solid #444', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', cursor: 'pointer' }}>#Musica</span>
            <span style={{ border: '1px solid #444', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', cursor: 'pointer' }}>#Viral2026</span>
            <span style={{ border: '1px solid #444', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', cursor: 'pointer' }}>#Fitness</span>
        </div>
      </div>

      {/* Footer simple */}
      <div style={{ marginTop: '50px', fontSize: '0.8em', color: '#555' }}>
        © 2026 ShortVideo App
        <br/>Términos y Privacidad
      </div>

    </div>
  );
}

export default RightPanel;