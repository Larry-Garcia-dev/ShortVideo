import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import Header from '../components/Header';
import { translations } from '../utils/translations';

function Home() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [likedVideos, setLikedVideos] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;

  const categories = [
    { key: 'all', label: t.home.all },
    { key: 'Gaming', label: t.home.gaming },
    { key: 'Trending', label: t.home.trending },
    { key: 'Tutorials', label: t.home.tutorials },
    { key: 'Clips', label: t.home.clips },
    { key: 'Highlights', label: t.home.highlights },
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activeCategory, videos]);

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

  const applyFilters = (query = '') => {
    let list = videos;
    if (activeCategory !== 'all') {
      list = list.filter(v => v.category === activeCategory);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(v =>
        v.title?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        (v.User?.email && v.User.email.toLowerCase().includes(q))
      );
    }
    setFilteredVideos(list);
  };

  const handleSearch = (query) => {
    applyFilters(query);
  };

  const handleShare = (e, video) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/watch/${video.id}`;
    navigator.clipboard.writeText(url);
    showToast(t.home.linkCopied);
  };

  const handleLike = async (e, video) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast(t.home.signInToLike);
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/videos/${video.id}/like`, { userId: user.id });
      setLikedVideos(prev => ({ ...prev, [video.id]: !prev[video.id] }));
      showToast(likedVideos[video.id] ? t.home.likeRemoved : t.home.liked);
    } catch (error) {
      showToast(error.response?.data?.message || t.home.alreadyLiked);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  const getCreatorName = (video) => {
    return video.User?.email?.split('@')[0] || 'creator';
  };

  const getThumbnailUrl = (video) => {
    if (video.thumbnailUrl) {
      return `http://localhost:5000/${video.thumbnailUrl.replace(/\\/g, '/')}`;
    }
    // fallback gradient placeholder
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={handleSearch} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 320px',
        height: 'calc(100vh - 60px)',
      }}>
        <Sidebar />

        {/* Main Content - Grid */}
        <main style={{ padding: '18px', overflowY: 'auto' }}>
          {/* Hero Section */}
          <section className="home-hero">
            <h1 className="home-hero-title">{t.home.title}</h1>
            <p className="home-hero-subtitle">{t.home.subtitle}</p>
            <div className="home-chips">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  className={`home-chip ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>

          {/* Video Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              {t.common.loading}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="home-empty">
              <p>{t.home.noVideos}</p>
              <Link to="/upload" className="btn primary">
                {t.home.uploadBtn}
              </Link>
            </div>
          ) : (
            <div className="home-grid">
              {filteredVideos.map((video) => (
                <Link
                  key={video.id}
                  to={`/watch/${video.id}`}
                  className="home-card"
                >
                  {/* Thumbnail */}
                  <div className="home-card-thumb">
                    {getThumbnailUrl(video) ? (
                      <img
                        src={getThumbnailUrl(video)}
                        alt={video.title || 'Video'}
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={`http://localhost:5000/${video.videoUrl.replace(/\\/g, '/')}`}
                        preload="metadata"
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <div className="home-card-play">
                      <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: '12px solid var(--text)',
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        marginLeft: '2px',
                      }} />
                    </div>
                    {/* Duration badge */}
                    <div className="home-card-duration">
                      {formatCount(video.views || 0)} {t.home.views}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="home-card-body">
                    <p className="home-card-title">{video.title || 'Untitled'}</p>
                    <div className="home-card-meta">
                      <span className="home-card-badge">@{getCreatorName(video)}</span>
                      {video.category && (
                        <span className="home-card-badge">{video.category}</span>
                      )}
                      <div className="home-card-actions">
                        <button
                          className={`home-card-action-btn ${likedVideos[video.id] ? 'liked' : ''}`}
                          onClick={(e) => handleLike(e, video)}
                          title={t.home.like}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={likedVideos[video.id] ? '#FF4D6D' : 'none'} stroke={likedVideos[video.id] ? '#FF4D6D' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          <span>{formatCount(video.Likes?.length || 0)}</span>
                        </button>
                        <button
                          className="home-card-action-btn"
                          onClick={(e) => handleShare(e, video)}
                          title={t.home.share}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        <RightPanel
          videos={filteredVideos}
          onPlayVideo={(index) => {
            const video = filteredVideos[index];
            if (video) {
              window.location.href = `/watch/${video.id}`;
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
