import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { translations } from '../utils/translations';

function Streams() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const st = t.streams || {};
  const navigate = useNavigate();

  useEffect(() => {
    loadStreams();
    const interval = setInterval(loadStreams, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadStreams = () => {
    axios.get('http://localhost:5000/api/streams/live')
      .then(res => {
        setStreams(res.data || []);
      })
      .catch(err => console.error('Error loading streams:', err))
      .finally(() => setLoading(false));
  };

  const formatViewers = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{ padding: '18px', overflowY: 'auto' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--text)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff4d6d, #ff758f)', boxShadow: '0 4px 16px rgba(255,77,109,0.35)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3" fill="#fff"/>
                      </svg>
                    </span>
                    {st.title || 'Live Streams'}
                  </span>
                </h1>
                <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
                  {st.subtitle || 'Watch creators streaming live right now'}
                </p>
              </div>

              {user && (
                <Link to="/go-live" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {st.goLive || 'Go Live'}
                </Link>
              )}
            </div>
          </div>

          {/* Streams Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div className="spinner" />
            </div>
          ) : streams.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(255,77,109,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,77,109,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--text)', fontWeight: 700 }}>{st.noStreams || 'No live streams right now'}</h3>
              <p style={{ color: 'var(--muted)', margin: 0 }}>{st.noStreamsDesc || 'Be the first to go live!'}</p>
              {user && (
                <Link to="/go-live" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {st.startStreaming || 'Start Streaming'}
                </Link>
              )}
            </div>
          ) : (
            <div className="streams-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '18px'
            }}>
              {streams.map(stream => {
                const streamer = stream.User || {};
                const username = (streamer.email || '').split('@')[0];

                return (
                  <Link
                    key={stream.id}
                    to={`/stream/${stream.id}`}
                    className="stream-card"
                    style={{
                      display: 'block',
                      background: 'var(--card)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r18)',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                      textDecoration: 'none'
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111' }}>
                      {stream.thumbnailUrl ? (
                        <img
                          src={`http://localhost:5000${stream.thumbnailUrl}`}
                          alt={stream.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                      )}

                      {/* LIVE badge */}
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,40,70,0.95)',
                        color: '#fff', fontWeight: 800, fontSize: '11px',
                        padding: '4px 10px', borderRadius: '6px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        boxShadow: '0 2px 8px rgba(255,40,70,0.4)'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                        LIVE
                      </div>

                      {/* Viewer count */}
                      <div style={{
                        position: 'absolute', bottom: '10px', left: '10px',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff', fontSize: '12px', fontWeight: 600,
                        padding: '4px 8px', borderRadius: '6px'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {formatViewers(stream.viewerCount || 0)}
                      </div>

                      {/* Duration */}
                      <div style={{
                        position: 'absolute', bottom: '10px', right: '10px',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff', fontSize: '11px', fontWeight: 600,
                        padding: '4px 8px', borderRadius: '6px'
                      }}>
                        {getTimeAgo(stream.startedAt)}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '14px', display: 'flex', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        {streamer.avatar ? (
                          <img src={streamer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          username.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {stream.title}
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                          @{username}
                        </p>
                        {stream.category && (
                          <span style={{
                            display: 'inline-block', marginTop: '6px',
                            padding: '3px 8px', borderRadius: '6px',
                            background: 'rgba(124,92,255,0.12)', color: 'rgba(160,140,255,0.9)',
                            fontSize: '11px', fontWeight: 600
                          }}>
                            {stream.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .stream-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.35);
          border-color: rgba(255,77,109,0.3);
        }
      `}</style>
    </div>
  );
}

export default Streams;
