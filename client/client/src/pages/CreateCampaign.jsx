import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { translations } from '../utils/translations';

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
  const token = localStorage.getItem('token') || (user && user.token);
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const cc = t.createCampaign || {};

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
      const API_URL = import.meta.env.MODE === 'production' 
        ? 'http://47.87.37.35:5000/api/campaigns/create'
        : 'http://localhost:5000/api/campaigns/create';

      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast(cc.successMessage || 'Campaign created successfully!');
      setTimeout(() => navigate('/campaigns'), 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || (cc.errorDefault || 'Error creating campaign');
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
          <span className="pill" style={{ marginBottom: '10px', display: 'inline-flex' }}>{cc.adminPanel || 'Admin Panel'}</span>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800 }}>
            {cc.title || 'Create New Campaign'}
          </h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {cc.subtitle || 'Launch a new challenge for the community.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
              {cc.campaignName || 'Campaign Name'} <span style={{ color: 'var(--brand2)' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              className="input"
              required
              placeholder={cc.namePlaceholder || 'e.g., Summer Dance Challenge 2026'}
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
              {cc.description || 'Description'}
            </label>
            <textarea
              name="description"
              className="input"
              required
              placeholder={cc.descriptionPlaceholder || 'Describe rules and prizes...'}
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div className="create-campaign-dates">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                {cc.startDate || 'Start Date'}
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
                {cc.endDate || 'End Date'}
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn primary"
              disabled={loading}
              style={{ flex: 1, padding: '12px', justifyContent: 'center', minWidth: '150px' }}
            >
              {loading ? (cc.creating || 'Creating...') : (cc.launchCampaign || 'Launch Campaign')}
            </button>
            <Link to="/campaigns" className="btn" style={{ padding: '12px 20px' }}>
              {cc.cancel || 'Cancel'}
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
