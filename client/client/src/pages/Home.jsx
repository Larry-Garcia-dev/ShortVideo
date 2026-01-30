import { useState, useEffect, useRef } from 'react';
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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
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
    setCurrentVideoIndex(0);
  };

  const handleShare = () => {
    const currentVideo = filteredVideos[currentVideoIndex];
    if (!currentVideo) return;
    const url = `${window.location.origin}/watch/${currentVideo.id}`;
    navigator.clipboard.writeText(url);
    showToast('🔗 Link copied to clipboard!');
  };

  const handleLike = async () => {
    const currentVideo = filteredVideos[currentVideoIndex];
    if (!currentVideo) return;
    
    if (!user) {
      showToast('🔒 Sign in to like videos');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/videos/${currentVideo.id}/like`, { userId: user.id });
      loadVideos();
      showToast('❤️ Liked!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Already liked');
    }
  };

  const handleNext = () => {
    if (currentVideoIndex < filteredVideos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const formatCount = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  const currentVideo = filteredVideos[currentVideoIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={handleSearch} />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        
        {/* Main Content */}
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            fontWeight: 600,
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

          {/* Video Feed - Full screen video layout */}
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
                📤 Upload Video
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              maxWidth: '900px',
            }}>
              {/* Video Player Area */}
              <div 
                className="panel"
                style={{
                  aspectRatio: '9/16',
                  maxHeight: 'calc(100vh - 180px)',
                  position: 'relative',
                  cursor: 'pointer',
                  background: 'rgba(0,0,0,0.4)',
                }}
                onClick={togglePlay}
              >
                {/* Video Label */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  zIndex: 10,
                }}>
                  Video {currentVideoIndex + 1}
                </div>

                {currentVideo ? (
                  <>
                    <video
                      ref={videoRef}
                      src={`http://localhost:5000/${currentVideo.videoUrl.replace(/\\/g, '/')}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '22px',
                      }}
                      preload="metadata"
                      onEnded={() => setIsPlaying(false)}
                    />
                    
                    {/* Play Button Overlay */}
                    {!isPlaying && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}>
                        <span style={{ fontSize: '32px', marginLeft: '4px' }}>▶</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--muted)',
                  }}>
                    No video selected
                  </div>
                )}
              </div>

              {/* Video Info Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentVideo && (
                  <>
                    {/* Creator Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>
                        @{currentVideo.User?.email?.split('@')[0] || 'creator_name'}
                      </span>
                      <span style={{ color: 'var(--muted)', fontSize: '14px' }}>•</span>
                      <span style={{ color: 'var(--muted)', fontSize: '14px' }}>
                        {formatCount(currentVideo.views || 10000)} views
                      </span>
                    </div>

                    {/* Caption */}
                    <p style={{ 
                      margin: 0, 
                      color: 'var(--muted)', 
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}>
                      {currentVideo.description || 'Wireframe caption for video #1. Desktop feed card with player + metadata.'}
                    </p>

                    {/* Hashtags */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--brand2)', fontSize: '14px' }}>#hashtag</span>
                      <span style={{ color: 'var(--brand2)', fontSize: '14px' }}>#trend</span>
                      <span style={{ color: 'var(--brand2)', fontSize: '14px' }}>#music</span>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--muted)' }}>
                      <span>❤️ {formatCount(currentVideo.Likes?.length || 1000)}</span>
                      <span>💬 {currentVideo.Comments?.length || 100}</span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleLike(); }} 
                        className="btn"
                        style={{ fontSize: '13px', padding: '10px 16px' }}
                      >
                        ❤️ Like
                      </button>
                      <Link 
                        to={`/watch/${currentVideo.id}`} 
                        className="btn" 
                        style={{ fontSize: '13px', padding: '10px 16px' }}
                      >
                        💬 Comment
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(); }} 
                        className="btn"
                        style={{ fontSize: '13px', padding: '10px 16px' }}
                      >
                        📤 Share
                      </button>
                      <button 
                        className="btn"
                        style={{ fontSize: '13px', padding: '10px 16px' }}
                      >
                        ➕ Follow
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="btn primary"
                        style={{ fontSize: '13px', padding: '10px 16px' }}
                        disabled={currentVideoIndex >= filteredVideos.length - 1}
                      >
                        Next ▶️
                      </button>
                    </div>

                    {/* Navigation hint */}
                    <div style={{ 
                      marginTop: '16px', 
                      fontSize: '12px', 
                      color: 'var(--muted)',
                    }}>
                      Video {currentVideoIndex + 1} of {filteredVideos.length}
                      {currentVideoIndex > 0 && (
                        <button 
                          onClick={handlePrevious}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--brand2)',
                            cursor: 'pointer',
                            marginLeft: '10px',
                            fontSize: '12px',
                          }}
                        >
                          ◀️ Previous
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>

        <RightPanel 
          videos={filteredVideos} 
          currentVideoIndex={currentVideoIndex}
          onPlayVideo={(index) => setCurrentVideoIndex(index)}
        />
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default Home;
