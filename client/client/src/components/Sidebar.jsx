import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div style={{ width: '250px', padding: '20px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '20px', height: '100vh', position: 'sticky', top: 0 }}>
      <h2 style={{ color: '#e91e63' }}>ShortVideo</h2>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>🏠 Inicio</Link>
        <Link to="/campaigns" style={{ color: '#FFD700', textDecoration: 'none', fontSize: '1.1em' }}>🏆 Desafíos</Link>
        <Link to="/upload" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>📹 Subir Video</Link>
        <div style={{ borderTop: '1px solid #333', margin: '10px 0' }}></div>
        <span style={{ color: '#777' }}>Siguiendo</span>
        <span style={{ color: '#777' }}>Favoritos</span>
      </nav>
    </div>
  );
}

export default Sidebar;