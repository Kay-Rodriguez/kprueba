import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login(){
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('1234567890'); // 10 dígitos
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if(!/^\d{10}$/.test(password)) return setError('La clave debe tener 10 dígitos numéricos.');
    try { await login(email, password); navigate('/dashboard'); }
    catch(err){ setError(err?.response?.data?.msg || 'Usuario o contraseña incorrectos.'); }
  };

  return (
    <div className="container" style={{maxWidth: 420}}>
      <div className="card">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="grid">
          <div>
            <label>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="tu@email.com" />
          </div>
          <div>
            <label>Clave (10 dígitos)</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="1234567890" maxLength={10} />
          </div>
          {error && <div style={{color:'#f87171'}}>{error}</div>}
          <button className="btn" type="submit">Ingresar</button>

          {/* botones extra */}
          <div className="flex" style={{justifyContent:'space-between'}}>
            <Link to="/register" className="btn secondary">Crear cuenta</Link>
            <Link to="/forgot" className="btn secondary">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
