import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { translations } from '../utils/translations';

/* Generate a random secure password */
function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%&*?';
  const all = upper + lower + digits + symbols;

  let pw = '';
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  pw += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = 4; i < 10; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }
  return pw.split('').sort(() => Math.random() - 0.5).join('');
}

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [suggestedPw, setSuggestedPw] = useState('');
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

  const handleSuggestPassword = () => {
    const pw = generatePassword();
    setSuggestedPw(pw);
    setPassword(pw);
    setShowPassword(true);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '400px', padding: '28px' }}>
        <h2 style={{ marginBottom: '16px', fontWeight: 800 }}>
          {rp.title || 'New Password'}
        </h2>

        {message && <div style={{ color: 'var(--good)', marginBottom: '16px', fontSize: '13px', background: 'rgba(70,230,165,0.1)', padding: '12px', borderRadius: '12px' }}>{message}</div>}
        {error && <div style={{ color: 'var(--bad)', marginBottom: '16px', fontSize: '13px', background: 'rgba(255,77,109,0.1)', padding: '12px', borderRadius: '12px' }}>{error}</div>}

        <form onSubmit={handleReset}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--muted)' }}>
              <span>{rp.newPasswordLabel || 'New Password'}</span>
              <button
                type="button"
                onClick={handleSuggestPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand2)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                {t.login?.suggestPassword || 'Suggest password'}
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                style={{ width: '100%', paddingRight: '44px' }}
                value={password}
                onChange={e => { setPassword(e.target.value); setSuggestedPw(''); }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              {rp.passwordHelp || '8-12 chars, 1 uppercase, 1 number, 1 symbol.'}
            </div>
            {suggestedPw && (
              <div style={{
                marginTop: '6px',
                fontSize: '11px',
                color: 'var(--good)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {t.login?.passwordSuggested || 'Secure password applied'}
              </div>
            )}
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
