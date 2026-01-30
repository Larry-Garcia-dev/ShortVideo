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
  });

  return (
    <aside style={{
      width: '220px',
      borderRight: '1px solid var(--line)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'rgba(7, 10, 18, 0.5)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontWeight: 850 }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '12px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 55%), linear-gradient(135deg, rgba(124,92,255,1), rgba(25,211,255,.8))',
          border: '1px solid rgba(255,255,255,.18)',
          boxShadow: '0 18px 45px rgba(124,92,255,.18)',
        }} aria-hidden="true"></div>
        <span style={{ fontSize: '18px', letterSpacing: '-0.3px' }}>ShortVideo</span>
      </div>
      
      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <Link to="/" style={navItemStyle(isActive('/'))}>
          <span>Home</span>
        </Link>
        <Link to="/campaigns" style={navItemStyle(isActive('/campaigns'))}>
          <span>Campaigns</span>
        </Link>
        <Link to="/upload" style={navItemStyle(isActive('/upload'))}>
          <span>Upload</span>
        </Link>
        
        <div style={{ borderTop: '1px solid var(--line)', margin: '12px 0' }}></div>
        
        <div style={{ padding: '12px 14px', color: 'var(--muted)', fontSize: '13px' }}>
          Following
        </div>
        <div style={{ padding: '12px 14px', color: 'var(--muted)', fontSize: '13px' }}>
          Favorites
        </div>
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
        Tip: Scroll the feed and click videos to watch.
      </div>
    </aside>
  );
}

export default Sidebar;
