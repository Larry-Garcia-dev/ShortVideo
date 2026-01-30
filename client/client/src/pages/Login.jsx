import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Just UI - no functionality
    alert('Google login coming soon! 🚀');
  };

  const handleForgotPassword = () => {
    // Just UI - no functionality
    alert('Password recovery coming soon! 📧');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Logo */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          marginBottom: '32px',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 55%), linear-gradient(135deg, rgba(124,92,255,1), rgba(25,211,255,.8))',
            border: '1px solid rgba(255,255,255,.18)',
            boxShadow: '0 18px 45px rgba(124,92,255,.18)',
          }} aria-hidden="true"></div>
          <span style={{ fontSize: '24px', fontWeight: 850, letterSpacing: '-0.3px' }}>ShortVideo</span>
        </div>

        {/* Login Card */}
        <div className="panel" style={{ padding: '28px' }}>
          <h1 style={{ 
            margin: '0 0 8px', 
            fontSize: '22px', 
            textAlign: 'center',
            fontWeight: 800,
          }}>
            Welcome back 👋
          </h1>
          <p style={{ 
            margin: '0 0 24px', 
            textAlign: 'center', 
            color: 'var(--muted)',
            fontSize: '14px',
          }}>
            Sign in to continue to ShortVideo
          </p>

          {error && (
            <div style={{
              background: 'rgba(255, 77, 109, 0.1)',
              border: '1px solid rgba(255, 77, 109, 0.2)',
              color: 'var(--bad)',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              background: 'var(--panel)',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--panel2)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--panel)'}
          >
            {/* Google Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '16px 0',
            gap: '12px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '12px', 
                color: 'var(--muted)' 
              }}>
                📧 Email address
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '12px', 
                color: 'var(--muted)' 
              }}>
                🔒 Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand2)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: 0,
                }}
              >
                🔑 Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            fontSize: '13px',
            color: 'var(--muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--brand2)', fontWeight: 600 }}>
              Sign up ✨
            </Link>
          </div>

          <div style={{ 
            marginTop: '12px', 
            textAlign: 'center', 
            fontSize: '13px',
            color: 'var(--muted)',
          }}>
            Or{' '}
            <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>
              continue as guest 👤
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          fontSize: '12px', 
          color: 'var(--muted)' 
        }}>
          <Link to="/" style={{ color: 'var(--muted)' }}>
            🏠 Back to Home
          </Link>
          <span style={{ margin: '0 10px' }}>•</span>
          <span>© 2026 ShortVideo</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
