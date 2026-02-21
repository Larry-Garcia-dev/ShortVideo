import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import Header from '../components/Header';
import ShareModal from '../components/ShareModal';
import { translations } from '../utils/translations';

const ROTATE_MS = 6000;
const ENDING_SOON_DAYS = 3; // campaigns ending within 3 days get special color

function Home() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [likedVideos, setLikedVideos] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareModal, setShareModal] = useState({ open: false, url: '', title: '' });

  // Announcements: open by default, user can close
  const [announceOpen, setAnnounceOpen] = useState(true);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [campaignAnnouncements, setCampaignAnnouncements] = useState([]);

  // Announcement rotation
  const [annIdx, setAnnIdx] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const ann = t.campaignAnnounce || {};

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
    loadCampaignAnnouncements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activeCategory, videos]);

  /* ── Load campaigns and build announcements ── */
  const loadCampaignAnnouncements = () => {
    axios.get('http://localhost:5000/api/campaigns')
      .then(res => {
        const now = new Date();
        const active = (res.data || []).filter(c => {
          const end = new Date(c.endDate);
          return c.status === 'Active' && end >= now;
        });

        if (!active.length) return;

        const items = [];
        const sorted = [...active].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Most recent campaign
        if (sorted[0]) {
          items.push({ ...sorted[0], type: 'new' });
        }

        // Ending soon (within ENDING_SOON_DAYS)
        const ending = active
          .filter(c => {
            const daysLeft = (new Date(c.endDate) - now) / (1000 * 60 * 60 * 24);
            return daysLeft <= ENDING_SOON_DAYS && daysLeft >= 0;
          })
          .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        ending.forEach(c => {
          if (!items.find(i => i.id === c.id)) {
            items.push({ ...c, type: 'ending' });
          } else {
            // Mark existing entry as also ending
            const idx = items.findIndex(i => i.id === c.id);
            if (idx !== -1) items[idx].type = 'ending';
          }
        });

        // Popular: campaigns with Videos array (most videos joined)
        // We don't have video count from the list endpoint, so just pick oldest active as "popular" if we have 2+
        if (sorted.length >= 2) {
          const popular = sorted[sorted.length - 1]; // oldest active = has been around longest = likely most popular
          if (!items.find(i => i.id === popular.id)) {
            items.push({ ...popular, type: 'popular' });
          }
        }

        // Add remaining campaigns as 'new' type
        active.forEach(c => {
          if (!items.find(i => i.id === c.id)) {
            items.push({ ...c, type: 'new' });
          }
        });

        setCampaignAnnouncements(items);
      })
      .catch(err => console.error('Error loading campaign announcements:', err));
  };

  /* ── Announcement rotation ── */
  const totalAnn = campaignAnnouncements.length;

  const startProgress = useCallback(() => {
    if (!progressRef.current || totalAnn === 0) return;
    progressRef.current.style.transition = 'none';
    progressRef.current.style.width = '0%';
    requestAnimationFrame(() => {
      if (!progressRef.current) return;
      progressRef.current.style.transition = `width ${ROTATE_MS}ms linear`;
      progressRef.current.style.width = '100%';
    });
  }, [totalAnn]);

  useEffect(() => {
    if (!announceOpen || totalAnn === 0) { clearInterval(timerRef.current); return; }
    startProgress();
    timerRef.current = setInterval(() => {
      setAnnIdx(prev => (prev + 1) % totalAnn);
      startProgress();
    }, ROTATE_MS);
    return () => clearInterval(timerRef.current);
  }, [announceOpen, startProgress, totalAnn]);

  const setAnn = (i) => {
    if (totalAnn === 0) return;
    setAnnIdx(((i % totalAnn) + totalAnn) % totalAnn);
    clearInterval(timerRef.current);
    startProgress();
    timerRef.current = setInterval(() => {
      setAnnIdx(prev => (prev + 1) % totalAnn);
      startProgress();
    }, ROTATE_MS);
  };

  const getDaysLeft = (endDate) => {
    const ms = new Date(endDate) - new Date();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(lang === 'es' ? 'es-ES' : lang === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const loadVideos = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/videos')
      .then(response => {
        const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setVideos(sorted);
        setFilteredVideos(sorted);

        // Initialize liked state from existing likes for the current user
        if (user) {
          const liked = {};
          sorted.forEach(v => {
            if (v.Likes && v.Likes.some(l => l.userId === user.id)) {
              liked[v.id] = true;
            }
          });
          setLikedVideos(liked);
        }
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
    setShareModal({ open: true, url, title: video.title || '' });
  };

  const handleLike = async (e, video) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast(t.home.signInToLike);
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/videos/${video.id}/toggle-like`, { userId: user.id });
      const nowLiked = res.data?.liked ?? !likedVideos[video.id];
      setLikedVideos(prev => ({ ...prev, [video.id]: nowLiked }));

      // Update the like count in real-time
      const updateList = (list) => list.map(v => {
        if (v.id === video.id) {
          const currentCount = v.Likes?.length || 0;
          const newCount = nowLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
          return { ...v, Likes: Array(newCount).fill({}) };
        }
        return v;
      });

      setVideos(prev => updateList(prev));
      setFilteredVideos(prev => updateList(prev));

      showToast(nowLiked ? t.home.liked : t.home.likeRemoved);
    } catch (error) {
      showToast(error.response?.data?.message || t.home.errorLike || 'Error');
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
      <Header onSearch={handleSearch} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content - Grid */}
        <main style={{ padding: '18px', overflowY: 'auto' }}>

          {/* Toggle row: Explore Videos + re-open announcements if closed */}
          <div className="home-toggle-row">
            {!announceOpen && totalAnn > 0 && (
              <button
                className="home-toggle-btn"
                onClick={() => setAnnounceOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {ann.title || 'Campaigns'}
                <span className="home-toggle-badge">{totalAnn}</span>
              </button>
            )}

            {/* Explore Videos toggle */}
            <button
              className={`home-toggle-btn ${exploreOpen ? 'open' : ''}`}
              onClick={() => setExploreOpen(prev => !prev)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {t.home.title}
              <svg className={`home-toggle-chevron ${exploreOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          {/* Campaign announcements -- open by default, closable */}
          {announceOpen && totalAnn > 0 && (() => {
            const camp = campaignAnnouncements[annIdx];
            if (!camp) return null;
            const daysLeft = getDaysLeft(camp.endDate);
            const typeClass = camp.type === 'ending' ? 'ending-soon' : camp.type === 'popular' ? 'popular' : '';
            const tagLabel = camp.type === 'ending'
              ? (ann.tagEnding || 'Ending soon')
              : camp.type === 'popular'
                ? (ann.tagPopular || 'Top campaign')
                : (ann.tagNew || 'New campaign');
            const tagClass = camp.type === 'ending' ? 'ending' : camp.type === 'popular' ? 'popular' : 'new';

            return (
              <section className={`home-announce ${typeClass}`}>
                <div className="home-announce-header">
                  <span className={`home-announce-tag ${tagClass}`}>
                    {camp.type === 'ending' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    )}
                    {camp.type === 'popular' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    )}
                    {camp.type === 'new' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    )}
                    {tagLabel}
                  </span>
                  <button className="home-announce-close" onClick={() => setAnnounceOpen(false)} aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div className="home-announce-body">
                  <p className="home-announce-name">{camp.name}</p>
                  {camp.description && (
                    <p className="home-announce-desc">{camp.description}</p>
                  )}

                  <div className="home-announce-dates">
                    <span>{ann.starts || 'Starts'}: <strong>{formatDate(camp.startDate)}</strong></span>
                    <span>{'|'}</span>
                    <span>{ann.ends || 'Ends'}: <strong>{formatDate(camp.endDate)}</strong></span>
                    {camp.type === 'ending' && (
                      <span className="ending-warn">
                        {daysLeft <= 0
                          ? (ann.endsToday || 'Ends today!')
                          : daysLeft === 1
                            ? (ann.endsTomorrow || 'Ends tomorrow!')
                            : `${daysLeft} ${ann.daysLeft || 'days left'}`
                        }
                      </span>
                    )}
                  </div>

                  <div className="home-announce-cta">
                    <Link to={`/campaign/${camp.id}`}>
                      {ann.viewCampaign || 'View campaign'}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  </div>

                  <div className="home-announce-controls">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="iconBtn" onClick={() => setAnn(annIdx - 1)} aria-label="Previous">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <button className="iconBtn" onClick={() => setAnn(annIdx + 1)} aria-label="Next">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>
                    <div className="home-announce-dots">
                      {campaignAnnouncements.map((c, i) => (
                        <button
                          key={c.id + '-' + i}
                          className={`home-announce-dot ${i === annIdx ? `active ${c.type === 'ending' ? 'ending' : c.type === 'popular' ? 'popular' : ''}` : ''}`}
                          onClick={() => setAnn(i)}
                          aria-label={`Campaign ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="home-announce-progress">
                    <div className={`home-announce-progress-fill ${camp.type === 'ending' ? 'ending' : camp.type === 'popular' ? 'popular' : ''}`} ref={progressRef} />
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Explore Videos section (collapsible) */}
          {exploreOpen && (
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
          )}

          {/* Always-visible category chips */}
          {!exploreOpen && (
            <div className="home-chips" style={{ marginBottom: '14px' }}>
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
          )}

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

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.open}
        onClose={() => setShareModal({ open: false, url: '', title: '' })}
        url={shareModal.url}
        title={shareModal.title}
      />

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default Home;
