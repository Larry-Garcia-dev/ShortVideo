import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { translations } from '../utils/translations';

function Header({ onSearch, onToggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const storedLang = localStorage.getItem('appLanguage') || (user?.language) || 'en';

  const [currentLang, setCurrentLang] = useState(storedLang);
  const navigate = useNavigate();
  const langRef = useRef(null);
  const userMenuRef = useRef(null);

  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    localStorage.setItem('appLanguage', currentLang);
  }, [currentLang]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleLanguageSelect = async (newLang) => {
    setLangOpen(false);
    if (newLang === currentLang) return;
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
      } catch (err) { /* ignore */ }
    }
    window.location.reload();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* SVG icons as small components */
  const IconGlobe = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
  const IconPlus = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
  const IconUser = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const IconProfile = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const IconVideo = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );
  const IconLogout = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
  const IconCheck = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  const username = user?.email?.split('@')[0] || '';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      backdropFilter: 'blur(12px)',
      background: 'rgba(7, 10, 18, 0.75)',
      borderBottom: '1px solid var(--line)',
      height: '60px',
    }}>
      <div className="header-inner">
        {onToggleSidebar && (
          <button className="header-hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}

        <Link to="/" className="header-brand">
          <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }}/>
        </Link>

        <div className="header-search-wrapper">
          <span className="header-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text" className="header-search-input"
            placeholder={t.header.searchPlaceholder}
            value={searchQuery} onChange={handleSearchChange}
          />
        </div>

        <div className="header-actions">
          {/* Language */}
          <div className="header-lang-wrapper" ref={langRef}>
            <button className="iconBtn header-lang-btn" onClick={() => setLangOpen(p => !p)} aria-label="Change language" title="Change language">
              {IconGlobe}
            </button>
            {langOpen && (
              <div className="header-lang-dropdown">
                {[
                  { code: 'en', label: 'English', flag: 'EN' },
                  { code: 'es', label: 'Espanol', flag: 'ES' },
                  { code: 'zh', label: '\u4E2D\u6587', flag: 'ZH' },
                ].map((lang) => (
                  <button key={lang.code} className={`header-lang-option${currentLang === lang.code ? ' active' : ''}`} onClick={() => handleLanguageSelect(lang.code)}>
                    <span className="header-lang-flag">{lang.flag}</span>
                    <span className="header-lang-label">{lang.label}</span>
                    {currentLang === lang.code && IconCheck}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* Upload */}
              <Link to="/upload" className="iconBtn" title={t.header.upload}
                style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {IconPlus}
              </Link>

              {/* User avatar + dropdown */}
              <div className="header-user-wrapper" ref={userMenuRef}>
                <button
                  className="header-user-avatar"
                  onClick={() => setUserMenuOpen(p => !p)}
                  title={user.email}
                  aria-label="User menu"
                >
                  {user.avatar ? (
                    <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="" className="header-user-avatar-img"/>
                  ) : IconUser}
                </button>

                {userMenuOpen && (
                  <div className="header-user-dropdown">
                    {/* User info header */}
                    <div className="header-user-dd-info">
                      <div className="header-user-dd-avatar">
                        {user.avatar ? (
                          <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                        ) : IconUser}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="header-user-dd-name">@{username}</div>
                        <div className="header-user-dd-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="header-user-dd-sep"/>

                    {/* My Profile */}
                    <button className="header-user-dd-item" onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}>
                      {IconProfile}
                      <span>{t.header.myProfile || 'My Profile'}</span>
                    </button>

                    {/* My Videos */}
                    <button className="header-user-dd-item" onClick={() => { setUserMenuOpen(false); navigate('/my-videos'); }}>
                      {IconVideo}
                      <span>{t.header.myVideos || 'My Videos'}</span>
                    </button>

                    <div className="header-user-dd-sep"/>

                    {/* Logout */}
                    <button className="header-user-dd-item logout" onClick={handleLogout}>
                      {IconLogout}
                      <span>{t.header.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              {t.header.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
