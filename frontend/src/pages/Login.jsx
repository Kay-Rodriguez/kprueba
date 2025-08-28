import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('1234567890'); // 10 dígitos
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');

    if (!/^\d{10}$/.test(password)) {
      setError('La clave debe tener 10 dígitos numéricos.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.data?.error || err?.data?.message || err?.message || 'Usuario o contraseña incorrectos.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="grid">
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="tu@email.com"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password">Clave (10 dígitos)</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
              type="password"
              placeholder="1234567890"
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div role="alert" style={{ color: '#f87171' }}>{error}</div>}

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>

          <div className="flex" style={{ justifyContent: 'space-between' }}>
            <Link to="/register" className="btn secondary">Crear cuenta</Link>
            <Link to="/forgot" className="btn secondary">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
