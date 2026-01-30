import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  
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
    <aside style={{
      width: '200px',
      borderRight: '1px solid var(--line)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 60px)',
      position: 'sticky',
      top: '60px',
      background: 'rgba(7, 10, 18, 0.5)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <Link to="/" style={navItemStyle(isActive('/'))}>
          <span>🏠</span>
          <span>Home</span>
        </Link>
        <Link to="/trending" style={navItemStyle(isActive('/trending'))}>
          <span>🔥</span>
          <span>Trending</span>
        </Link>
        <Link to="/following" style={navItemStyle(isActive('/following'))}>
          <span>👥</span>
          <span>Following</span>
        </Link>
        <Link to="/sounds" style={navItemStyle(isActive('/sounds'))}>
          <span>🎵</span>
          <span>Sounds</span>
        </Link>
        <Link to="/favorites" style={navItemStyle(isActive('/favorites'))}>
          <span>⭐</span>
          <span>Favorites</span>
        </Link>
        
        <div style={{ borderTop: '1px solid var(--line)', margin: '12px 0' }}></div>
        
        <Link to="/campaigns" style={navItemStyle(isActive('/campaigns'))}>
          <span>🏆</span>
          <span>Campaigns</span>
        </Link>
        <Link to="/upload" style={navItemStyle(isActive('/upload'))}>
          <span>📤</span>
          <span>Upload</span>
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
        <strong>Tip:</strong> <span style={{ color: 'var(--brand2)' }}>Scroll</span> the feed. Click the player area to toggle pause (wireframe).
      </div>
    </aside>
  );
}

export default Sidebar;
