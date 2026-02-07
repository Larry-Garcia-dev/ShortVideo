import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { translations } from '../utils/translations';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Usar el idioma del localStorage (o 'en' por defecto)
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'en');
  const navigate = useNavigate();

  // Obtener textos traducidos
  const t = translations[language] || translations.en;

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  // Regex para contraseña (8-12 chars, 1 Mayus, 1 Num, 1 Simbolo)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,12}$/;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordRegex.test(password)) {
      setError(t.register.errorRegex);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password,
        language // Enviamos el idioma seleccionado al backend
      });
      
      // Guardar usuario y idioma en localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      navigate('/');
      window.location.reload(); // Recarga para aplicar idioma en toda la app
    } catch (err) {
      setError(err.response?.data?.message || t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      padding: '20px',
      position: 'relative'
    }}>
      {/* Selector de Idioma Flotante */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '18px' }}>🌐</span>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            background: 'var(--panel)',
            color: 'var(--text)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer'
          }}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="zh">中文</option>
        </select>
      </div>

      <div className="panel" style={{ width: '100%', maxWidth: '400px', padding: '28px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>{t.register.title}</h1>
        
        {error && (
          <div style={{ background: 'rgba(255, 77, 109, 0.1)', color: 'var(--bad)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="muted" style={{ fontSize: '12px' }}>{t.register.emailLabel}</label>
            <input 
              type="email" 
              className="input" 
              style={{ width: '100%' }} 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="muted" style={{ fontSize: '12px' }}>{t.register.passwordLabel}</label>
            <input 
              type="password" 
              className="input" 
              style={{ width: '100%' }} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              {t.register.passwordHelp}
            </div>
          </div>

          {/* También mostramos el selector dentro del formulario para claridad, sincronizado con el de arriba */}
          <div>
            <label className="muted" style={{ fontSize: '12px' }}>{t.register.languageLabel}</label>
            <select 
              className="select" 
              style={{ width: '100%', padding: '10px' }} 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="zh">Chinese (中文)</option>
            </select>
          </div>

          <button type="submit" className="btn primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? t.register.submittingBtn : t.register.submitBtn}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          {t.register.hasAccount} <Link to="/login" style={{ color: 'var(--brand2)', fontWeight: 600 }}>{t.register.loginLink}</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;