import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function AdminPanel() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  
  // Estados del buscador
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Barrera de Seguridad (Frontend)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    // Si no está logueado o NO es admin, lo expulsamos al Home
    if (!user || !token || user.role !== 'admin') {
      navigate('/');
    } else {
      setCurrentUser(user);
    }
  }, [navigate]);

  // 2. Buscar usuarios en la nueva ruta /api/admin
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/users/search?email=${searchEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data);
      if (res.data.length === 0) {
        setMessage('No se encontraron usuarios con ese correo.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error buscando usuarios');
    } finally {
      setLoading(false);
    }
  };

  // 3. Cambiar rol en la nueva ruta /api/admin
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(res.data.message);
      
      // Actualizamos la tabla visualmente
      setSearchResults(searchResults.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el rol');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!currentUser) return null; // Evita parpadeos de UI antes de expulsar

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={() => {}} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main style={{ padding: '24px', width: '100%', overflowY: 'auto' }}>
          <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
              <h1 style={{ fontWeight: 800, margin: 0 }}>🛡️ Centro de Mando Admin</h1>
              <span className="muted" style={{ fontSize: '14px' }}>Logueado como: {currentUser.email}</span>
            </div>

            {/* Pestañas de Navegación */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <button 
                className={`btn ${activeTab === 'users' ? 'primary' : ''}`} 
                onClick={() => setActiveTab('users')}
              >
                Usuarios y Roles
              </button>
              <button 
                className="btn" 
                onClick={() => navigate('/create-campaign')}
              >
                Crear Campaña Anuncio ↗
              </button>
            </div>

            {/* Notificaciones */}
            {message && <div style={{ background: 'rgba(70,230,165,0.1)', color: 'var(--good)', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>{message}</div>}
            {error && <div style={{ background: 'rgba(255,77,109,0.1)', color: 'var(--bad)', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}

            {/* Buscador */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input 
                type="text" 
                className="input" 
                placeholder="Busca el correo de un usuario (ej: juan@gmail.com)" 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar Usuario'}
              </button>
            </form>

            {/* Tabla de Resultados */}
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
              {searchResults.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
                    <tr>
                      <th style={{ padding: '16px', fontSize: '13px', color: 'var(--muted)' }}>USUARIO</th>
                      <th style={{ padding: '16px', fontSize: '13px', color: 'var(--muted)' }}>ESTADO</th>
                      <th style={{ padding: '16px', fontSize: '13px', color: 'var(--muted)' }}>ROL ACTUAL</th>
                      <th style={{ padding: '16px', fontSize: '13px', color: 'var(--muted)' }}>ASIGNAR NUEVO ROL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>{u.email}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ color: u.status === 'Locked' ? 'var(--bad)' : 'var(--good)', fontSize: '13px' }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: u.role === 'admin' ? 'rgba(255, 77, 109, 0.2)' : 'rgba(255,255,255,0.1)',
                            color: u.role === 'admin' ? '#FF4D6D' : '#fff'
                          }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <select 
                            className="input" 
                            style={{ padding: '8px', fontSize: '13px', width: '100%', cursor: 'pointer' }}
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          >
                            <option value="user">Espectador (User)</option>
                            <option value="admin">Administrador (Admin)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;