import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook para redirigir al usuario al Home

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Si el login es exitoso:
      alert('¡Bienvenido!');
      // Guardamos al usuario en el navegador (localStorage) para recordar que inició sesión
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Redirigir al Home
      navigate('/');

    } catch (err) {
      // Manejar errores del backend (ej. "Cuenta bloqueada", "Contraseña incorrecta")
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Error al conectar con el servidor');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: 'white' }}>
      <form onSubmit={handleLogin} style={{ padding: '40px', background: '#1e1e1e', borderRadius: '8px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2 style={{ textAlign: 'center' }}>Iniciar Sesión</h2>
        
        {error && <div style={{ color: '#ff4444', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '4px', fontSize: '0.9em' }}>{error}</div>}

        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#333', color: 'white' }}
        />
        
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#333', color: 'white' }}
        />

        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;