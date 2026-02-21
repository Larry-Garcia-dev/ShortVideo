import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import ShareModal from '../components/ShareModal';
import { translations } from '../utils/translations';

/* ── SVG icon helpers ──────────────────────────────── */
const Ico = ({ children, size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} {...p}>
    {children}
  </svg>
);

const PlayIcon = () => (<Ico><polygon points="5 3 19 12 5 21 5 3" /></Ico>);
const PauseIcon = () => (<Ico><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></Ico>);
const SkipBackIcon = () => (<Ico><polygon points="11 19 2 12 11 5 11 19" /><line x1="22" y1="12" x2="11" y2="12" /></Ico>);
const SkipFwdIcon = () => (<Ico><polygon points="13 19 22 12 13 5 13 19" /><line x1="2" y1="12" x2="13" y2="12" /></Ico>);
const VolXIcon = () => (<Ico><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></Ico>);
const Vol2Icon = () => (<Ico><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></Ico>);
const MaxIcon = () => (<Ico><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></Ico>);
const HeartIcon = ({ filled }) => (
  <Ico size={15}>
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={filled ? '#FF4D6D' : 'none'}
      stroke={filled ? '#FF4D6D' : 'currentColor'}
    />
  </Ico>
);
const ShareIcon = () => (<Ico size={14}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></Ico>);

function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
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
  const [statusLabel, setStatusLabel] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const videoRef = useRef(null);
  const seekRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const vp = t.videoPlayer || {};

  useEffect(() => {
    setStatusLabel(vp.ready || 'Ready');
  }, [lang]);

  useEffect(() => {
    loadVideo();
    loadAllVideos();
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

  const loadAllVideos = () => {
    axios.get('http://localhost:5000/api/videos')
      .then(res => setAllVideos(res.data))
      .catch(() => {});
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => showToast(vp.autoplayBlocked || 'Autoplay blocked'));
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
    showToast(videoRef.current.muted ? (vp.muted || 'Muted') : (vp.soundOn || 'Sound on'));
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
    } catch {
      showToast(vp.fullscreenNA || 'Fullscreen not available');
    }
  };

  const handleLike = async () => {
    if (!user) {
      showToast(vp.signInToLike || 'Sign in to like');
      return;
    }
    try {
      if (isLiked) {
        await axios.delete(`http://localhost:5000/api/videos/${id}/like`, { data: { userId: user.id } });
        setLikes(likes - 1);
        setIsLiked(false);
        showToast(vp.unliked || 'Unliked');
      } else {
        await axios.post(`http://localhost:5000/api/videos/${id}/like`, { userId: user.id });
        setLikes(likes + 1);
        setIsLiked(true);
        showToast(vp.liked || 'Liked!');
      }
    } catch (error) {
      showToast(error.response?.data?.message || t.common?.error || 'Error');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { showToast(vp.signInToComment || 'Sign in to comment'); return; }
    if (!commentText.trim()) { showToast(vp.writeComment || 'Write a comment first'); return; }

    try {
      const res = await axios.post(`http://localhost:5000/api/videos/${id}/comment`, {
        userId: user.id,
        text: commentText
      });
      setComments([res.data, ...comments]);
      setCommentText('');
      showToast(vp.commentPosted || 'Comment posted');
    } catch (error) {
      console.error(error);
      showToast(vp.errorComment || 'Error posting comment');
    }
  };

  const handleSpeedChange = (e) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    showToast(`${vp.speed || 'Speed'}: ${speed}x`);
  };

  const handleOpenShare = () => {
    setShareOpen(true);
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
    const locale = lang === 'es' ? 'es-ES' : lang === 'zh' ? 'zh-CN' : 'en-US';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
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
        {vp.loading || t.common?.loading || 'Loading...'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={() => {}} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main style={{ padding: '18px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="video-player-grid">
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
                        setStatusLabel(vp.loaded || 'Loaded');
                      }}
                      onTimeUpdate={() => {
                        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                      }}
                      onPlay={() => { setIsPlaying(true); setStatusLabel(vp.playing || 'Playing'); }}
                      onPause={() => { setIsPlaying(false); setStatusLabel(vp.paused || 'Paused'); }}
                    />
                  </div>

                  {/* Custom Controls */}
                  <div className="vp-controls">
                    {/* Seek Bar */}
                    <input
                      ref={seekRef}
                      type="range"
                      min="0"
                      max="100"
                      value={duration ? (currentTime / duration) * 100 : 0}
                      onChange={handleSeek}
                      className="vp-seek"
                      aria-label="Seek"
                    />

                    {/* Controls Row */}
                    <div className="vp-controls-row">
                      <button onClick={togglePlay} className="iconBtn vp-icon-btn" title="Play/Pause (Space)" aria-label={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                      <button onClick={() => jump(-10)} className="iconBtn vp-icon-btn" title="Back 10s (J)" aria-label="Back 10 seconds">
                        <SkipBackIcon />
                      </button>
                      <button onClick={() => jump(10)} className="iconBtn vp-icon-btn" title="Forward 10s (K)" aria-label="Forward 10 seconds">
                        <SkipFwdIcon />
                      </button>
                      <button onClick={toggleMute} className="iconBtn vp-icon-btn" title="Mute (M)" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                        {isMuted ? <VolXIcon /> : <Vol2Icon />}
                      </button>

                      <span className="vp-time">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      <span style={{ flex: 1 }} />

                      <label className="vp-label">{vp.speed || 'Speed'}</label>
                      <select
                        value={playbackSpeed}
                        onChange={handleSpeedChange}
                        className="vp-select"
                        title="Playback speed"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>

                      <label className="vp-label">{vp.vol || 'Vol'}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="vp-vol-slider"
                      />

                      <button onClick={handleFullscreen} className="iconBtn vp-icon-btn" title="Fullscreen (F)" aria-label="Fullscreen">
                        <MaxIcon />
                      </button>
                    </div>

                    {/* Shortcuts Row */}
                    <div className="vp-shortcuts-row">
                      <span>{vp.shortcuts || 'Shortcuts: Space play/pause | J/K +/-10s | M mute | F fullscreen'}</span>
                      <span style={{ color: 'var(--muted)' }}>{statusLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="meta" style={{ padding: '0 12px 12px' }}>
                  <h1 style={{ margin: '12px 0 6px', fontSize: '18px', letterSpacing: '-0.2px' }}>
                    {video.title}
                  </h1>

                  <div className="metaLine" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="muted">{vp.by || 'By'} <b>@{video.User?.email?.split('@')[0] || 'Creator'}</b></span>
                    <span className="muted">|</span>
                    <span className="muted"><span className="count">{(video.views || 0).toLocaleString()}</span> {vp.views || 'views'}</span>
                    <span className="muted">|</span>
                    <span className="muted"><span className="count">{comments.length}</span> {vp.comments || 'comments'}</span>

                    <span style={{ flex: 1 }} />

                    <button onClick={handleOpenShare} className="btn" style={{ padding: '8px 12px', fontSize: '12px' }} title={vp.shareVideo || 'Share'}>
                      <ShareIcon /> <span>{vp.shareVideo || 'Share'}</span>
                    </button>

                    <button
                      onClick={handleLike}
                      className={`likeBtn ${isLiked ? 'liked' : ''}`}
                      role="button"
                      aria-pressed={isLiked}
                      tabIndex={0}
                    >
                      <HeartIcon filled={isLiked} />
                      <b><span className="count">{likes.toLocaleString()}</span></b>
                      <span className="muted">{isLiked ? (vp.likedBtn || 'Liked') : (vp.like || 'Like')}</span>
                    </button>
                  </div>

                  <p className="muted" style={{ margin: '10px 0 0' }}>
                    {video.description || (vp.noDescription || 'No description provided.')}
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
                  <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>{vp.leaveComment || 'Leave a comment'}</h3>

                  {user ? (
                    <form onSubmit={handleComment}>
                      <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px', color: 'rgba(234,240,255,0.72)' }}>{vp.yourName || 'Your name'}</label>
                        <input
                          className="input"
                          value={user.email}
                          disabled
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
                        <label style={{ fontSize: '12px', color: 'rgba(234,240,255,0.72)' }}>{vp.comment || 'Comment'}</label>
                        <textarea
                          id="commentInput"
                          className="input"
                          placeholder={vp.writeSomething || 'Write something...'}
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
                        <button type="submit" className="btn primary">{vp.post || 'Post'}</button>
                        <button type="button" className="btn" onClick={() => setCommentText('')}>{vp.clear || 'Clear'}</button>
                      </div>

                      <div className="muted" style={{ fontSize: '12px', marginTop: '10px' }}>
                        {vp.tipComment || 'Tip: Press Ctrl/Cmd + Enter to post.'}
                      </div>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <p className="muted" style={{ marginBottom: '12px' }}>{vp.signInToLeaveComment || 'Sign in to leave a comment'}</p>
                      <Link to="/login" className="btn primary">{vp.signIn || 'Sign In'}</Link>
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
                    <h3 style={{ margin: 0, fontSize: '14px' }}>{vp.commentsTitle || 'Comments'}</h3>
                    <span className="muted" style={{ fontSize: '12px' }}>{comments.length}</span>
                  </div>

                  {comments.length === 0 ? (
                    <div className="muted" style={{ fontSize: '12px' }}>
                      {vp.noComments || 'No comments yet. Be the first!'}
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
                              {c.createdAt ? formatDate(c.createdAt) : (vp.justNow || 'Just now')}
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
        </main>

        <RightPanel videos={allVideos} />
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        url={window.location.href}
        title={video?.title || ''}
      />

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default VideoPlayer;
