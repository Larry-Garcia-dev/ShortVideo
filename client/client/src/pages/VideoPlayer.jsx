import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Para leer el ID de la URL
import axios from 'axios';

function VideoPlayer() {
  const { id } = useParams(); // Obtener ID del video desde la URL
  const [video, setVideo] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('user')); // Usuario actual

  // Cargar datos del video
  useEffect(() => {
    axios.get(`http://localhost:5000/api/videos/${id}`)
      .then(res => {
        setVideo(res.data);
        setLikes(res.data.Likes.length);
        setComments(res.data.Comments);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleLike = async () => {
    if (!user) return alert('Inicia sesión para dar like');
    try {
      await axios.post(`http://localhost:5000/api/videos/${id}/like`, { userId: user.id });
      setLikes(likes + 1); // Actualizar contador visualmente
    } catch (error) {
      alert(error.response?.data?.message || 'Error al dar like');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Inicia sesión para comentar');
    
    try {
      const res = await axios.post(`http://localhost:5000/api/videos/${id}/comment`, { 
        userId: user.id, 
        text: commentText 
      });
      setComments([...comments, res.data]); // Agregar nuevo comentario a la lista
      setCommentText(''); // Limpiar input
    } catch (error) {
      console.error(error);
    }
  };

  if (!video) return <div style={{color:'white', padding:'20px'}}>Cargando...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#121212', color: 'white', minHeight: '100vh', display: 'flex', gap: '20px' }}>
      
      {/* LADO IZQUIERDO: REPRODUCTOR */}
      <div style={{ flex: 3 }}>
        <video 
          width="100%" controls autoPlay
          src={`http://localhost:5000/${video.videoUrl.replace(/\\/g, '/')}`} 
          style={{ backgroundColor: 'black', borderRadius: '8px' }}
        />
        <h2>{video.title}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
            <span>👀 {video.views} Vistas</span>
            <button onClick={handleLike} style={{ cursor: 'pointer', background: '#e91e63', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px' }}>
                👍 {likes} Me Gusta
            </button>
        </div>
        <p style={{ marginTop: '20px', padding: '15px', background: '#1e1e1e', borderRadius: '8px' }}>
            {video.description}
        </p>
      </div>

      {/* LADO DERECHO: COMENTARIOS */}
      <div style={{ flex: 1, background: '#1e1e1e', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
        <h3>Comentarios ({comments.length})</h3>
        
        {/* Formulario */}
        {user && (
            <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Escribe un comentario..." 
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', marginBottom: '10px' }}
                />
                <button type="submit" style={{ width: '100%', padding: '8px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor:'pointer' }}>
                    Comentar
                </button>
            </form>
        )}

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {comments.map((c, index) => (
                <div key={index} style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                    <strong style={{ color: '#2196F3', fontSize: '0.9em' }}>
                        {c.User ? c.User.email : 'Usuario'}
                    </strong>
                    <p style={{ margin: '5px 0', fontSize: '0.95em' }}>{c.text}</p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}

export default VideoPlayer;