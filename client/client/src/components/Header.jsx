import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backdropFilter: 'blur(12px)',
      background: 'rgba(7, 10, 18, 0.55)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 850 }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '12px',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 55%), linear-gradient(135deg, rgba(124,92,255,1), rgba(25,211,255,.8))',
            border: '1px solid rgba(255,255,255,.18)',
            boxShadow: '0 18px 45px rgba(124,92,255,.18)',
          }} aria-hidden="true"></div>
          <span style={{ fontSize: '16px' }}>ShortVideo</span>
          <span className="pill">Beta</span>
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '520px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search videos, creators, hashtags..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              borderRadius: '20px',
              padding: '10px 18px',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/upload" className="btn primary">
                Upload
              </Link>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
