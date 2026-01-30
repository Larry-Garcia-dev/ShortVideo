import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('likes_desc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadCampaignData();
    if (user) loadMyVideos();
  }, [id]);

  const loadCampaignData = () => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/campaigns/${id}`)
      .then(res => {
        setCampaign(res.data);
        if (res.data.Videos?.length > 0) {
          setPreviewVideo(res.data.Videos[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const loadMyVideos = () => {
    axios.get('http://localhost:5000/api/videos')
      .then(res => {
        const mine = res.data.filter(v => v.userId === user.id);
        setMyVideos(mine);
      });
  };

  const handleJoin = async () => {
    if (!selectedVideoId) {
      showToast('Select a video to join');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/campaigns/${id}/join`, {
        videoId: selectedVideoId
      });
      showToast('Successfully joined the campaign!');
      loadCampaignData();
      setSelectedVideoId('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error joining campaign');
    }
  };

  const handleLike = async (videoId) => {
    if (!user) {
      showToast('Sign in to like videos');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/videos/${videoId}/like`, { userId: user.id });
      loadCampaignData();
      showToast('Liked!');
    } catch (error) {
      showToast(error.response?.data?.message || 'Already liked');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Campaign link copied!');
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFilteredVideos = () => {
    if (!campaign?.Videos) return [];
    
    let videos = [...campaign.Videos];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      videos = videos.filter(v =>
        v.title?.toLowerCase().includes(q) ||
        v.User?.email?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'likes_desc':
        videos.sort((a, b) => (b.Likes?.length || 0) - (a.Likes?.length || 0));
        break;
      case 'likes_asc':
        videos.sort((a, b) => (a.Likes?.length || 0) - (b.Likes?.length || 0));
        break;
      case 'title_asc':
        videos.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'creator_asc':
        videos.sort((a, b) => (a.User?.email || '').localeCompare(b.User?.email || ''));
        break;
    }

    return videos;
  };

  const totalLikes = campaign?.Videos?.reduce((sum, v) => sum + (v.Likes?.length || 0), 0) || 0;
  const filteredVideos = getFilteredVideos();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          color: 'var(--muted)',
        }}>
          Loading campaign...
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 64px)',
          color: 'var(--muted)',
        }}>
          Campaign not found
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <main className="wrap" style={{ maxWidth: '1180px', margin: '0 auto', padding: '18px' }}>
        {/* Campaign Announcement */}
        <section style={{
          position: 'relative',
          padding: '20px',
          borderRadius: 'var(--r22)',
          border: '1px solid rgba(234, 240, 255, 0.14)',
          background: `
            radial-gradient(700px 400px at 20% 20%, rgba(25, 211, 255, 0.18), transparent 60%),
            radial-gradient(780px 420px at 80% 30%, rgba(124, 92, 255, 0.22), transparent 65%),
            var(--panel)
          `,
          boxShadow: 'var(--shadow)',
          marginBottom: '20px',
        }}>
          <span className="pill">Active Challenge</span>
          <h1 style={{
            margin: '12px 0 8px',
            fontSize: 'clamp(20px, 2.4vw, 28px)',
            letterSpacing: '-0.3px',
          }}>
            {campaign.name}
          </h1>
          <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '88ch', lineHeight: 1.5 }}>
            {campaign.description}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 0.7fr',
            gap: '12px',
            alignItems: 'center',
            marginTop: '16px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
              <b>How it works:</b> Like your favorite videos to push them up the leaderboard. 
              Videos are ranked by total likes. Rankings update in real-time.
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div className="kpi">
                <b>{totalLikes.toLocaleString()}</b>
                <span>Total likes</span>
              </div>
              <div className="kpi">
                <b>{campaign.Videos?.length || 0}</b>
                <span>Videos</span>
              </div>
              <div className="kpi">
                <b>{formatDate(campaign.endDate)}</b>
                <span>Ends on</span>
              </div>
            </div>
          </div>

          {/* Join Campaign */}
          {user && myVideos.length > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Join with your video:</span>
              <select
                className="input"
                value={selectedVideoId}
                onChange={e => setSelectedVideoId(e.target.value)}
                style={{ minWidth: '200px' }}
              >
                <option value="">-- Select Video --</option>
                {myVideos.map(v => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
              <button onClick={handleJoin} className="btn primary">
                Join Campaign
              </button>
            </div>
          )}
        </section>

        {/* Controls Bar */}
        <section className="panel" style={{
          padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="Search by title, creator..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ minWidth: '220px' }}
            />
            <select
              className="input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="likes_desc">Sort: Likes (high to low)</option>
              <option value="likes_asc">Sort: Likes (low to high)</option>
              <option value="title_asc">Sort: Title (A to Z)</option>
              <option value="creator_asc">Sort: Creator (A to Z)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: '12px' }}>Click a row to preview</span>
            <button onClick={handleShare} className="btn primary">Share campaign</button>
          </div>
        </section>

        {/* Leaderboard + Preview Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          alignItems: 'start',
        }}>
          {/* Leaderboard */}
          <div className="panel" style={{ padding: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <div>
                <div style={{ fontWeight: 900, letterSpacing: '-0.2px' }}>Leaderboard</div>
                <div className="muted" style={{ fontSize: '12px' }}>
                  {filteredVideos.length} videos shown • ranked by likes
                </div>
              </div>
              <span className="pill">
                <span className="dot"></span>
                Updated live
              </span>
            </div>

            {filteredVideos.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
                No videos in this campaign yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredVideos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => setPreviewVideo(video)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '54px 1fr auto',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '18px',
                      border: previewVideo?.id === video.id 
                        ? '1px solid rgba(124, 92, 255, 0.4)' 
                        : '1px solid var(--line)',
                      background: previewVideo?.id === video.id 
                        ? 'rgba(124, 92, 255, 0.08)' 
                        : 'var(--panel)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div className="rank" style={{
                      background: index < 3 
                        ? 'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(25,211,255,0.2))' 
                        : 'rgba(124,92,255,0.18)',
                    }}>
                      #{index + 1}
                    </div>
                    <div>
                      <div style={{
                        height: '44px',
                        borderRadius: '12px',
                        background: `
                          radial-gradient(220px 120px at 20% 20%, rgba(25,211,255,.18), transparent 60%),
                          radial-gradient(240px 140px at 80% 30%, rgba(124,92,255,.22), transparent 65%),
                          rgba(0,0,0,.22)
                        `,
                        border: '1px solid var(--line)',
                        marginBottom: '8px',
                      }}></div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 900, letterSpacing: '-0.1px' }}>
                        {video.title}
                      </p>
                      <div style={{ 
                        marginTop: '6px', 
                        fontSize: '12px', 
                        color: 'var(--muted)',
                        display: 'flex',
                        gap: '8px',
                      }}>
                        <span className="chip">{video.User?.email || 'User'}</span>
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end', 
                      gap: '6px',
                      minWidth: '90px',
                    }}>
                      <span style={{ fontWeight: 900 }} className="count">
                        {(video.Likes?.length || 0).toLocaleString()} likes
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(video.id); }}
                        className="miniBtn"
                      >
                        Like
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <aside className="panel" style={{ padding: '14px' }}>
            {previewVideo ? (
              <>
                <div className="player" style={{ aspectRatio: '16/9', marginBottom: '14px' }}>
                  <video
                    controls
                    src={`http://localhost:5000/${previewVideo.videoUrl?.replace(/\\/g, '/')}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '2px' }}>
                  <h2 style={{ margin: '0 0 6px', fontSize: '16px' }}>{previewVideo.title}</h2>
                  <p className="muted" style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                    By {previewVideo.User?.email || 'User'} • {previewVideo.views || 0} views
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                    <button onClick={() => handleLike(previewVideo.id)} className="btn primary">
                      Like
                    </button>
                    <Link to={`/watch/${previewVideo.id}`} className="btn">
                      Watch full video
                    </Link>
                  </div>
                  <div className="muted" style={{ fontSize: '12px', marginTop: '12px' }}>
                    {(previewVideo.Likes?.length || 0).toLocaleString()} likes • {previewVideo.description}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '300px',
                color: 'var(--muted)',
              }}>
                Select a video to preview
              </div>
            )}
          </aside>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '24px 0 10px',
          color: 'var(--muted)',
          fontSize: '12px',
          textAlign: 'center',
        }}>
          © {new Date().getFullYear()} ShortVideo — Campaign page
        </footer>
      </main>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default CampaignDetail;
