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
            Welcome back
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
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '12px', 
                color: 'var(--muted)' 
              }}>
                Email address
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
                Password
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            fontSize: '13px',
            color: 'var(--muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/" style={{ color: 'var(--brand2)', fontWeight: 600 }}>
              Continue as guest
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
            Back to Home
          </Link>
          <span style={{ margin: '0 10px' }}>•</span>
          <span>© 2026 ShortVideo</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
