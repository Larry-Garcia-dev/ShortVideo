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
  const [trendingHashtags, setTrendingHashtags] = useState([]);
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

  // Fetch top 10 videos + extract real hashtags from descriptions
  useEffect(() => {
    axios.get(`${API}/videos`)
      .then(res => {
        const allVideos = res.data;

        // Top 10 by views
        const sorted = [...allVideos].sort((a, b) => b.views - a.views).slice(0, 10);
        setTopVideos(sorted);

        // Extract real hashtags from all video descriptions
        const hashtagMap = {};
        allVideos.forEach(video => {
          const desc = video.description || '';
          const tags = desc.match(/#\w+/g) || [];
          tags.forEach(tag => {
            const lower = tag.toLowerCase();
            if (!hashtagMap[lower]) {
              hashtagMap[lower] = { tag: lower, count: 0 };
            }
            hashtagMap[lower].count += 1;
          });
          // Also count tags/category as hashtags
          if (video.tags) {
            const tagList = video.tags.split(',').map(t => t.trim()).filter(Boolean);
            tagList.forEach(tagStr => {
              const ht = `#${tagStr.toLowerCase().replace(/^#/, '')}`;
              if (!hashtagMap[ht]) {
                hashtagMap[ht] = { tag: ht, count: 0 };
              }
              hashtagMap[ht].count += 1;
            });
          }
        });
        const sortedTags = Object.values(hashtagMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setTrendingHashtags(sortedTags);
      })
      .catch(() => {
        setTopVideos([]);
        setTrendingHashtags([]);
      })
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

  return (
    <aside className="right-panel" role="complementary">
      {/* 1. Up Next - Top 10 most viewed */}
      <div className="panel rp-section">
        <div className="rp-section-header">
          <span className="rp-section-title">{t.rightPanel?.upNext || 'Up Next'}</span>
          <span className="rp-section-badge">{t.rightPanel?.top10 || 'Top 10'}</span>
        </div>
        {loadingVideos ? (
          <div className="rp-loading">{t.common?.loading || 'Loading...'}</div>
        ) : topVideos.length === 0 ? (
          <div className="rp-empty">{t.rightPanel?.noQueue || 'No videos in queue'}</div>
        ) : (
          <div className="rp-queue-list">
            {topVideos.map((video, index) => (
              <Link key={video.id} to={`/watch/${video.id}`} className="rp-queue-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="rp-queue-rank">{index + 1}</div>
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
                    {video.title?.slice(0, 30) || `Video ${index + 1}`}
                  </div>
                  <div className="rp-queue-views">
                    {formatCount(video.views)} {t.home?.views || 'views'}
                    <span className="rp-stat-dot" />
                    {formatCount(video.Likes?.length || 0)} {t.rightPanel?.likesLabel || 'likes'}
                  </div>
                </div>
                <div className="rp-play-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 2. Trending Hashtags - real data from descriptions */}
      <div className="panel rp-section">
        <div className="rp-section-header">
          <span className="rp-section-title">{t.rightPanel?.trendingHashtags || 'Trending Hashtags'}</span>
        </div>
        {loadingVideos ? (
          <div className="rp-loading">{t.common?.loading || 'Loading...'}</div>
        ) : trendingHashtags.length === 0 ? (
          <div className="rp-empty">{t.rightPanel?.noHashtags || 'No hashtags yet'}</div>
        ) : (
          trendingHashtags.map((item, i) => (
            <div key={i} className="rp-hashtag-item">
              <span className="rp-hashtag-tag">{item.tag}</span>
              <span className="rp-hashtag-count">{formatCount(item.count)} {t.rightPanel?.posts || 'posts'}</span>
            </div>
          ))
        )}
      </div>

      {/* 3. Trending Creators */}
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
