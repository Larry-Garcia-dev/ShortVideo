import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { translations } from '../utils/translations';

const API = 'http://localhost:5000/api';

function MyVideos() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const mv = t.myVideos || {};

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editThumbFile, setEditThumbFile] = useState(null);
  const [editThumbPreview, setEditThumbPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const thumbRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (!user) return;
    axios.get(`${API}/videos`)
      .then(res => {
        const mine = res.data.filter(v => v.userId === user.id);
        setVideos(mine);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>{mv.signInRequired || 'Sign in required'}</h2>
          <button className="btn primary" onClick={() => navigate('/login')} style={{ marginTop: '12px' }}>
            {t.header.login}
          </button>
        </div>
      </div>
    );
  }

  const startEdit = (video) => {
    setEditingId(video.id);
    setEditTitle(video.title);
    setEditDesc(video.description || '');
    setEditThumbFile(null);
    setEditThumbPreview(video.thumbnailUrl ? (video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `http://localhost:5000${video.thumbnailUrl}`) : null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
    setEditThumbFile(null);
    setEditThumbPreview(null);
  };

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast(mv.onlyImage || 'Only image files'); return; }
    setEditThumbFile(file);
    setEditThumbPreview(URL.createObjectURL(file));
  };

  const handleSave = async (videoId) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDesc);
      if (editThumbFile) formData.append('thumbnail', editThumbFile);

      const res = await axios.put(`${API}/videos/${videoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, ...res.data.video || res.data, title: editTitle, description: editDesc, ...(editThumbPreview && !editThumbFile ? {} : {}) } : v));
      cancelEdit();
      showToast(mv.saved || 'Video saved');
    } catch (err) {
      showToast(err.response?.data?.message || mv.errorSaving || 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(p => !p)} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{ padding: '18px', overflowY: 'auto', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontWeight: 850, fontSize: '22px', marginBottom: '4px' }}>{mv.title || 'My Videos'}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
            {mv.subtitle || 'Manage, edit, and update your uploaded videos.'}
          </p>

          {loading ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>{t.common?.loading || 'Loading...'}</p>
          ) : videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--muted)', marginBottom: '12px' }}>{mv.noVideos || 'You have no videos yet.'}</p>
              <Link to="/upload" className="btn primary" style={{ padding: '10px 20px' }}>
                {t.home?.uploadBtn || 'Upload Video'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {videos.map(video => {
                const isEditing = editingId === video.id;
                const thumbUrl = video.thumbnailUrl
                  ? (video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `http://localhost:5000${video.thumbnailUrl}`)
                  : null;

                return (
                  <div key={video.id} style={{
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r18)',
                    background: 'var(--panel)',
                    overflow: 'hidden',
                  }}>
                    {/* Card header: thumbnail + info */}
                    <div style={{ display: 'flex', gap: '14px', padding: '14px', flexWrap: 'wrap' }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: '160px', minHeight: '90px', borderRadius: '12px',
                        background: 'rgba(0,0,0,0.3)', overflow: 'hidden',
                        flexShrink: 0, position: 'relative',
                      }}>
                        {isEditing ? (
                          <div
                            onClick={() => thumbRef.current?.click()}
                            style={{
                              width: '100%', height: '100%', minHeight: '90px',
                              cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              background: editThumbPreview ? 'transparent' : 'rgba(0,0,0,0.3)',
                            }}
                          >
                            {editThumbPreview ? (
                              <img src={editThumbPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                            ) : (
                              <span style={{ color: 'var(--muted)', fontSize: '11px', textAlign: 'center', padding: '8px' }}>
                                {mv.clickToChangeThumbnail || 'Click to change thumbnail'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Link to={`/watch/${video.id}`}>
                            {thumbUrl ? (
                              <img src={thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                            ) : (
                              <div style={{ width: '100%', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              </div>
                            )}
                          </Link>
                        )}
                        {/* Duration badge */}
                        {!isEditing && (
                          <span style={{
                            position: 'absolute', bottom: '6px', right: '6px',
                            background: 'rgba(0,0,0,0.7)', borderRadius: '6px',
                            padding: '2px 6px', fontSize: '10px', fontWeight: 700,
                            color: 'white', fontVariantNumeric: 'tabular-nums',
                          }}>
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {isEditing ? (
                          <>
                            <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder={mv.titlePlaceholder || 'Title'} style={{ fontSize: '13px', fontWeight: 700 }}/>
                            <textarea className="input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder={mv.descPlaceholder || 'Description'} rows={3} style={{ fontSize: '12px', resize: 'vertical' }}/>
                            <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumbChange} style={{ display: 'none' }}/>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {video.title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {video.description || (mv.noDescription || 'No description')}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--muted)', marginTop: 'auto' }}>
                              <span>{video.views || 0} {t.home?.views || 'views'}</span>
                              <span>{video.Likes?.length || 0} {t.rightPanel?.likesLabel || 'likes'}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card actions */}
                    <div style={{
                      display: 'flex', gap: '8px', padding: '0 14px 14px', flexWrap: 'wrap',
                    }}>
                      {isEditing ? (
                        <>
                          <button className="btn primary" onClick={() => handleSave(video.id)} disabled={saving} style={{ fontSize: '12px', padding: '7px 14px' }}>
                            {saving ? (mv.saving || 'Saving...') : (mv.saveBtn || 'Save')}
                          </button>
                          <button className="btn ghost" onClick={cancelEdit} style={{ fontSize: '12px', padding: '7px 14px' }}>
                            {t.upload?.cancel || 'Cancel'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn ghost" onClick={() => startEdit(video)} style={{ fontSize: '12px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            {mv.editBtn || 'Edit'}
                          </button>
                          <Link to={`/watch/${video.id}`} className="btn ghost" style={{ fontSize: '12px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            {mv.watchBtn || 'Watch'}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {toast && <div className="toast show">{toast}</div>}
    </>
  );
}

export default MyVideos;
