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
  const [checkingStream, setCheckingStream] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Media states
  const [mediaMode, setMediaMode] = useState('screen'); // 'screen' | 'camera' | 'both'
  const [screenStream, setScreenStream] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const fileInputRef = useRef(null);
  const screenVideoRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('user')));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const gl = t.goLive || {};

  const hasGoogleLinked = !!userData?.googleId;

  // Check for existing active stream on mount
  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }

    // Refresh user data
    axios.get(`http://localhost:5000/api/auth/me/${userData.id}`)
      .then(res => {
        const freshUser = res.data.user;
        const updatedUser = { ...userData, ...freshUser };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
      })
      .catch(err => console.error('Error refreshing user data:', err));

    // Check for existing active stream
    axios.get(`http://localhost:5000/api/streams/user/${userData.id}/active`)
      .then(res => {
        if (res.data && res.data.id) {
          setCurrentStream(res.data);
          setIsStreaming(true);
          setTitle(res.data.title || '');
          setDescription(res.data.description || '');
          setCategory(res.data.category || '');
        }
      })
      .catch(err => console.error('Error checking active stream:', err))
      .finally(() => setCheckingStream(false));
  }, []);

  // Simulate chat messages for demo
  useEffect(() => {
    if (!isStreaming) return;
    
    const sampleMessages = [
      { user: 'Viewer123', message: 'Hello! Great stream!', time: new Date() },
      { user: 'GamerPro', message: 'Love this content!', time: new Date() },
      { user: 'StreamFan', message: 'Keep it up!', time: new Date() },
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleMessages.length) {
        setChatMessages(prev => [...prev, { ...sampleMessages[index], time: new Date() }]);
        index++;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Cleanup media on unmount
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream, cameraStream]);

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

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      });
      setScreenStream(stream);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      
      // Handle stream end (user clicks stop sharing)
      stream.getVideoTracks()[0].onended = () => {
        setScreenStream(null);
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = null;
        }
      };
      
      return true;
    } catch (err) {
      console.error('Screen share error:', err);
      return false;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setCameraStream(stream);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      return false;
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
    }
  };

  const toggleMute = () => {
    const stream = cameraStream || screenStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (cameraStream) {
      cameraStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn;
      });
      setIsCameraOn(!isCameraOn);
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
      // Start media based on mode
      let mediaStarted = false;
      if (mediaMode === 'screen' || mediaMode === 'both') {
        mediaStarted = await startScreenShare();
      }
      if (mediaMode === 'camera' || mediaMode === 'both') {
        const cameraStarted = await startCamera();
        mediaStarted = mediaStarted || cameraStarted;
      }

      if (!mediaStarted) {
        setError(gl.mediaError || 'Could not start screen or camera. Please grant permissions.');
        setLoading(false);
        return;
      }

      // Upload thumbnail if exists
      let thumbnailUrl = null;
      if (thumbnail) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnail);
        formData.append('userId', userData.id);
        
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
      stopScreenShare();
      stopCamera();
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

      // Stop all media
      stopScreenShare();
      stopCamera();

      setIsStreaming(false);
      setCurrentStream(null);
      setChatMessages([]);
      showToast(gl.streamEnded || 'Stream ended');

    } catch (err) {
      setError(err.response?.data?.message || gl.errorEnding || 'Error ending stream');
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, {
      user: userData.email.split('@')[0],
      message: chatInput.trim(),
      time: new Date(),
      isOwner: true
    }]);
    setChatInput('');
  };

  if (!userData) return null;

  if (checkingStream) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <div className="app-layout">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main style={{ padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: '40px', height: '40px' }} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{ padding: '18px', overflowY: 'auto' }}>
          <div style={{ maxWidth: isStreaming ? '100%' : '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: isStreaming ? 'linear-gradient(135deg, #ff4d6d, #ff758f)' : 'linear-gradient(135deg, #19d3ff, #7c5cff)',
                    boxShadow: isStreaming ? '0 4px 16px rgba(255,77,109,0.35)' : '0 4px 16px rgba(25,211,255,0.35)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="3" fill="#fff"/>
                    </svg>
                  </span>
                  {isStreaming ? (currentStream?.title || gl.title) : (gl.title || 'Go Live')}
                </h1>
                <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
                  {isStreaming ? (gl.youAreLive || "You're live!") : (gl.subtitle || 'Start streaming to your audience')}
                </p>
              </div>
              
              {isStreaming && (
                <button
                  onClick={endStream}
                  disabled={loading}
                  className="btn"
                  style={{ 
                    background: 'rgba(255,77,109,0.15)', 
                    borderColor: 'rgba(255,77,109,0.3)', 
                    color: '#ff4d6d',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                  {loading ? (gl.ending || 'Ending...') : (gl.endStream || 'End Stream')}
                </button>
              )}
            </div>

            {/* Google Account Warning */}
            {!hasGoogleLinked && !isStreaming && (
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
                {/* Video Preview Area */}
                <div style={{
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r18)',
                  overflow: 'hidden'
                }}>
                  {/* Main Video */}
                  <div style={{
                    aspectRatio: '16/9',
                    background: '#0a0a0f',
                    position: 'relative'
                  }}>
                    {/* Screen share video */}
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: screenStream ? 'block' : 'none'
                      }}
                    />
                    
                    {/* Camera pip when both active */}
                    {cameraStream && screenStream && (
                      <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        right: '16px',
                        width: '200px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '3px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                      }}>
                        <video
                          ref={cameraVideoRef}
                          autoPlay
                          muted
                          playsInline
                          style={{ width: '100%', display: 'block' }}
                        />
                      </div>
                    )}

                    {/* Camera only view */}
                    {cameraStream && !screenStream && (
                      <video
                        ref={cameraVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}

                    {/* No media fallback */}
                    {!screenStream && !cameraStream && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px'
                      }}>
                        <div style={{
                          width: '60px', height: '60px', borderRadius: '50%',
                          background: 'rgba(255,77,109,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="12" r="3" fill="#ff4d6d"/>
                          </svg>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                          {gl.noMediaActive || 'No screen or camera active'}
                        </p>
                      </div>
                    )}

                    {/* Live badge */}
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
                  </div>

                  {/* Controls Bar */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTop: '1px solid var(--line)',
                    flexWrap: 'wrap', gap: '12px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Screen share toggle */}
                      <button
                        onClick={() => screenStream ? stopScreenShare() : startScreenShare()}
                        className="iconBtn"
                        style={{
                          padding: '10px 14px',
                          background: screenStream ? 'rgba(70,230,165,0.15)' : 'rgba(255,255,255,0.08)',
                          borderColor: screenStream ? 'rgba(70,230,165,0.3)' : 'var(--line)',
                          color: screenStream ? '#46e6a5' : 'var(--muted)'
                        }}
                        title={gl.shareScreen || 'Share Screen'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                      </button>

                      {/* Camera toggle */}
                      <button
                        onClick={() => cameraStream ? stopCamera() : startCamera()}
                        className="iconBtn"
                        style={{
                          padding: '10px 14px',
                          background: cameraStream ? 'rgba(70,230,165,0.15)' : 'rgba(255,255,255,0.08)',
                          borderColor: cameraStream ? 'rgba(70,230,165,0.3)' : 'var(--line)',
                          color: cameraStream ? '#46e6a5' : 'var(--muted)'
                        }}
                        title={gl.camera || 'Camera'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {isCameraOn ? (
                            <path d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>
                          ) : (
                            <>
                              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </>
                          )}
                        </svg>
                      </button>

                      {/* Mute toggle */}
                      <button
                        onClick={toggleMute}
                        className="iconBtn"
                        style={{
                          padding: '10px 14px',
                          background: isMuted ? 'rgba(255,77,109,0.15)' : 'rgba(255,255,255,0.08)',
                          borderColor: isMuted ? 'rgba(255,77,109,0.3)' : 'var(--line)',
                          color: isMuted ? '#ff4d6d' : 'var(--muted)'
                        }}
                        title={isMuted ? (gl.unmute || 'Unmute') : (gl.mute || 'Mute')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {isMuted ? (
                            <>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                              <line x1="12" y1="19" x2="12" y2="23"/>
                              <line x1="8" y1="23" x2="16" y2="23"/>
                            </>
                          ) : (
                            <>
                              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                              <line x1="12" y1="19" x2="12" y2="23"/>
                              <line x1="8" y1="23" x2="16" y2="23"/>
                            </>
                          )}
                        </svg>
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {gl.streamId || 'Stream ID'}: <strong style={{ color: 'var(--text)' }}>{currentStream?.id}</strong>
                      </span>
                      <Link to={`/stream/${currentStream?.id}`} style={{ fontSize: '13px', color: 'var(--brand2)' }}>
                        {gl.viewStream || 'View your stream'}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Chat Panel */}
                <div style={{
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r18)',
                  display: 'flex', flexDirection: 'column',
                  height: 'fit-content',
                  maxHeight: 'calc(100vh - 200px)'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--line)',
                    fontWeight: 700, fontSize: '15px', color: 'var(--text)'
                  }}>
                    {gl.liveChat || 'Live Chat'}
                  </div>

                  {/* Messages */}
                  <div 
                    ref={chatContainerRef}
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '16px',
                      display: 'flex', flexDirection: 'column', gap: '12px',
                      minHeight: '300px',
                      maxHeight: '400px'
                    }}
                  >
                    {chatMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', padding: '40px 0' }}>
                        {gl.noChatMessages || 'No messages yet. Be the first to chat!'}
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: msg.isOwner ? 'linear-gradient(135deg, #ff4d6d, #ff758f)' : 'linear-gradient(135deg, #19d3ff, #7c5cff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0
                          }}>
                            {msg.user.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: msg.isOwner ? '#ff4d6d' : 'var(--text)' }}>
                                {msg.user}
                                {msg.isOwner && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(255,77,109,0.15)', color: '#ff4d6d', padding: '2px 6px', borderRadius: '4px' }}>HOST</span>}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Input */}
                  <div style={{ padding: '16px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder={gl.typeMessage || 'Type a message...'}
                        className="input"
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={sendChatMessage}
                        className="btn btn-primary"
                        style={{ padding: '10px 16px' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
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

                {/* Media Mode Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {gl.streamMode || 'Stream Mode'}
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                      { value: 'screen', icon: 'M2 3h20v14H2zM8 21h8M12 17v4', label: gl.screenOnly || 'Screen Only' },
                      { value: 'camera', icon: 'M23 7l-7 5 7 5zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z', label: gl.cameraOnly || 'Camera Only' },
                      { value: 'both', icon: 'M2 3h20v14H2zM8 21h8M12 17v4', label: gl.screenAndCamera || 'Screen + Camera' }
                    ].map(mode => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setMediaMode(mode.value)}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          padding: '14px',
                          borderRadius: 'var(--r14)',
                          border: '2px solid',
                          borderColor: mediaMode === mode.value ? 'var(--brand2)' : 'var(--line)',
                          background: mediaMode === mode.value ? 'rgba(25,211,255,0.08)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={mediaMode === mode.value ? 'var(--brand2)' : 'var(--muted)'} strokeWidth="2">
                          <path d={mode.icon}/>
                        </svg>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: mediaMode === mode.value ? 'var(--brand2)' : 'var(--muted)' }}>
                          {mode.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

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
        @media (max-width: 900px) {
          .app-layout main > div > div:first-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default GoLive;
