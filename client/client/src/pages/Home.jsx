import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [likedVideos, setLikedVideos] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [pausedVideos, setPausedVideos] = useState({});
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const videoRefs = useRef({});
  const feedRef = useRef(null);
  const loadMoreRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadVideos();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          // In a real app, you would load more videos here
          // For now, we just show all videos
        }
      },
      { threshold: 0.2 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

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

  const handleShare = (video) => {
    const url = `${window.location.origin}/watch/${video.id}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!');
  };

  const handleLike = async (video) => {
    if (!user) {
      showToast('Sign in to like videos');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/videos/${video.id}/like`, { userId: user.id });
      setLikedVideos(prev => ({ ...prev, [video.id]: !prev[video.id] }));
      showToast(likedVideos[video.id] ? 'Like removed' : 'Liked!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Already liked');
    }
  };

  const handleFollow = (userId) => {
    if (!user) {
      showToast('Sign in to follow creators');
      return;
    }
    setFollowedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
    showToast(followedUsers[userId] ? 'Unfollowed' : 'Following!');
  };

  const toggleVideoPlay = (videoId) => {
    const videoEl = videoRefs.current[videoId];
    if (!videoEl) return;

    // Pause all other videos first
    Object.keys(videoRefs.current).forEach(id => {
      if (id !== videoId && videoRefs.current[id]) {
        videoRefs.current[id].pause();
      }
    });

    if (playingVideoId === videoId) {
      videoEl.pause();
      setPlayingVideoId(null);
      setPausedVideos(prev => ({ ...prev, [videoId]: true }));
    } else {
      videoEl.play();
      setPlayingVideoId(videoId);
      setPausedVideos(prev => ({ ...prev, [videoId]: false }));
    }
  };

  const scrollToNext = (currentIndex) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < filteredVideos.length) {
      const nextVideo = filteredVideos[nextIndex];
      const nextCard = document.getElementById(`video-card-${nextVideo.id}`);
      if (nextCard) {
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const formatCount = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count || 0;
  };

  const getCreatorName = (video) => {
    return video.User?.email?.split('@')[0] || 'creator_name';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={handleSearch} />
      
      <div className="layout" style={{ 
        display: 'grid', 
        gridTemplateColumns: '220px 1fr 320px', 
        height: 'calc(100vh - 64px)' 
      }}>
        <Sidebar />
        
        {/* Main Feed */}
        <main ref={feedRef} style={{ padding: '20px', overflowY: 'auto' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '16px',
            fontWeight: 600,
            position: 'sticky',
            top: 0,
            background: 'var(--bg)',
            paddingTop: '4px',
            zIndex: 5,
          }}>
            <button
              onClick={() => setActiveTab('foryou')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'foryou' ? 'var(--text)' : 'var(--muted)',
                cursor: 'pointer',
                paddingBottom: '6px',
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
                paddingBottom: '6px',
                borderBottom: activeTab === 'following' ? '2px solid var(--text)' : '2px solid transparent',
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              Following
            </button>
          </div>

          {/* Video Feed */}
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
            <div className="feed" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredVideos.map((video, index) => (
                <article
                  key={video.id}
                  id={`video-card-${video.id}`}
                  className="video-card"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '540px 1fr',
                    gap: '20px',
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: '14px',
                    padding: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,.35)',
                  }}
                >
                  {/* Video Player */}
                  <div
                    onClick={() => toggleVideoPlay(video.id)}
                    style={{
                      background: 'linear-gradient(135deg, #1d202a, #141720)',
                      borderRadius: '12px',
                      height: '720px',
                      display: 'grid',
                      placeItems: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      filter: pausedVideos[video.id] ? 'grayscale(1) brightness(0.9)' : 'none',
                    }}
                  >
                    {/* Corner Pill */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.8)',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '6px 10px',
                      borderRadius: '999px',
                      backdropFilter: 'blur(6px)',
                      zIndex: 2,
                    }}>
                      {pausedVideos[video.id] ? 'Paused' : `Video ${index + 1}`}
                    </div>

                    <video
                      ref={(el) => videoRefs.current[video.id] = el}
                      src={`http://localhost:5000/${video.videoUrl.replace(/\\/g, '/')}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px',
                      }}
                      preload="metadata"
                      onEnded={() => {
                        setPlayingVideoId(null);
                        setPausedVideos(prev => ({ ...prev, [video.id]: true }));
                      }}
                    />

                    {/* Play Button Overlay */}
                    {playingVideoId !== video.id && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.4)',
                        display: 'grid',
                        placeItems: 'center',
                        background: 'rgba(0,0,0,0.2)',
                      }}>
                        <div style={{
                          width: 0,
                          height: 0,
                          borderLeft: '18px solid white',
                          borderTop: '12px solid transparent',
                          borderBottom: '12px solid transparent',
                          marginLeft: '6px',
                        }} />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Creator Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800, fontSize: '16px' }}>
                        @{getCreatorName(video)}
                      </div>
                      <div style={{ color: 'var(--muted)' }}>•</div>
                      <div style={{ color: 'var(--muted)' }}>
                        {formatCount(video.views || 10000)} views
                      </div>
                    </div>

                    {/* Caption */}
                    <div style={{ color: 'var(--muted)', lineHeight: 1.4 }}>
                      {video.description || `Wireframe caption for video #${index + 1}. Desktop feed card with player + metadata.`}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#c6c9d2' }}>#hashtag</span>
                      <span style={{ fontSize: '13px', color: '#c6c9d2' }}>#trend</span>
                      <span style={{ fontSize: '13px', color: '#c6c9d2' }}>#music</span>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '14px', color: 'var(--muted)', fontSize: '13px', marginTop: '2px' }}>
                      <div>
                        <span style={{ marginRight: '4px' }}>❤️</span>
                        <span>{formatCount(video.Likes?.length || 1000)}</span>
                      </div>
                      <div>
                        <span style={{ marginRight: '4px' }}>💬</span>
                        <span>{video.Comments?.length || 100}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <button
                        onClick={() => handleLike(video)}
                        className="action-btn"
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          background: '#1a1d26',
                          cursor: 'pointer',
                          fontWeight: 650,
                          color: 'var(--text)',
                          borderColor: likedVideos[video.id] ? 'rgba(255,255,255,0.22)' : 'var(--line)',
                        }}
                      >
                        {likedVideos[video.id] ? '💖 Liked' : '❤️ Like'}
                      </button>
                      <Link
                        to={`/watch/${video.id}`}
                        className="action-btn"
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          background: '#1a1d26',
                          cursor: 'pointer',
                          fontWeight: 650,
                          color: 'var(--text)',
                          textDecoration: 'none',
                        }}
                      >
                        💬 Comment
                      </Link>
                      <button
                        onClick={() => handleShare(video)}
                        className="action-btn"
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          background: '#1a1d26',
                          cursor: 'pointer',
                          fontWeight: 650,
                          color: 'var(--text)',
                        }}
                      >
                        🔄 Share
                      </button>
                      <button
                        onClick={() => handleFollow(video.userId)}
                        className="action-btn"
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          background: '#1a1d26',
                          cursor: 'pointer',
                          fontWeight: 650,
                          color: 'var(--text)',
                        }}
                      >
                        {followedUsers[video.userId] ? 'Following' : '➕ Follow'}
                      </button>
                      <button
                        onClick={() => scrollToNext(index)}
                        className="action-btn small"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          background: '#1a1d26',
                          cursor: 'pointer',
                          fontWeight: 650,
                          color: 'var(--text)',
                          fontSize: '13px',
                        }}
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {/* Load More Status */}
              <div
                ref={loadMoreRef}
                style={{
                  textAlign: 'center',
                  fontSize: '13px',
                  padding: '14px 0',
                  color: 'var(--muted)',
                }}
              >
                {loading ? 'Loading more...' : 'Scroll to load more'}
              </div>
            </div>
          )}
        </main>

        <RightPanel 
          videos={filteredVideos} 
          onPlayVideo={(index) => {
            const video = filteredVideos[index];
            if (video) {
              const card = document.getElementById(`video-card-${video.id}`);
              if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }}
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
