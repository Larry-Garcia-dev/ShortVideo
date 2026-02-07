import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Como estamos en local, el backend devuelve el token en la respuesta para pruebas
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '400px', padding: '28px' }}>
        <h2 style={{ marginBottom: '16px' }}>Reset Password 🔒</h2>
        <p className="muted" style={{ marginBottom: '20px', fontSize: '14px' }}>
          Enter your email to receive a password reset link.
        </p>

        {message && (
          <div style={{ background: 'rgba(70, 230, 165, 0.1)', color: 'var(--good)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px' }}>
            ✅ {message} <br/> (Check server console for link/token)
          </div>
        )}
        {error && <div style={{ color: 'var(--bad)', marginBottom: '16px', fontSize: '13px' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="email" className="input" placeholder="Enter your email" style={{ width: '100%', marginBottom: '16px' }} value={email} onChange={e => setEmail(e.target.value)} required />
          <button type="submit" className="btn primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link to="/login" className="muted" style={{ fontSize: '13px' }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;