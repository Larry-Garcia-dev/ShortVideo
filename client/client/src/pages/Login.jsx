import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { translations } from '../utils/translations';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado local para idioma
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('appLanguage') || 'en');
  const navigate = useNavigate();

  // Obtener textos traducidos
  const t = translations[currentLang] || translations.en;

  // Actualizar localStorage cuando cambia el idioma
  useEffect(() => {
    localStorage.setItem('appLanguage', currentLang);
  }, [currentLang]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // CORRECCIÓN: Extraemos user Y token
      const { user: userData, token } = response.data; 
      
      // Lógica de idioma (sin cambios)
      if (userData.language && userData.language !== currentLang) {
        localStorage.setItem('appLanguage', userData.language);
      }

      // IMPORTANTE: Guardar el token por separado para que CreateCampaign lo encuentre
      localStorage.setItem('token', token); 
      localStorage.setItem('user', JSON.stringify(userData));
      
      navigate('/');
      window.location.reload(); 
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError(t.errors.locked);
      } else if (err.response && err.response.status === 401) {
        setError(t.errors.credentials);
      } else {
        setError(err.response?.data?.message || t.errors.generic);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // 1. DETECCIÓN INTELIGENTE DE URL 🧠
        // Si estamos en el servidor (producción), usa nip.io. Si no, usa localhost.
        const API_URL = import.meta.env.MODE === 'production' 
            ? 'http://47.87.37.35.nip.io:5000/api/auth/google' 
            : 'http://localhost:5000/api/auth/google';

        // 2. Enviar el token al backend correcto
        const res = await axios.post(API_URL, {
          accessToken: tokenResponse.access_token
        });

        // 3. Guardar sesión (Esto queda igual)
        const { user: userData, token } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (userData.language) {
            localStorage.setItem('appLanguage', userData.language);
        }

        navigate('/');
        // Esperamos un poquito para que React termine de procesar antes de recargar
        setTimeout(() => {
             window.location.reload();
        }, 100);
      } catch (err) {
        console.error(err);
        setError('Error iniciando sesión con Google');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Fallo la conexión con Google');
      setLoading(false);
    }
  });

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo + Language selector row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt={t.common.appName}
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            <span style={{ fontSize: '16px' }}>🌐</span>
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              style={{
                background: 'var(--panel)',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              <option value="en">English</option>
              <option value="es">Espanol</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>

        {/* Login Card */}
        <div className="panel" style={{ padding: '28px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', textAlign: 'center', fontWeight: 800 }}>
            {t.login.title}
          </h1>
          <p style={{ margin: '0 0 24px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            {t.login.subtitle}
          </p>

          {error && (
            <div style={{
              background: 'rgba(255, 77, 109, 0.1)', border: '1px solid rgba(255, 77, 109, 0.2)',
              color: 'var(--bad)', padding: '12px 14px', borderRadius: '12px',
              fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn"
            style={{
              width: '100%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: loading ? 0.7 : 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--line)',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text)',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '16px' }}>G</span> 
            {loading ? 'Connecting...' : t.login.googleLogin}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{t.login.or}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--muted)' }}>
                {t.login.emailLabel}
              </label>
              <input
                type="email" className="input" placeholder={t.login.emailPlaceholder}
                value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--muted)' }}>
                {t.login.passwordLabel}
              </label>
              <input
                type="password" className="input" placeholder={t.login.passwordPlaceholder}
                value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ background: 'none', border: 'none', color: 'var(--brand2)', cursor: 'pointer', fontSize: '13px', textDecoration: 'none' }}>
                {t.login.forgotPassword}
              </Link>
            </div>

            <button type="submit" className="btn primary" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? t.login.signingInBtn : t.login.signInBtn}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
            {t.login.noAccount}{' '}
            <Link to="/register" style={{ color: 'var(--brand2)', fontWeight: 600 }}>
              {t.login.signUpLink}
            </Link>
          </div>

          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
            {t.login.or}{' '}
            <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>
              {t.login.guestLink}
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
          <Link to="/" style={{ color: 'var(--muted)' }}>{t.login.backHome}</Link>
          <span style={{ margin: '0 10px' }}>•</span>
          <span>© 2026 {t.common.appName}</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
