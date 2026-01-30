import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/campaigns')
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#121212', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>🔥 Desafíos Activos</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        {campaigns.map(camp => (
          <div key={camp.id} style={{ background: 'linear-gradient(45deg, #1e1e1e, #2a2a2a)', padding: '20px', borderRadius: '12px', width: '300px', border: '1px solid #333' }}>
            <h2 style={{ color: '#FFD700' }}>🏆 {camp.name}</h2>
            <p>{camp.description}</p>
            <p style={{ fontSize: '0.9em', color: '#aaa' }}>
              Finaliza: {new Date(camp.endDate).toLocaleDateString()}
            </p>
            
            <Link to={`/campaign/${camp.id}`}>
              <button style={{ width: '100%', padding: '10px', marginTop: '15px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Ver Ranking
              </button>
            </Link>
          </div>
        ))}

        {campaigns.length === 0 && <p>No hay campañas activas en este momento.</p>}
      </div>
    </div>
  );
}

export default CampaignList;