import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = () => {
    axios.get(`http://localhost:5000/api/videos/${id}`)
      .then(res => {
        setVideo(res.data);
        setLikes(res.data.Likes?.length || 0);
        setComments(res.data.Comments || []);
        // Check if user already liked
        if (user && res.data.Likes) {
          setIsLiked(res.data.Likes.some(like => like.userId === user.id));
        }
      })
      .catch(err => console.error(err));
  };

  const handleLike = async () => {
    if (!user) {
      showToast('Sign in to like videos');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/videos/${id}/like`, { userId: user.id });
      setLikes(likes + 1);
      setIsLiked(true);
      showToast('Liked!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Already liked');
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
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied!');
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 0.9fr',
          gap: '14px',
          alignItems: 'start',
        }}>
          {/* Main Video Section */}
          <section className="panel">
            <div style={{ padding: '12px' }}>
              {/* Video Player */}
              <div className="player" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  src={`http://localhost:5000/${video.videoUrl.replace(/\\/g, '/')}`}
                />
              </div>

              {/* Controls */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '12px',
                border: '1px solid var(--line)',
                background: 'var(--panel)',
                borderRadius: '18px',
                padding: '12px',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Speed</label>
                    <select 
                      value={playbackSpeed} 
                      onChange={handleSpeedChange}
                      className="input"
                      style={{ padding: '8px 12px', minWidth: 'auto' }}
                    >
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1">1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                  </div>
                  
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Shortcuts: Space play/pause • J/K +/-10s • M mute • F fullscreen
                  </span>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div style={{ padding: '0 12px 12px' }}>
              <h1 style={{ margin: '12px 0 6px', fontSize: '18px', letterSpacing: '-0.2px' }}>
                {video.title}
              </h1>
              
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                flexWrap: 'wrap', 
                alignItems: 'center',
              }}>
                <span className="muted">
                  By <b>{video.User?.email || 'User'}</b>
                </span>
                <span className="muted">•</span>
                <span className="muted">
                  <span className="count">{video.views?.toLocaleString()}</span> views
                </span>
                <span className="muted">•</span>
                <span className="muted">
                  <span className="count">{comments.length}</span> comments
                </span>

                <span style={{ flex: 1 }}></span>

                <button 
                  onClick={handleLike}
                  className={`likeBtn ${isLiked ? 'liked' : ''}`}
                  aria-pressed={isLiked}
                >
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                  <b><span className="count">{likes.toLocaleString()}</span></b>
                </button>
              </div>

              <p className="muted" style={{ margin: '12px 0 0', lineHeight: 1.6 }}>
                {video.description}
              </p>
              
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                Published on {formatDate(video.createdAt)}
              </p>
            </div>
          </section>

          {/* Sidebar: Comments */}
          <aside className="panel" style={{ padding: '12px' }}>
            {/* Comment Form */}
            <div className="card" style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Leave a comment</h3>
              
              {user ? (
                <form onSubmit={handleComment}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                      Your name
                    </label>
                    <input
                      className="input"
                      value={user.email}
                      disabled
                      style={{ width: '100%', opacity: 0.7 }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                      Comment
                    </label>
                    <textarea
                      className="input"
                      placeholder="Write something..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={600}
                      style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn primary">Post</button>
                    <button 
                      type="button" 
                      className="btn"
                      onClick={() => setCommentText('')}
                    >
                      Clear
                    </button>
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
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px' }}>Comments</h3>
                <span className="muted" style={{ fontSize: '12px' }}>{comments.length}</span>
              </div>
              
              {comments.length === 0 ? (
                <div className="muted" style={{ fontSize: '12px' }}>
                  No comments yet. Be the first!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {comments.map((c, index) => (
                    <div key={c.id || index} style={{
                      border: '1px solid var(--line)',
                      background: 'var(--panel)',
                      borderRadius: '16px',
                      padding: '10px',
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '13px' }}>
                          {c.User?.email || 'User'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {c.createdAt ? formatDate(c.createdAt) : 'Just now'}
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        color: 'rgba(234, 240, 255, 0.80)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}>
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
              <button onClick={handleCopyLink} className="btn" style={{ flex: 1 }}>
                Copy link
              </button>
              <Link to="/" className="btn" style={{ flex: 1, textAlign: 'center' }}>
                Back to feed
              </Link>
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
