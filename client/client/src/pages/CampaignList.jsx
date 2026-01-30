import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/campaigns')
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      
      <main className="wrap" style={{ maxWidth: '1180px', margin: '0 auto', padding: '18px' }}>
        {/* Hero Announcement */}
        <section style={{
          position: 'relative',
          padding: '24px',
          borderRadius: 'var(--r22)',
          border: '1px solid rgba(234, 240, 255, 0.14)',
          background: `
            radial-gradient(700px 400px at 20% 20%, rgba(25, 211, 255, 0.18), transparent 60%),
            radial-gradient(780px 420px at 80% 30%, rgba(124, 92, 255, 0.22), transparent 65%),
            var(--panel)
          `,
          boxShadow: 'var(--shadow)',
          marginBottom: '24px',
        }}>
          <span className="pill">Active Challenges</span>
          <h1 style={{ 
            margin: '12px 0 8px', 
            fontSize: 'clamp(22px, 2.4vw, 32px)',
            letterSpacing: '-0.3px',
          }}>
            Video Challenges & Campaigns
          </h1>
          <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '80ch', lineHeight: 1.6 }}>
            Participate in challenges to rank your videos on the leaderboard. 
            Videos are ranked by total likes - the more likes, the higher you climb!
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginTop: '20px',
            maxWidth: '500px',
          }}>
            <div className="kpi">
              <b>{campaigns.length}</b>
              <span>Active Campaigns</span>
            </div>
            <div className="kpi">
              <b>Real-time</b>
              <span>Ranking Updates</span>
            </div>
          </div>
        </section>

        {/* Campaign Grid */}
        <section>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Active Campaigns</h2>
            <span className="pill">
              <span className="dot"></span>
              Live
            </span>
          </div>

          {loading ? (
            <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
              <span className="muted">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
              <span className="muted">No active campaigns at the moment.</span>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}>
              {campaigns.map(camp => (
                <article key={camp.id} className="panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="pill">Challenge</span>
                    <span className="pill" style={{ 
                      background: 'rgba(70, 230, 165, 0.1)', 
                      borderColor: 'rgba(70, 230, 165, 0.2)',
                      color: 'var(--good)',
                    }}>
                      <span className="dot"></span>
                      Active
                    </span>
                  </div>
                  
                  <h3 style={{ 
                    margin: '0 0 8px', 
                    fontSize: '18px', 
                    fontWeight: 800,
                    letterSpacing: '-0.2px',
                  }}>
                    {camp.name}
                  </h3>
                  
                  <p style={{ 
                    margin: '0 0 16px', 
                    color: 'var(--muted)', 
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}>
                    {camp.description}
                  </p>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '12px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                      Ends on
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {formatDate(camp.endDate)}
                    </div>
                  </div>
                  
                  <Link to={`/campaign/${camp.id}`} className="btn primary" style={{ width: '100%' }}>
                    View Leaderboard
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer style={{ 
          padding: '32px 0 16px', 
          color: 'var(--muted)', 
          fontSize: '12px', 
          textAlign: 'center' 
        }}>
          © {new Date().getFullYear()} ShortVideo — Campaign page
        </footer>
      </main>
    </div>
  );
}

export default CampaignList;
