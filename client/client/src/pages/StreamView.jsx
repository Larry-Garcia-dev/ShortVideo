import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { translations } from '../utils/translations';

// Gift icons mapping
const GIFT_ICONS = {
  coin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#DAA520" strokeWidth="2"/>
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B8860B">$</text>
    </svg>
  ),
  heart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff4d6d">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  star: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  fire: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C10 6 8 7 7 10C6 13 7 16 9 18C11 20 14 20 16 18C18 16 19 13 18 10C17 7 15 6 12 2Z" fill="#FF6B35"/>
      <path d="M12 8C11 10 10 11 10 13C10 15 11 16 12 16C13 16 14 15 14 13C14 11 13 10 12 8Z" fill="#FFD93D"/>
    </svg>
  ),
  diamond: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#00CED1" stroke="#008B8B" strokeWidth="1"/>
      <path d="M12 2L7 9H17L12 2Z" fill="#40E0D0"/>
    </svg>
  ),
  rocket: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 8 6 8 14C8 18 12 22 12 22C12 22 16 18 16 14C16 6 12 2 12 2Z" fill="#FF6B6B"/>
      <circle cx="12" cy="10" r="2" fill="#FFE66D"/>
      <path d="M8 14L4 18M16 14L20 18" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  crown: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 17L4 8L8 12L12 4L16 12L20 8L22 17H2Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
      <rect x="4" y="17" width="16" height="3" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
    </svg>
  ),
  galaxy: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#galaxyGrad)"/>
      <circle cx="12" cy="12" r="3" fill="#fff" opacity="0.8"/>
      <defs>
        <radialGradient id="galaxyGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#9B59B6"/>
          <stop offset="50%" stopColor="#3498DB"/>
          <stop offset="100%" stopColor="#1A1A2E"/>
        </radialGradient>
      </defs>
    </svg>
  )
};

function StreamView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gifts, setGifts] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [giftAnimations, setGiftAnimations] = useState([]);
  const [showGiftPanel, setShowGiftPanel] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const sv = t.streamView || {};

  useEffect(() => {
    loadStream();
    loadGifts();
    if (user) loadBalance();

    // Join stream
    axios.post(`http://localhost:5000/api/streams/${id}/viewers`, { action: 'join' }).catch(() => {});

    // Leave on unmount
    return () => {
      axios.post(`http://localhost:5000/api/streams/${id}/viewers`, { action: 'leave' }).catch(() => {});
    };
  }, [id]);

  const loadStream = () => {
    axios.get(`http://localhost:5000/api/streams/${id}`)
      .then(res => setStream(res.data))
      .catch(() => navigate('/streams'))
      .finally(() => setLoading(false));
  };

  const loadGifts = () => {
    axios.get('http://localhost:5000/api/streams/gifts')
      .then(res => setGifts(res.data || []))
      .catch(() => {});
  };

  const loadBalance = () => {
    if (!user) return;
    axios.get(`http://localhost:5000/api/coins/balance/${user.id}`)
      .then(res => setUserBalance(res.data.balance || 0))
      .catch(() => {});
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const sendGift = async (gift) => {
    if (!user) {
      showToast(sv.loginRequired || 'Please log in to send gifts');
      return;
    }

    if (userBalance < gift.coinCost) {
      showToast(sv.insufficientCoins || 'Not enough coins');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/streams/gift', {
        streamId: id,
        userId: user.id,
        giftId: gift.giftId
      });

      setUserBalance(res.data.senderBalance);
      showToast(`${sv.giftSent || 'Sent'} ${gift.name}!`);

      // Animate gift
      const animId = Date.now();
      setGiftAnimations(prev => [...prev, { id: animId, gift }]);
      setTimeout(() => {
        setGiftAnimations(prev => prev.filter(a => a.id !== animId));
      }, 2000);

    } catch (error) {
      if (error.response?.data?.code === 'INSUFFICIENT_COINS') {
        showToast(sv.insufficientCoins || 'Not enough coins');
      } else {
        showToast(sv.errorSendingGift || 'Error sending gift');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <h2>{sv.streamNotFound || 'Stream not found'}</h2>
        <Link to="/streams" className="btn btn-primary">{sv.backToStreams || 'Back to Streams'}</Link>
      </div>
    );
  }

  const streamer = stream.User || {};
  const username = (streamer.email || '').split('@')[0];
  const isEnded = stream.status === 'ended';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{ padding: '18px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Video Player Area */}
            <div style={{
              position: 'relative',
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: 'var(--r18)',
              overflow: 'hidden',
              marginBottom: '18px'
            }}>
              {/* Placeholder for actual video stream */}
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px'
              }}>
                {isEnded ? (
                  <>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>{sv.streamEnded || 'This stream has ended'}</p>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'rgba(255,77,109,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: 'pulse 2s infinite'
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3" fill="#ff4d6d"/>
                      </svg>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{sv.liveNow || 'Live Now'}</p>
                  </>
                )}
              </div>

              {/* LIVE badge */}
              {!isEnded && (
                <div style={{
                  position: 'absolute', top: '16px', left: '16px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,40,70,0.95)',
                  color: '#fff', fontWeight: 800, fontSize: '12px',
                  padding: '6px 12px', borderRadius: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  boxShadow: '0 2px 12px rgba(255,40,70,0.5)'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                  LIVE
                </div>
              )}

              {/* Viewer count */}
              <div style={{
                position: 'absolute', top: '16px', right: '16px',
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                padding: '6px 12px', borderRadius: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {stream.viewerCount || 0} {sv.viewers || 'viewers'}
              </div>

              {/* Gift animations */}
              {giftAnimations.map(anim => (
                <div
                  key={anim.id}
                  style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    animation: 'giftFloat 2s ease-out forwards',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                  }}
                >
                  <div style={{ transform: 'scale(2)' }}>
                    {GIFT_ICONS[anim.gift.icon || anim.gift.giftId] || GIFT_ICONS.star}
                  </div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                    {anim.gift.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Stream Info */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r18)',
              padding: '18px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Link to={`/profile/${streamer.id}`} style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '20px', flexShrink: 0,
                  overflow: 'hidden', textDecoration: 'none'
                }}>
                  {streamer.avatar ? (
                    <img src={streamer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    username.charAt(0).toUpperCase()
                  )}
                </Link>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                    {stream.title}
                  </h1>
                  <Link to={`/profile/${streamer.id}`} style={{ color: 'var(--muted)', fontSize: '14px', textDecoration: 'none' }}>
                    @{username}
                  </Link>
                  {stream.description && (
                    <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
                      {stream.description}
                    </p>
                  )}
                  {stream.category && (
                    <span style={{
                      display: 'inline-block', marginTop: '10px',
                      padding: '4px 10px', borderRadius: '8px',
                      background: 'rgba(124,92,255,0.12)', color: 'rgba(160,140,255,0.9)',
                      fontSize: '12px', fontWeight: 600
                    }}>
                      {stream.category}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{stream.totalGiftsReceived || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>{sv.gifts || 'Gifts'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand2)' }}>{stream.totalCoinsReceived || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>{sv.coins || 'Coins'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gift Panel */}
            {!isEnded && (
              <div style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r18)',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                    {sv.sendGift || 'Send a Gift'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand2)', fontWeight: 700 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
                        <circle cx="12" cy="12" r="6" fill="currentColor"/>
                      </svg>
                      {userBalance.toLocaleString()}
                    </div>
                    <Link to="/buy-coins" className="btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      {sv.buyCoins || 'Buy Coins'}
                    </Link>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: '10px'
                }}>
                  {gifts.map(gift => (
                    <button
                      key={gift.giftId}
                      onClick={() => sendGift(gift)}
                      disabled={!user || userBalance < gift.coinCost}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        padding: '12px 8px',
                        background: userBalance >= gift.coinCost ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--r14)',
                        cursor: user && userBalance >= gift.coinCost ? 'pointer' : 'not-allowed',
                        opacity: user && userBalance >= gift.coinCost ? 1 : 0.5,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {GIFT_ICONS[gift.icon || gift.giftId] || GIFT_ICONS.star}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{gift.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--brand2)', fontWeight: 700 }}>{gift.coinCost}</span>
                    </button>
                  ))}
                </div>

                {!user && (
                  <p style={{ margin: '14px 0 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                    <Link to="/login" style={{ color: 'var(--brand2)' }}>{sv.loginToSend || 'Log in to send gifts'}</Link>
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes giftFloat {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-150px) scale(1.5); }
        }
        .gift-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1) !important;
          border-color: var(--brand2) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export default StreamView;
