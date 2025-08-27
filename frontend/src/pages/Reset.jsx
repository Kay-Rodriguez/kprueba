import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Reset(){
  const { token } = useParams();
  const { reset } = useAuth();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    if(!/^\d{10}$/.test(password)) return setErr('La clave debe tener 10 dígitos.');
    try { const r = await reset(token, password); setMsg(r.msg || 'Contraseña actualizada'); }
    catch(e){ setErr(e?.response?.data?.msg || 'Error al actualizar'); }
  };

  return (
    <div className="container" style={{maxWidth: 420}}>
      <div className="card">
        <h2>Nueva contraseña</h2>
        <form onSubmit={submit} className="grid">
          <input type="password" maxLength={10} placeholder="Nueva clave (10 dígitos)" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn" type="submit">Guardar</button>
          {msg && <div style={{color:'#16a34a'}}>{msg}</div>}
          {err && <div style={{color:'#dc2626'}}>{err}</div>}
          <Link to="/login">Volver a iniciar sesión</Link>
        </form>
      </div>
    </div>
  );
}
