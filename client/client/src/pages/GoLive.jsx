import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { translations } from '../utils/translations';

const CATEGORIES = ['Gaming', 'Music', 'Art', 'Talk Show', 'Sports', 'Education', 'Cooking', 'Travel', 'Other'];

function GoLive() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('user')));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const gl = t.goLive || {};

  // Check if user has Google linked
  const hasGoogleLinked = !!userData?.googleId;

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }

    // Refresh user data from backend to get latest googleId status
    axios.get(`http://localhost:5000/api/auth/me/${userData.id}`)
      .then(res => {
        const freshUser = res.data.user;
        // Update localStorage and state with fresh data
        const updatedUser = { ...userData, ...freshUser };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
      })
      .catch(err => console.error('Error refreshing user data:', err));
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(gl.onlyImages || 'Only image files allowed');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const startStream = async () => {
    if (!title.trim()) {
      setError(gl.titleRequired || 'Title is required');
      return;
    }

    if (!hasGoogleLinked) {
      setError(gl.googleRequired || 'You must link your Google account to stream');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First upload thumbnail if exists
      let thumbnailUrl = null;
      if (thumbnail) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnail);
        formData.append('userId', userData.id);
        
        // Use existing video upload endpoint for thumbnail
        const uploadRes = await axios.post('http://localhost:5000/api/videos/upload-thumbnail', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }).catch(() => null);
        
        if (uploadRes?.data?.thumbnailUrl) {
          thumbnailUrl = uploadRes.data.thumbnailUrl;
        }
      }

      const res = await axios.post('http://localhost:5000/api/streams/start', {
        userId: userData.id,
        title: title.trim(),
        description: description.trim(),
        category,
        thumbnailUrl
      });

      setCurrentStream(res.data);
      setIsStreaming(true);
      showToast(gl.streamStarted || 'Stream started!');

    } catch (err) {
      if (err.response?.data?.code === 'GOOGLE_REQUIRED') {
        setError(gl.googleRequired || 'You must link your Google account to stream');
      } else {
        setError(err.response?.data?.message || gl.errorStarting || 'Error starting stream');
      }
    } finally {
      setLoading(false);
    }
  };

  const endStream = async () => {
    if (!currentStream) return;

    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/streams/${currentStream.id}/end`, {
        userId: userData.id
      });

      setIsStreaming(false);
      setCurrentStream(null);
      showToast(gl.streamEnded || 'Stream ended');
      navigate('/streams');

    } catch (err) {
      setError(err.response?.data?.message || gl.errorEnding || 'Error ending stream');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{ padding: '18px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff4d6d, #ff758f)',
                  boxShadow: '0 4px 16px rgba(255,77,109,0.35)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3" fill="#fff"/>
                  </svg>
                </span>
                {gl.title || 'Go Live'}
              </h1>
              <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
                {gl.subtitle || 'Start streaming to your audience'}
              </p>
            </div>

            {/* Google Account Warning */}
            {!hasGoogleLinked && (
              <div style={{
                background: 'rgba(255,170,50,0.12)',
                border: '1px solid rgba(255,170,50,0.3)',
                borderRadius: 'var(--r18)',
                padding: '20px',
                marginBottom: '20px',
                display: 'flex', alignItems: 'flex-start', gap: '14px'
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'rgba(255,170,50,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,170,50,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px', color: 'rgba(255,180,70,0.95)', fontSize: '15px', fontWeight: 700 }}>
                    {gl.googleRequiredTitle || 'Google Account Required'}
                  </h3>
                  <p style={{ margin: '0 0 12px', color: 'var(--muted)', fontSize: '13px' }}>
                    {gl.googleRequiredDesc || 'To ensure stream security and quality, you need to link your Google account before going live.'}
                  </p>
                  <Link to="/profile" className="btn" style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: '#fff', color: '#333', padding: '8px 14px', fontSize: '13px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {gl.linkGoogle || 'Link Google Account'}
                  </Link>
                </div>
              </div>
            )}

            {/* Streaming Panel */}
            {isStreaming ? (
              <div style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r18)',
                overflow: 'hidden'
              }}>
                {/* Live Preview */}
                <div style={{
                  aspectRatio: '16/9',
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute', top: '16px', left: '16px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,40,70,0.95)',
                    color: '#fff', fontWeight: 800, fontSize: '12px',
                    padding: '6px 12px', borderRadius: '8px',
                    textTransform: 'uppercase'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                    LIVE
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'rgba(255,77,109,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                      animation: 'pulse 2s infinite'
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3" fill="#ff4d6d"/>
                      </svg>
                    </div>
                    <p style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>{currentStream?.title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>{gl.youAreLive || "You're live!"}</p>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--muted)' }}>{gl.streamId || 'Stream ID'}: <strong style={{ color: 'var(--text)' }}>{currentStream?.id}</strong></p>
                    <Link to={`/stream/${currentStream?.id}`} style={{ fontSize: '13px', color: 'var(--brand2)' }}>
                      {gl.viewStream || 'View your stream'}
                    </Link>
                  </div>
                  <button
                    onClick={endStream}
                    disabled={loading}
                    className="btn"
                    style={{ background: 'rgba(255,77,109,0.15)', borderColor: 'rgba(255,77,109,0.3)', color: '#ff4d6d' }}
                  >
                    {loading ? gl.ending || 'Ending...' : gl.endStream || 'End Stream'}
                  </button>
                </div>
              </div>
            ) : (
              /* Setup Form */
              <div style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r18)',
                padding: '24px'
              }}>
                {error && (
                  <div style={{
                    background: 'rgba(255,77,109,0.12)',
                    border: '1px solid rgba(255,77,109,0.3)',
                    borderRadius: 'var(--r14)',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    color: 'rgba(255,100,120,0.95)',
                    fontSize: '13px'
                  }}>
                    {error}
                  </div>
                )}

                {/* Thumbnail */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {gl.thumbnail || 'Thumbnail'} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({gl.optional || 'optional'})</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: '16/9',
                      maxWidth: '400px',
                      background: thumbnailPreview ? `url(${thumbnailPreview}) center/cover` : 'rgba(255,255,255,0.05)',
                      border: '2px dashed var(--line)',
                      borderRadius: 'var(--r14)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {!thumbnailPreview && (
                      <>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{gl.clickToUpload || 'Click to upload'}</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Title */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {gl.streamTitle || 'Stream Title'} <span style={{ color: 'var(--bad)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={gl.titlePlaceholder || 'Enter a catchy title for your stream'}
                    className="input"
                    style={{ width: '100%' }}
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {gl.description || 'Description'} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({gl.optional || 'optional'})</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={gl.descriptionPlaceholder || 'Tell viewers what your stream is about'}
                    className="input"
                    style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                    maxLength={500}
                  />
                </div>

                {/* Category */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {gl.category || 'Category'}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(category === cat ? '' : cat)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '999px',
                          border: '1px solid',
                          borderColor: category === cat ? 'var(--brand2)' : 'var(--line)',
                          background: category === cat ? 'rgba(25,211,255,0.12)' : 'transparent',
                          color: category === cat ? 'var(--brand2)' : 'var(--muted)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={startStream}
                  disabled={loading || !hasGoogleLinked}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div className="spinner" style={{ width: '18px', height: '18px' }} />
                      {gl.starting || 'Starting...'}
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                      </svg>
                      {gl.startStreaming || 'Start Streaming'}
                    </span>
                  )}
                </button>
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
      `}</style>
    </div>
  );
}

export default GoLive;
