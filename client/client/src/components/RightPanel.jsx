import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function RightPanel({ videos = [], currentVideoIndex = 0, onPlayVideo }) {
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

  const trendingCreators = [
    { name: '@creator_one', followers: '10.2K' },
    { name: '@creator_two', followers: '8.5K' },
    { name: '@creator_three', followers: '6.1K' },
  ];

  const trendingHashtags = [
    { tag: '#daily', count: '2.3M' },
    { tag: '#funny', count: '1.8M' },
    { tag: '#tech', count: '945K' },
  ];

  // Get next videos for queue
  const upNextVideos = videos.slice(currentVideoIndex + 1, currentVideoIndex + 4);

  return (
    <aside style={{
      width: '280px',
      borderLeft: '1px solid var(--line)',
      padding: '16px',
      overflowY: 'auto',
      height: 'calc(100vh - 60px)',
      position: 'sticky',
      top: '60px',
      background: 'rgba(7, 10, 18, 0.3)',
    }}>
      {/* Trending Creators */}
      <div className="panel" style={{ padding: '14px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 800, marginBottom: '12px', fontSize: '14px' }}>Trending Creators</div>
        {trendingCreators.map((creator, i) => (
          <div key={i} style={{
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: i < trendingCreators.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{creator.name}</span>
            <button className="miniBtn" style={{ 
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '5px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
            }}>
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* Trending Hashtags */}
      <div className="panel" style={{ padding: '14px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 800, marginBottom: '12px', fontSize: '14px' }}>Trending Hashtags</div>
        {trendingHashtags.map((item, i) => (
          <div key={i} style={{
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: i < trendingHashtags.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <span style={{ color: 'var(--brand2)', fontSize: '14px' }}>{item.tag}</span>
            <button className="miniBtn" style={{ 
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '5px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
            }}>
              Open
            </button>
          </div>
        ))}
      </div>

      {/* Up Next Queue */}
      <div className="panel" style={{ padding: '14px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 800, marginBottom: '12px', fontSize: '14px' }}>Up Next (Queue)</div>
        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading...</div>
        ) : topVideos.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '13px' }}>No videos in queue</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topVideos.slice(0, 3).map((video, index) => (
              <div 
                key={video.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < 2 ? '1px solid var(--line)' : 'none',
                }}
              >
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  {video.title?.slice(0, 20) || `Video ${String.fromCharCode(65 + index)}`}
                </span>
                <Link 
                  to={`/watch/${video.id}`}
                  className="miniBtn"
                  style={{ 
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  Play
                </Link>
              </div>
            ))}
          </div>
        )}
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
