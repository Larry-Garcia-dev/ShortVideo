import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

function CreateCampaign() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  // Obtenemos el token guardado en login (si guardaste todo el objeto user, revisa si el token está dentro o aparte)
  // En AuthController.js lo mandamos suelto, asegúrate de guardarlo en localStorage en Login.jsx o user.token
  const token = localStorage.getItem('token') || (user && user.token);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Determinar URL base
      const API_URL = import.meta.env.MODE === 'production' 
        ? 'http://47.87.37.35:5000/api/campaigns/create'
        : 'http://localhost:5000/api/campaigns/create';

      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` } // Enviamos el token
      });
      
      showToast('Campaign created successfully! 🎉');
      setTimeout(() => navigate('/campaigns'), 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error creating campaign';
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <main className="wrap" style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 18px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span className="pill" style={{ marginBottom: '10px', display: 'inline-flex' }}>Admin Panel</span>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800 }}>
            Create New Campaign
          </h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Launch a new challenge for the community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
              Campaign Name <span style={{ color: 'var(--brand2)' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              className="input"
              required
              placeholder="e.g., Summer Dance Challenge 2026"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
              Description
            </label>
            <textarea
              name="description"
              className="input"
              required
              placeholder="Describe rules and prizes..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                className="input"
                required
                value={formData.startDate}
                onChange={handleChange}
                style={{ width: '100%', colorScheme: 'dark' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                className="input"
                required
                value={formData.endDate}
                onChange={handleChange}
                style={{ width: '100%', colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="submit"
              className="btn primary"
              disabled={loading}
              style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
            >
              {loading ? 'Creating...' : '🚀 Launch Campaign'}
            </button>
            <Link to="/campaigns" className="btn" style={{ padding: '12px 20px' }}>
              Cancel
            </Link>
          </div>
        </form>
      </main>

      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default CreateCampaign;