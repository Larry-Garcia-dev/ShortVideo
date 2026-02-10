import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { translations } from '../utils/translations';

const API = 'http://localhost:5000/api';

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function RightPanel({ videos = [], currentVideoIndex = 0 }) {
  const [topCreators, setTopCreators] = useState([]);
  const [topVideos, setTopVideos] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Fetch top creators
  const fetchCreators = useCallback(() => {
    const params = user ? `?userId=${user.id}` : '';
    axios.get(`${API}/users/top-creators${params}`)
      .then(res => setTopCreators(res.data))
      .catch(() => setTopCreators([]))
      .finally(() => setLoadingCreators(false));
  }, [user?.id]);

  // Fetch top videos
  useEffect(() => {
    axios.get(`${API}/videos`)
      .then(res => {
        const sorted = res.data.sort((a, b) => b.views - a.views).slice(0, 5);
        setTopVideos(sorted);
      })
      .catch(() => setTopVideos([]))
      .finally(() => setLoadingVideos(false));
  }, []);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  // Toggle follow
  const handleToggleFollow = async (creatorId) => {
    if (!user) {
      alert(t.home?.signInToFollow || 'Sign in to follow creators');
      return;
    }

    try {
      const res = await axios.post(`${API}/users/toggle-follow`, {
        followerId: user.id,
        followingId: creatorId
      });

      // Update local state
      setTopCreators(prev => prev.map(c => {
        if (c.id === creatorId) {
          return {
            ...c,
            isFollowing: res.data.isFollowing,
            followers: res.data.followers
          };
        }
        return c;
      }));
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const trendingHashtags = [
    { tag: '#daily', count: '2.3M' },
    { tag: '#funny', count: '1.8M' },
    { tag: '#tech', count: '945K' },
  ];

  return (
    <aside className="right-panel" role="complementary">
      {/* Trending Creators - Real data */}
      <div className="panel rp-section">
        <div className="rp-section-header">
          <span className="rp-section-title">{t.rightPanel?.trendingCreators || 'Trending Creators'}</span>
        </div>

        {loadingCreators ? (
          <div className="rp-loading">{t.common?.loading || 'Loading...'}</div>
        ) : topCreators.length === 0 ? (
          <div className="rp-empty">{t.rightPanel?.noCreators || 'No creators yet'}</div>
        ) : (
          <div className="rp-creator-list">
            {topCreators.map((creator, i) => (
              <div key={creator.id} className="rp-creator-item">
                <div className="rp-creator-rank">{i + 1}</div>
                <div className="rp-creator-avatar">
                  {creator.username?.charAt(1)?.toUpperCase() || '?'}
                </div>
                <div className="rp-creator-info">
                  <div className="rp-creator-name">{creator.username}</div>
                  <div className="rp-creator-stats">
                    <span>{formatCount(creator.followers)} {t.rightPanel?.followersLabel || 'followers'}</span>
                    <span className="rp-stat-dot" />
                    <span>{formatCount(creator.totalViews)} {t.home?.views || 'views'}</span>
                  </div>
                  <div className="rp-creator-stats-secondary">
                    <span>{formatCount(creator.totalLikes)} {t.rightPanel?.likesLabel || 'likes'}</span>
                    <span className="rp-stat-dot" />
                    <span>{creator.videoCount} {t.rightPanel?.videosLabel || 'videos'}</span>
                  </div>
                </div>
                <button
                  className={`rp-follow-btn ${creator.isFollowing ? 'following' : ''}`}
                  onClick={() => handleToggleFollow(creator.id)}
                >
                  {creator.isFollowing
                    ? (t.home?.following_btn || 'Following')
                    : (t.home?.follow || 'Follow')
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Hashtags */}
      <div className="panel rp-section">
        <div className="rp-section-header">
          <span className="rp-section-title">{t.rightPanel?.trendingHashtags || 'Trending Hashtags'}</span>
        </div>
        {trendingHashtags.map((item, i) => (
          <div key={i} className="rp-hashtag-item">
            <span className="rp-hashtag-tag">{item.tag}</span>
            <span className="rp-hashtag-count">{item.count} {t.rightPanel?.posts || 'posts'}</span>
          </div>
        ))}
      </div>

      {/* Up Next Queue */}
      <div className="panel rp-section">
        <div className="rp-section-header">
          <span className="rp-section-title">{t.rightPanel?.upNext || 'Up Next'}</span>
        </div>
        {loadingVideos ? (
          <div className="rp-loading">{t.common?.loading || 'Loading...'}</div>
        ) : topVideos.length === 0 ? (
          <div className="rp-empty">{t.rightPanel?.noQueue || 'No videos in queue'}</div>
        ) : (
          <div className="rp-queue-list">
            {topVideos.slice(0, 3).map((video, index) => (
              <div key={video.id} className="rp-queue-item">
                <div className="rp-queue-thumb">
                  {video.thumbnailUrl ? (
                    <img src={`${API.replace('/api', '')}/${video.thumbnailUrl}`} alt="" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                </div>
                <div className="rp-queue-info">
                  <div className="rp-queue-title">
                    {video.title?.slice(0, 28) || `Video ${String.fromCharCode(65 + index)}`}
                  </div>
                  <div className="rp-queue-views">
                    {formatCount(video.views)} {t.home?.views || 'views'}
                  </div>
                </div>
                <Link
                  to={`/watch/${video.id}`}
                  className="rp-play-btn"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="rp-footer">
        &copy; 2026 ShortVideo App
        <br/>
        <span style={{ opacity: 0.7 }}>Terms & Privacy</span>
      </div>
    </aside>
  );
}

export default RightPanel;
