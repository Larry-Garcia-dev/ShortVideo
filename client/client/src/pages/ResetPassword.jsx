import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { translations } from '../utils/translations';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const rp = t.resetPassword || {};

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setMessage(rp.successMessage || 'Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || (rp.errorDefault || 'Error resetting password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '400px', padding: '28px' }}>
        <h2 style={{ marginBottom: '16px' }}>{rp.title || 'New Password'} 🔑</h2>
        
        {message && <div style={{ color: 'var(--good)', marginBottom: '16px', fontSize: '13px' }}>{message}</div>}
        {error && <div style={{ color: 'var(--bad)', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={handleReset}>
          <div style={{ marginBottom: '16px' }}>
            <label className="muted" style={{ fontSize: '12px' }}>{rp.newPasswordLabel || 'New Password'}</label>
            <input type="password" className="input" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              {rp.passwordHelp || '8-12 chars, 1 uppercase, 1 number, 1 symbol.'}
            </div>
          </div>
          <button type="submit" className="btn primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (rp.updating || 'Updating...') : (rp.setNewPassword || 'Set New Password')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
