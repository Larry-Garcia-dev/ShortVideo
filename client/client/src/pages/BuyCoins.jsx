import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { translations } from '../utils/translations';

function BuyCoins() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const user = JSON.parse(localStorage.getItem('user'));
  const lang = localStorage.getItem('appLanguage') || 'en';
  const t = translations[lang] || translations.en;
  const bc = t.buyCoins || {};

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [packagesRes, balanceRes] = await Promise.all([
        axios.get('http://localhost:5000/api/coins/packages'),
        axios.get(`http://localhost:5000/api/coins/balance/${user.id}`)
      ]);
      setPackages(packagesRes.data || []);
      setBalance(balanceRes.data.balance || 0);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const openPayment = (pkg) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
    setPaymentStep(1);
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const processPayment = async () => {
    if (!selectedPackage) return;

    // Validate card
    if (cardNumber.replace(/\s/g, '').length < 16) {
      showToast(bc.invalidCard || 'Invalid card number');
      return;
    }
    if (cardExpiry.length < 5) {
      showToast(bc.invalidExpiry || 'Invalid expiry date');
      return;
    }
    if (cardCVC.length < 3) {
      showToast(bc.invalidCVC || 'Invalid CVC');
      return;
    }

    setPurchasing(true);
    setPaymentStep(2);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await axios.post('http://localhost:5000/api/coins/purchase', {
        userId: user.id,
        packageId: selectedPackage.id,
        paymentMethod: 'card'
      });

      setPaymentStep(3);
      setBalance(res.data.newBalance);

      // Close modal after success animation
      setTimeout(() => {
        setShowPaymentModal(false);
        showToast(`${bc.purchaseSuccess || 'Purchase successful!'} +${res.data.coinsAdded} ${bc.coins || 'coins'}`);
      }, 2000);

    } catch (err) {
      setPaymentStep(1);
      showToast(err.response?.data?.message || bc.purchaseFailed || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{ padding: '18px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 4px 16px rgba(255,215,0,0.35)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.3"/>
                    <circle cx="12" cy="12" r="6" fill="#fff"/>
                  </svg>
                </span>
                {bc.title || 'Buy Coins'}
              </h1>
              <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
                {bc.subtitle || 'Support your favorite streamers with gifts'}
              </p>
            </div>

            {/* Current Balance */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,165,0,0.08))',
              border: '1px solid rgba(255,215,0,0.25)',
              borderRadius: 'var(--r18)',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.3"/>
                    <circle cx="12" cy="12" r="6" fill="#fff"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>{bc.yourBalance || 'Your Balance'}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 800, color: '#FFD700' }}>{balance.toLocaleString()}</p>
                </div>
              </div>
              <Link to="/streams" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {bc.watchStreams || 'Watch Streams'}
              </Link>
            </div>

            {/* Packages Grid */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div className="spinner" />
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px'
              }}>
                {packages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => openPayment(pkg)}
                    style={{
                      background: pkg.popular ? 'linear-gradient(135deg, rgba(124,92,255,0.15), rgba(100,160,255,0.1))' : 'var(--card)',
                      border: '1px solid',
                      borderColor: pkg.popular ? 'rgba(124,92,255,0.4)' : 'var(--line)',
                      borderRadius: 'var(--r18)',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    className="coin-package"
                  >
                    {pkg.popular && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '-30px',
                        background: 'linear-gradient(90deg, #7c5cff, #6495ed)',
                        color: '#fff', fontSize: '10px', fontWeight: 800,
                        padding: '4px 40px',
                        transform: 'rotate(45deg)',
                        textTransform: 'uppercase'
                      }}>
                        {bc.popular || 'Popular'}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.3"/>
                          <circle cx="12" cy="12" r="6" fill="#fff"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>
                          {pkg.coins.toLocaleString()}
                        </p>
                        {pkg.bonus > 0 && (
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--good)', fontWeight: 600 }}>
                            +{pkg.bonus} {bc.bonus || 'bonus'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand2)' }}>${pkg.price}</span>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>USD</span>
                    </div>

                    {pkg.bonus > 0 && (
                      <p style={{ margin: '12px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                        {bc.totalCoins || 'Total'}: <strong style={{ color: 'var(--text)' }}>{(pkg.coins + pkg.bonus).toLocaleString()}</strong> {bc.coins || 'coins'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Payment Info */}
            <div style={{
              marginTop: '32px',
              padding: '20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r18)',
              display: 'flex', alignItems: 'flex-start', gap: '14px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                  {bc.paymentNote || 'Payment Gateway Coming Soon'}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                  {bc.paymentDesc || 'This is a simulated payment for demonstration purposes. Real payment integration (Stripe, PayPal) will be added soon.'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <div
          onClick={() => !purchasing && setShowPaymentModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '20px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r22)',
              width: '100%', maxWidth: '420px',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                {bc.completePayment || 'Complete Payment'}
              </h3>
              {!purchasing && (
                <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            <div style={{ padding: '20px' }}>
              {paymentStep === 1 && (
                <>
                  {/* Package Summary */}
                  <div style={{
                    background: 'rgba(255,215,0,0.08)',
                    border: '1px solid rgba(255,215,0,0.2)',
                    borderRadius: 'var(--r14)',
                    padding: '16px',
                    marginBottom: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="6" fill="#fff"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                          {(selectedPackage.coins + selectedPackage.bonus).toLocaleString()} {bc.coins || 'coins'}
                        </p>
                        {selectedPackage.bonus > 0 && (
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--good)' }}>
                            {bc.includesBonus || 'Includes'} +{selectedPackage.bonus} {bc.bonus || 'bonus'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand2)' }}>
                      ${selectedPackage.price}
                    </div>
                  </div>

                  {/* Card Form */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                      {bc.cardNumber || 'Card Number'}
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      className="input"
                      style={{ width: '100%' }}
                      maxLength={19}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                        {bc.expiry || 'Expiry'}
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="input"
                        style={{ width: '100%' }}
                        maxLength={5}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="input"
                        style={{ width: '100%' }}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <button
                    onClick={processPayment}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}
                  >
                    {bc.pay || 'Pay'} ${selectedPackage.price}
                  </button>

                  <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>
                    {bc.securePayment || 'Secure payment simulation - no real charges'}
                  </p>
                </>
              )}

              {paymentStep === 2 && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 20px' }} />
                  <p style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                    {bc.processing || 'Processing payment...'}
                  </p>
                </div>
              )}

              {paymentStep === 3 && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(70,230,165,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#46e6a5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
                    {bc.success || 'Payment Successful!'}
                  </p>
                  <p style={{ color: 'var(--good)', fontSize: '24px', fontWeight: 800, margin: 0 }}>
                    +{(selectedPackage.coins + selectedPackage.bonus).toLocaleString()} {bc.coins || 'coins'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>

      <style>{`
        .coin-package:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}

export default BuyCoins;
