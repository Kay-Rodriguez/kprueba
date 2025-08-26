import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login(){
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Usuario o contraseña incorrectos.');
    }
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
            <label>Clave</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••" />
          </div>
          {error && <div style={{color:'#f87171'}}>{error}</div>}
          <button className="btn" type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  )
}
