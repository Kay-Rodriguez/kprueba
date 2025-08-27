import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register(){
  const { register } = useAuth();
  const [form, setForm] = useState({ nombre:'', apellido:'', email:'', password:'' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    if(!/^\d{10}$/.test(form.password)) return setErr('La clave debe tener 10 dígitos numéricos.');
    try { const r = await register(form); setMsg(r.msg || 'Revisa tu correo para confirmar.'); }
    catch(e){ setErr(e?.response?.data?.msg || 'Error al registrar'); }
  };

  return (
    <div className="container" style={{maxWidth: 520}}>
      <div className="card">
        <h2>Crear cuenta</h2>
        <form onSubmit={submit} className="grid">
          <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} />
          <input placeholder="Apellido" value={form.apellido} onChange={e=>setForm({...form, apellido:e.target.value})} />
          <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          <input type="password" placeholder="Clave (10 dígitos)" maxLength={10} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
          <button className="btn" type="submit">Registrarme</button>

          {/* 👇 NUEVO: volver a login */}
          <div className="flex" style={{justifyContent:'space-between'}}>
            <Link to="/login" className="btn secondary">Iniciar sesión</Link>
          </div>

          {msg && <div style={{color:'#16a34a'}}>{msg}</div>}
          {err && <div style={{color:'#dc2626'}}>{err}</div>}
        </form>
      </div>
    </div>
  );
}
