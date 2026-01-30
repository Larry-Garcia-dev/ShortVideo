import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [statusLabel, setStatusLabel] = useState('Ready');
  const videoRef = useRef(null);
  const seekRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadVideo();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';
      
      if (!isTyping && videoRef.current) {
        if (e.key === ' ') { e.preventDefault(); togglePlay(); }
        if (e.key.toLowerCase() === 'j') jump(-10);
        if (e.key.toLowerCase() === 'k') jump(10);
        if (e.key.toLowerCase() === 'm') toggleMute();
        if (e.key.toLowerCase() === 'f') handleFullscreen();
      }
      
      // Post comment shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement?.id === 'commentInput') {
          handleComment(e);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]);

  const loadVideo = () => {
    axios.get(`http://localhost:5000/api/videos/${id}`)
      .then(res => {
        setVideo(res.data);
        setLikes(res.data.Likes?.length || 0);
        setComments(res.data.Comments || []);
        if (user && res.data.Likes) {
          setIsLiked(res.data.Likes.some(like => like.userId === user.id));
        }
      })
      .catch(err => console.error(err));
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => showToast('Autoplay blocked - click play'));
    } else {
      videoRef.current.pause();
    }
  };

  const jump = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || Infinity, videoRef.current.currentTime + seconds));
    showToast(`${seconds > 0 ? '+' : ''}${seconds}s`);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    if (!videoRef.current.muted && videoRef.current.volume === 0) {
      videoRef.current.volume = 0.6;
    }
    setIsMuted(videoRef.current.muted);
    setVolume(videoRef.current.muted ? 0 : videoRef.current.volume);
    showToast(videoRef.current.muted ? 'Muted' : 'Sound on');
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setVolume(v);
      setIsMuted(v === 0);
    }
  };

  const handleSeek = (e) => {
    const pct = parseFloat(e.target.value);
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = (pct / 100) * videoRef.current.duration;
    }
  };

  const handleFullscreen = async () => {
    try {
      const player = document.querySelector('.player');
      if (!document.fullscreenElement) {
        await player?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      showToast('Fullscreen not available');
    }
  };

  const handleLike = async () => {
    if (!user) {
      showToast('Sign in to like videos');
      return;
    }
    try {
      if (isLiked) {
        await axios.delete(`http://localhost:5000/api/videos/${id}/like`, { data: { userId: user.id } });
        setLikes(likes - 1);
        setIsLiked(false);
        showToast('Unliked');
      } else {
        await axios.post(`http://localhost:5000/api/videos/${id}/like`, { userId: user.id });
        setLikes(likes + 1);
        setIsLiked(true);
        showToast('Liked!');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Sign in to comment');
      return;
    }
    if (!commentText.trim()) {
      showToast('Write a comment first');
      return;
    }
    
    try {
      const res = await axios.post(`http://localhost:5000/api/videos/${id}/comment`, { 
        userId: user.id, 
        text: commentText 
      });
      setComments([res.data, ...comments]);
      setCommentText('');
      showToast('Comment posted');
    } catch (error) {
      console.error(error);
      showToast('Error posting comment');
    }
  };

  const handleSpeedChange = (e) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    showToast(`Speed: ${speed}x`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied!');
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 1200);
  };

  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!video) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'var(--muted)',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      
      <div className="wrap" style={{ maxWidth: '1100px', margin: '0 auto', padding: '18px' }}>
        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 0.9fr',
          gap: '14px',
          alignItems: 'start',
        }}>
          {/* Main Video Section */}
          <section className="panel">
            <div className="videoWrap" style={{ padding: '12px' }}>
              {/* Video Player */}
              <div className="player" style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid var(--line)',
                background: 'rgba(0,0,0,0.35)',
                boxShadow: '0 26px 90px rgba(0,0,0,0.35)',
                aspectRatio: '16/9',
              }}>
                <video
                  ref={videoRef}
                  playsInline
                  preload="metadata"
                  src={`http://localhost:5000/${video.videoUrl.replace(/\\/g, '/')}`}
                  style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
                  onLoadedMetadata={() => {
                    setDuration(videoRef.current?.duration || 0);
                    setStatusLabel('Loaded');
                  }}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onPlay={() => { setIsPlaying(true); setStatusLabel('Playing'); }}
                  onPause={() => { setIsPlaying(false); setStatusLabel('Paused'); }}
                />
              </div>

              {/* Custom Controls */}
              <div className="controls" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '12px',
                border: '1px solid rgba(234,240,255,0.10)',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '18px',
                padding: '12px',
              }}>
                {/* Seek Bar */}
                <input
                  ref={seekRef}
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  style={{
                    width: '100%',
                    accentColor: 'var(--brand2)',
                  }}
                  aria-label="Seek"
                />

                {/* Controls Row */}
                <div className="row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={togglePlay} className="iconBtn" title="Play/Pause (Space)">
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button onClick={() => jump(-10)} className="iconBtn" title="Back 10s (J)">
                    ⏪
                  </button>
                  <button onClick={() => jump(10)} className="iconBtn" title="Forward 10s (K)">
                    ⏩
                  </button>
                  <button onClick={toggleMute} className="iconBtn" title="Mute (M)">
                    {isMuted ? '🔇' : '🔊'}
                  </button>

                  <span className="time" style={{ fontVariantNumeric: 'tabular-nums', color: 'rgba(234,240,255,0.78)', fontSize: '12px' }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  
                  <span style={{ flex: 1 }}></span>

                  <label style={{ fontSize: '12px', color: 'rgba(234,240,255,0.60)' }}>Speed</label>
                  <select 
                    value={playbackSpeed} 
                    onChange={handleSpeedChange}
                    className="select"
                    title="Playback speed"
                    style={{
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      borderRadius: '14px',
                      padding: '10px 12px',
                    }}
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>

                  <label style={{ fontSize: '12px', color: 'rgba(234,240,255,0.60)' }}>Vol</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    style={{ maxWidth: '100px', accentColor: 'var(--brand2)' }}
                  />
                  
                  <button onClick={handleFullscreen} className="iconBtn" title="Fullscreen (F)">
                    ⛶
                  </button>
                </div>

                {/* Shortcuts Row */}
                <div className="row" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(234,240,255,0.60)' }}>
                    Shortcuts: Space play/pause | J/K +/-10s | M mute | F fullscreen
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{statusLabel}</span>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="meta" style={{ padding: '0 12px 12px' }}>
              <h1 style={{ margin: '12px 0 6px', fontSize: '18px', letterSpacing: '-0.2px' }}>
                {video.title}
              </h1>
              
              <div className="metaLine" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="muted">By <b>@{video.User?.email?.split('@')[0] || 'Creator'}</b></span>
                <span className="muted">|</span>
                <span className="muted"><span className="count">{(video.views || 0).toLocaleString()}</span> views</span>
                <span className="muted">|</span>
                <span className="muted"><span className="count">{comments.length}</span> comments</span>

                <span style={{ flex: 1 }}></span>

                <button 
                  onClick={handleLike}
                  className={`likeBtn ${isLiked ? 'liked' : ''}`}
                  role="button"
                  aria-pressed={isLiked}
                  tabIndex={0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: isLiked ? '1px solid rgba(255,77,109,0.30)' : '1px solid var(--line)',
                    borderRadius: '14px',
                    background: isLiked ? 'rgba(255,77,109,0.10)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>❤️</span>
                  <b><span className="count">{likes.toLocaleString()}</span></b>
                  <span className="muted">{isLiked ? 'Liked' : 'Like'}</span>
                </button>
              </div>

              <p className="muted" style={{ margin: '10px 0 0' }}>
                {video.description || 'No description provided.'}
              </p>
            </div>
          </section>

          {/* Sidebar: Comments */}
          <aside className="panel side" style={{ padding: '12px' }}>
            {/* Comment Form */}
            <div className="card" style={{
              border: '1px solid var(--line)',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '18px',
              padding: '12px',
              marginBottom: '12px',
            }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Leave a comment</h3>
              
              {user ? (
                <form onSubmit={handleComment}>
                  <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', color: 'rgba(234,240,255,0.72)' }}>Your name</label>
                    <input
                      className="input"
                      value={user.email}
                      disabled
                      placeholder="e.g., Brian"
                      maxLength={40}
                      style={{
                        border: '1px solid var(--line)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text)',
                        borderRadius: '14px',
                        padding: '10px 12px',
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  
                  <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', color: 'rgba(234,240,255,0.72)' }}>Comment</label>
                    <textarea
                      id="commentInput"
                      className="input"
                      placeholder="Write something..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={600}
                      style={{
                        border: '1px solid var(--line)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text)',
                        borderRadius: '14px',
                        padding: '10px 12px',
                        minHeight: '96px',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn primary">Post</button>
                    <button type="button" className="btn" onClick={() => setCommentText('')}>Clear</button>
                  </div>
                  
                  <div className="muted" style={{ fontSize: '12px', marginTop: '10px' }}>
                    Tip: Press Ctrl/Cmd + Enter to post.
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p className="muted" style={{ marginBottom: '12px' }}>Sign in to leave a comment</p>
                  <Link to="/login" className="btn primary">Sign In</Link>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="card" style={{
              border: '1px solid var(--line)',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '18px',
              padding: '12px',
            }}>
              <div className="hrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '14px' }}>Comments</h3>
                <span className="muted" style={{ fontSize: '12px' }}>{comments.length}</span>
              </div>
              
              {comments.length === 0 ? (
                <div className="muted" style={{ fontSize: '12px' }}>
                  No comments yet. Be the first!
                </div>
              ) : (
                <div className="commentList" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {comments.map((c, index) => (
                    <div key={c.id || index} className="comment" style={{
                      border: '1px solid rgba(234,240,255,0.10)',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '16px',
                      padding: '10px',
                    }}>
                      <div className="cTop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span className="cName" style={{ fontWeight: 800, fontSize: '13px' }}>
                          @{c.User?.email?.split('@')[0] || 'User'}
                        </span>
                        <span className="cTime" style={{ fontSize: '12px', color: 'rgba(234,240,255,0.60)', fontVariantNumeric: 'tabular-nums' }}>
                          {c.createdAt ? formatDate(c.createdAt) : 'Just now'}
                        </span>
                      </div>
                      <p className="cText" style={{ 
                        margin: '8px 0 0', 
                        color: 'rgba(234,240,255,0.80)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default VideoPlayer;
