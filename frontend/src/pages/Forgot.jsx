import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Forgot(){
  const { forgot } = useAuth();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    try { const r = await forgot(email); setMsg(r.msg || 'Si el correo existe, enviamos instrucciones.'); }
    catch(e){ setErr(e?.response?.data?.msg || 'Error al solicitar reinicio'); }
  };

  return (
    <div className="container" style={{maxWidth: 420}}>
      <div className="card">
        <h2>Recuperar contraseña</h2>
        <form onSubmit={submit} className="grid">
          <input type="email" placeholder="Tu email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn" type="submit">Enviar enlace</button>
          {msg && <div style={{color:'#16a34a'}}>{msg}</div>}
          {err && <div style={{color:'#dc2626'}}>{err}</div>}
        </form>
      </div>
    </div>
  );
}
