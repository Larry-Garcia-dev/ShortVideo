import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import Header from '../components/Header';

function Home() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('foryou');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/videos')
      .then(response => {
        const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setVideos(sorted);
        setFilteredVideos(sorted);
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredVideos(videos);
      return;
    }
    const q = query.toLowerCase();
    const filtered = videos.filter(v => 
      v.title?.toLowerCase().includes(q) || 
      v.description?.toLowerCase().includes(q) ||
      (v.User?.email && v.User.email.toLowerCase().includes(q))
    );
    setFilteredVideos(filtered);
  };

  const handleShare = (videoId) => {
    const url = `${window.location.origin}/watch/${videoId}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!');
  };

  const handleLike = async (videoId) => {
    if (!user) {
      showToast('Sign in to like videos');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/videos/${videoId}/like`, { userId: user.id });
      loadVideos();
      showToast('Liked!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Already liked');
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={handleSearch} />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        
        {/* Main Feed */}
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            fontWeight: 600,
            position: 'sticky',
            top: 0,
            background: 'var(--bg)',
            paddingTop: '4px',
            paddingBottom: '10px',
            zIndex: 5,
          }}>
            <button
              onClick={() => setActiveTab('foryou')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'foryou' ? 'var(--text)' : 'var(--muted)',
                cursor: 'pointer',
                paddingBottom: '8px',
                borderBottom: activeTab === 'foryou' ? '2px solid var(--text)' : '2px solid transparent',
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              For You
            </button>
            <button
              onClick={() => setActiveTab('following')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'following' ? 'var(--text)' : 'var(--muted)',
                cursor: 'pointer',
                paddingBottom: '8px',
                borderBottom: activeTab === 'following' ? '2px solid var(--text)' : '2px solid transparent',
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              Following
            </button>
          </div>

          {/* Video Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                Loading videos...
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                  No videos yet. Be the first to upload one!
                </p>
                <Link to="/upload" className="btn primary">
                  Upload Video
                </Link>
              </div>
            ) : (
              filteredVideos.map((video) => (
                <article 
                  key={video.id} 
                  className="panel"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    padding: '16px',
                  }}
                >
                  {/* Video Player */}
                  <Link to={`/watch/${video.id}`} style={{ textDecoration: 'none' }}>
                    <div className="player" style={{ aspectRatio: '16/9', position: 'relative' }}>
                      <video
                        src={`http://localhost:5000/${video.videoUrl.replace(/\\/g, '/')}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted
                        preload="metadata"
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                      <span className="pill" style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(6px)',
                      }}>
                        {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                      </span>
                    </div>
                  </Link>

                  {/* Video Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Creator Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--brand), var(--brand2))',
                        border: '2px solid var(--line)',
                      }}></div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px' }}>
                          {video.User ? video.User.email : 'User'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {formatDate(video.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <Link to={`/watch/${video.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                        {video.title}
                      </h3>
                    </Link>
                    <p style={{ 
                      margin: 0, 
                      color: 'var(--muted)', 
                      fontSize: '13px',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {video.description}
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--muted)' }}>
                      <span>{video.views} views</span>
                      <span>{video.Likes ? video.Likes.length : 0} likes</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleLike(video.id)} 
                        className="btn"
                        style={{ fontSize: '13px', padding: '8px 14px' }}
                      >
                        Like
                      </button>
                      <Link to={`/watch/${video.id}`} className="btn" style={{ fontSize: '13px', padding: '8px 14px' }}>
                        Comment
                      </Link>
                      <button 
                        onClick={() => handleShare(video.id)} 
                        className="btn"
                        style={{ fontSize: '13px', padding: '8px 14px' }}
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Load More Indicator */}
          {!loading && filteredVideos.length > 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: 'var(--muted)', 
              fontSize: '13px' 
            }}>
              Scroll to load more
            </div>
          )}
        </main>

        <RightPanel />
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default Home;
