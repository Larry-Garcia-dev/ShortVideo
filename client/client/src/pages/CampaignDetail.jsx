import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [myVideos, setMyVideos] = useState([]); 
  const [selectedVideoId, setSelectedVideoId] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadCampaignData();
    if (user) loadMyVideos();
  }, [id]);

  const loadCampaignData = () => {
    axios.get(`http://localhost:5000/api/campaigns/${id}`)
      .then(res => setCampaign(res.data))
      .catch(err => console.error(err));
  };

  const loadMyVideos = () => {
    axios.get('http://localhost:5000/api/videos')
      .then(res => {
        const mine = res.data.filter(v => v.userId === user.id);
        setMyVideos(mine);
      });
  };

  const handleJoin = async () => {
    if (!selectedVideoId) return alert('Selecciona un video para participar');
    
    try {
      await axios.post(`http://localhost:5000/api/campaigns/${id}/join`, {
        videoId: selectedVideoId
      });
      alert('¡Inscrito correctamente!');
      loadCampaignData(); 
    } catch (error) {
      alert('Error al inscribirse');
    }
  };

  if (!campaign) return <div style={{color:'white', padding:'20px'}}>Cargando ranking...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(90deg, #1cb5e0 0%, #000851 100%)', padding: '40px', borderRadius: '15px', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>{campaign.name}</h1>
        <p>{campaign.description}</p>
        
        {user && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <select 
              value={selectedVideoId} 
              onChange={e => setSelectedVideoId(e.target.value)}
              style={{ padding: '8px' }}
            >
              <option value="">-- Seleccionar Video --</option>
              {myVideos.map(v => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
            <button onClick={handleJoin} style={{ padding: '8px 15px', background: '#FFD700', border: 'none', cursor: 'pointer' }}>
              Unirse
            </button>
          </div>
        )}
      </div>

      <h2>🏆 Ranking</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {campaign.Videos.map((video, index) => (
          <div key={video.id} style={{ display: 'flex', alignItems: 'center', background: '#1e1e1e', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '50px', color: '#FFD700' }}>#{index + 1}</div>
            <div style={{ flex: 1 }}>
              <Link to={`/watch/${video.id}`} style={{ textDecoration: 'none', color: 'white' }}>
                <h3>{video.title}</h3>
              </Link>
              <small>Likes: {video.Likes.length}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CampaignDetail;