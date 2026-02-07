import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { translations } from '../utils/translations'; // Importar diccionario

function Header({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  // Leer usuario y preferencia de idioma guardada
  const user = JSON.parse(localStorage.getItem('user'));
  const storedLang = localStorage.getItem('appLanguage') || (user?.language) || 'en';

  const [currentLang, setCurrentLang] = useState(storedLang);
  const navigate = useNavigate();

  // Obtener textos según el idioma actual
  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    // Sincronizar idioma si cambia externamente (opcional)
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

    // Si hay usuario, actualizar su preferencia en BD
    if (user) {
      try {
        await axios.put('http://localhost:5000/api/users/language', {
          userId: user.id,
          language: newLang
        });
        // Actualizar usuario en storage
        user.language = newLang;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err) {
        console.error("Error updating language preference", err);
      }
    }
    // Recargar para aplicar cambios en toda la app (método simple)
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
      <div style={{
        height: '100%',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{
              height: '40px', /* Ajusta este tamaño si lo ves muy grande o chico */
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

          {/* Language Globe Selector */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
            <span style={{ fontSize: '16px', marginRight: '4px' }} title="Change Language">🌐</span>
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
                ➕
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
                  fontSize: '14px',
                }}
                title={user.email}
                onClick={handleLogout}
              >
                👤
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
