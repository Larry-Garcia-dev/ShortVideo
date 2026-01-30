import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function RightPanel() {
  const [topVideos, setTopVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/videos')
      .then(res => {
        const sorted = res.data.sort((a, b) => b.views - a.views).slice(0, 5);
        setTopVideos(sorted);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const trendingHashtags = ['#Gaming', '#Music', '#Viral2026', '#Fitness', '#Tech'];

  return (
    <aside style={{
      width: '320px',
      borderLeft: '1px solid var(--line)',
      padding: '16px',
      overflowY: 'auto',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'rgba(7, 10, 18, 0.3)',
    }}>
      {/* Trending Creators */}
      <div className="panel" style={{ padding: '14px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 800, marginBottom: '12px' }}>Trending Creators</div>
        {['@creator_one', '@creator_two', '@creator_three'].map((creator, i) => (
          <div key={i} style={{
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: i < 2 ? '1px solid var(--line)' : 'none',
          }}>
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{creator}</span>
            <span className="chip" style={{ cursor: 'pointer' }}>Follow</span>
          </div>
        ))}
      </div>

      {/* Popular Videos */}
      <div className="panel" style={{ padding: '14px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Top Videos</span>
          <span className="pill" style={{ padding: '4px 8px', fontSize: '11px' }}>
            <span className="dot" style={{ width: '6px', height: '6px' }}></span>
            Live
          </span>
        </div>
        
        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading...</div>
        ) : topVideos.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '13px' }}>No videos yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topVideos.map((video, index) => (
              <Link 
                key={video.id} 
                to={`/watch/${video.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--line)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="rank" style={{ 
                  width: '32px', 
                  height: '32px', 
                  fontSize: '13px',
                  borderRadius: '10px',
                }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '13px', 
                    color: 'var(--text)',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {video.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {video.views} views • {video.Likes ? video.Likes.length : 0} likes
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trending Hashtags */}
      <div className="panel" style={{ padding: '14px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 800, marginBottom: '12px' }}>Trending Hashtags</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {trendingHashtags.map((tag, i) => (
            <span 
              key={i} 
              className="chip" 
              style={{ cursor: 'pointer' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '20px', 
        fontSize: '12px', 
        color: 'var(--muted)',
        padding: '0 4px',
      }}>
        © 2026 ShortVideo App
        <br/>
        <span style={{ opacity: 0.7 }}>Terms & Privacy</span>
      </div>
    </aside>
  );
}

export default RightPanel;
