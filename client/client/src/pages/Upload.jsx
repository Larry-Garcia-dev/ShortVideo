import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a video file');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userId', user ? user.id : 1);
    formData.append('videoFile', file);

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Video uploaded successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error uploading video';
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
      } else {
        showToast('Please drop a video file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
            <h2 style={{ margin: '0 0 12px', fontSize: '20px' }}>Sign in required</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
              You need to sign in to upload videos.
            </p>
            <Link to="/login" className="btn primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <main className="wrap" style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 18px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800 }}>
            Upload Video
          </h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Share your content with the community. Max duration: 10 minutes.
          </p>
        </div>

        <form onSubmit={handleUpload}>
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--brand)' : 'var(--line)'}`,
              borderRadius: 'var(--r22)',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(124, 92, 255, 0.05)' : 'var(--panel)',
              transition: 'all 0.2s ease',
              marginBottom: '20px',
            }}
          >
            <input
              id="fileInput"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {file ? (
              <div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--brand), var(--brand2))',
                  margin: '0 auto 16px',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '24px',
                }}>
                  V
                </div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{file.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                  {formatFileSize(file.size)}
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: '12px' }}
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'var(--panel2)',
                  border: '1px solid var(--line)',
                  margin: '0 auto 16px',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '24px',
                  color: 'var(--muted)',
                }}>
                  +
                </div>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Drop video here or click to browse
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                  Supported formats: MP4, WebM, MOV
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="panel" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}>
                Title
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter video title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}>
                Description
              </label>
              <textarea
                className="input"
                placeholder="Describe your video..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="4"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Guidelines */}
          <div className="card" style={{
            marginBottom: '20px',
            background: 'rgba(124, 92, 255, 0.05)',
            borderColor: 'rgba(124, 92, 255, 0.2)',
          }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700 }}>
              Upload Guidelines
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: '18px',
              color: 'var(--muted)',
              fontSize: '13px',
              lineHeight: 1.6,
            }}>
              <li>Maximum video duration: 10 minutes</li>
              <li>Recommended resolution: 1080p or higher</li>
              <li>Keep content appropriate for all audiences</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '12px' }}>
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
              {loading ? 'Uploading...' : 'Publish Video'}
            </button>
            <Link to="/" className="btn" style={{ padding: '14px 20px' }}>
              Cancel
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
