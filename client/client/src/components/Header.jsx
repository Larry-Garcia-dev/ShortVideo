import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { translations } from '../utils/translations';

function Header({ onSearch, onToggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const storedLang = localStorage.getItem('appLanguage') || (user?.language) || 'en';

  const [currentLang, setCurrentLang] = useState(storedLang);
  const navigate = useNavigate();

  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    localStorage.setItem('appLanguage', currentLang);
  }, [currentLang]);

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

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    localStorage.setItem('appLanguage', newLang);

    if (user) {
      try {
        await axios.put('http://localhost:5000/api/users/language', {
          userId: user.id,
          language: newLang
        });
        user.language = newLang;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err) {
        console.error("Error updating language preference", err);
      }
    }
    window.location.reload();
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
      <div className="header-inner">
        {/* Hamburger for mobile */}
        {onToggleSidebar && (
          <button
            className="header-hamburger"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}

        {/* Brand */}
        <Link to="/" className="header-brand">
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: '40px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </Link>

        {/* Search */}
        <div className="header-search-wrapper">
          <span className="header-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="header-search-input"
            placeholder={t.header.searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Actions & Language */}
        <div className="header-actions">

          {/* Language Globe Selector */}
          <div className="header-lang-selector">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', color: 'var(--muted)', flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: 600
              }}
            >
              <option value="en" style={{ background: 'var(--bg)' }}>EN</option>
              <option value="es" style={{ background: 'var(--bg)' }}>ES</option>
              <option value="zh" style={{ background: 'var(--bg)' }}>ZH</option>
            </select>
          </div>

          {user ? (
            <>
              <Link
                to="/upload"
                className="iconBtn"
                title={t.header.upload}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </Link>
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
                }}
                title={user.email}
                onClick={handleLogout}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="btn primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              {t.header.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
