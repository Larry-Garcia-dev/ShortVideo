import { Link, useLocation } from 'react-router-dom';
import { translations } from '../utils/translations';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  
  const isActive = (path) => location.pathname === path;
  
  const navItemStyle = (active) => ({
    padding: '12px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    color: active ? 'var(--text)' : 'var(--muted)',
    background: active ? 'var(--panel)' : 'transparent',
    fontWeight: active ? 600 : 400,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.15s ease',
    border: active ? '1px solid var(--line)' : '1px solid transparent',
    textDecoration: 'none',
    fontSize: '14px',
  });

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <Link to="/" style={navItemStyle(isActive('/'))} onClick={onClose}>
          <span>🏠</span>
          <span>{t.sidebar?.home || 'Home'}</span>
        </Link>
        <Link to="/trending" style={navItemStyle(isActive('/trending'))} onClick={onClose}>
          <span>🔥</span>
          <span>{t.sidebar?.trending || 'Trending'}</span>
        </Link>
        <Link to="/following" style={navItemStyle(isActive('/following'))} onClick={onClose}>
          <span>👥</span>
          <span>{t.sidebar?.following || 'Following'}</span>
        </Link>
        <Link to="/sounds" style={navItemStyle(isActive('/sounds'))} onClick={onClose}>
          <span>🎵</span>
          <span>{t.sidebar?.sounds || 'Sounds'}</span>
        </Link>
        <Link to="/favorites" style={navItemStyle(isActive('/favorites'))} onClick={onClose}>
          <span>⭐</span>
          <span>{t.sidebar?.favorites || 'Favorites'}</span>
        </Link>
        
        <div style={{ borderTop: '1px solid var(--line)', margin: '12px 0' }}></div>
        
        <Link to="/campaigns" style={navItemStyle(isActive('/campaigns'))} onClick={onClose}>
          <span>🏆</span>
          <span>{t.sidebar?.campaigns || 'Campaigns'}</span>
        </Link>
        <Link to="/upload" style={navItemStyle(isActive('/upload'))} onClick={onClose}>
          <span>📤</span>
          <span>{t.sidebar?.upload || 'Upload'}</span>
        </Link>
      </nav>
      
      {/* Tip */}
      <div style={{
        fontSize: '12px',
        color: 'var(--muted)',
        lineHeight: 1.4,
        padding: '12px',
        background: 'var(--panel)',
        borderRadius: '12px',
        border: '1px solid var(--line)',
      }}>
        <strong>{t.sidebar?.tipLabel || 'Tip:'}</strong>{' '}
        <span style={{ color: 'var(--brand2)' }}>{t.sidebar?.tipText || 'Click on a video card to watch it.'}</span>
      </div>
    </aside>
  );
}

export default Sidebar;
