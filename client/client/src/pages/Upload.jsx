import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { translations } from '../utils/translations';

const CATEGORIES = [
  'General',
  'Gaming',
  'Trending',
  'Tutorials',
  'Clips',
  'Highlights',
  'Music',
  'Comedy',
  'Sports',
  'Education',
];

function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const u = t.upload || {};

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast(u.selectFile || 'Please select a video file');
      return;
    }
    if (!title.trim()) {
      showToast(u.titleRequired || 'Title is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('userId', user ? user.id : 1);
    formData.append('videoFile', file);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(u.success || 'Video uploaded successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || u.errorUpload || 'Error uploading video';
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setVideoPreview(URL.createObjectURL(droppedFile));
      } else {
        showToast(u.onlyVideo || 'Please drop a video file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setVideoPreview(URL.createObjectURL(selected));
    }
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const img = e.target.files[0];
      setThumbnail(img);
      setThumbnailPreview(URL.createObjectURL(img));
    }
  };

  const removeFile = () => {
    setFile(null);
    setVideoPreview(null);
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Not logged in state
  if (!user) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
          padding: '20px',
        }}>
          <div className="panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '20px' }}>
              {u.signInRequired || 'Sign in required'}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
              {u.signInToUpload || 'You need to sign in to upload videos.'}
            </p>
            <Link to="/login" className="btn primary">
              {t.login?.signInBtn || 'Sign In'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <main className="wrap" style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 18px' }}>
        {/* Page Title */}
        <div className="upload-header">
          <h1 className="upload-title">{u.pageTitle || 'Upload Video'}</h1>
          <p className="upload-subtitle">
            {u.pageSubtitle || 'Share your content with the community. Max duration: 10 minutes.'}
          </p>
        </div>

        <form onSubmit={handleUpload}>
          {/* Two-column layout: Video + Thumbnail */}
          <div className="upload-media-row">
            {/* Video Drop Zone */}
            <div
              className={`upload-dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {file ? (
                <div className="upload-file-preview">
                  {videoPreview && (
                    <video
                      src={videoPreview}
                      className="upload-video-preview"
                      muted
                      preload="metadata"
                    />
                  )}
                  <div className="upload-file-info">
                    <span className="upload-file-name">{file.name}</span>
                    <span className="upload-file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="upload-remove-btn"
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    {u.remove || 'Remove'}
                  </button>
                </div>
              ) : (
                <div className="upload-dropzone-content">
                  <div className="upload-dropzone-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <span className="upload-dropzone-label">
                    {u.dropHere || 'Drop video here or click to browse'}
                  </span>
                  <span className="upload-dropzone-hint">
                    MP4, WebM, MOV - {u.maxSize || 'Max 500MB'}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div
              className={`upload-thumb-zone ${thumbnailPreview ? 'has-file' : ''}`}
              onClick={() => thumbInputRef.current?.click()}
            >
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleThumbnailChange}
                style={{ display: 'none' }}
              />

              {thumbnailPreview ? (
                <div className="upload-thumb-preview-wrap">
                  <img src={thumbnailPreview} alt="Thumbnail" className="upload-thumb-img" />
                  <button
                    type="button"
                    className="upload-remove-btn small"
                    onClick={(e) => { e.stopPropagation(); removeThumbnail(); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="upload-dropzone-content">
                  <div className="upload-dropzone-icon small">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <span className="upload-dropzone-label small">
                    {u.thumbnail || 'Thumbnail'}
                  </span>
                  <span className="upload-dropzone-hint">
                    JPG, PNG, WEBP
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="upload-form-section">
            {/* Title */}
            <div className="upload-field">
              <label className="upload-label">{u.titleLabel || 'Title'}</label>
              <input
                type="text"
                className="input"
                placeholder={u.titlePlaceholder || 'Enter video title'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            {/* Description */}
            <div className="upload-field">
              <label className="upload-label">{u.descriptionLabel || 'Description'}</label>
              <textarea
                className="input"
                placeholder={u.descriptionPlaceholder || 'Describe your video...'}
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="3"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Category + Tags row */}
            <div className="upload-row">
              <div className="upload-field" style={{ flex: 1 }}>
                <label className="upload-label">{u.categoryLabel || 'Category'}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="upload-field" style={{ flex: 1 }}>
                <label className="upload-label">{u.tagsLabel || 'Tags'}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={u.tagsPlaceholder || 'gaming, funny, tutorial'}
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  style={{ width: '100%' }}
                />
                <span className="upload-hint">{u.tagsHint || 'Separate tags with commas'}</span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="upload-guidelines">
            <h4 className="upload-guidelines-title">
              {u.guidelinesTitle || 'Upload Guidelines'}
            </h4>
            <ul className="upload-guidelines-list">
              <li>{u.guideline1 || 'Maximum video duration: 10 minutes'}</li>
              <li>{u.guideline2 || 'Recommended resolution: 1080p or higher'}</li>
              <li>{u.guideline3 || 'Keep content appropriate for all audiences'}</li>
              <li>{u.guideline4 || 'Add a thumbnail for better visibility'}</li>
            </ul>
          </div>

          {/* Submit Actions */}
          <div className="upload-actions">
            <button
              type="submit"
              className="btn primary"
              disabled={loading || !file}
              style={{
                flex: 1,
                padding: '14px',
                opacity: (loading || !file) ? 0.6 : 1,
              }}
            >
              {loading ? (u.uploading || 'Uploading...') : (u.publish || 'Publish Video')}
            </button>
            <Link to="/" className="btn" style={{ padding: '14px 20px' }}>
              {u.cancel || 'Cancel'}
            </Link>
          </div>
        </form>
      </main>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default Upload;
