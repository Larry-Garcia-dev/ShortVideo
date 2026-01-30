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
      background: 'rgba(7, 10, 18, 0.75)',
      borderBottom: '1px solid var(--line)',
      height: '60px',
    }}>
      <div style={{
        height: '100%',
        padding: '0 18px',
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
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '520px' }}>
          <input
            type="text"
            className="input"
            placeholder="🔍 Search videos, creators, hashtags"
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              borderRadius: '20px',
              padding: '10px 18px',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link 
                to="/upload" 
                className="iconBtn"
                title="Upload"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ➕
              </Link>
              <button 
                className="iconBtn"
                title="Notifications"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🔔
              </button>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand), var(--brand2))',
                  border: '2px solid var(--line)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
                title={user.email}
                onClick={handleLogout}
              >
                👤
              </div>
            </>
          ) : (
            <>
              <button 
                className="iconBtn"
                title="Notifications"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🔔
              </button>
              <Link 
                to="/login" 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
              >
                👤
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
