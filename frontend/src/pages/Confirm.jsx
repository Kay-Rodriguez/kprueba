import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Confirm(){
const { token } = useParams();
const { confirm } = useAuth();
const [msg, setMsg] = useState('Confirmando...');
const [err, setErr] = useState('');


useEffect(() => { (async () => {
try { const r = await confirm(token); setMsg(r.msg); }
catch(e){ setErr(e?.response?.data?.msg || 'Error al confirmar'); }
})(); }, [token]);


return (
<div className="container" style={{maxWidth: 520}}>
<div className="card">
<h2>Confirmación</h2>
{err ? <div style={{color:'#dc2626'}}>{err}</div> : <div style={{color:'#16a34a'}}>{msg}</div>}
<p><Link to="/login">Ir a iniciar sesión</Link></p>
</div>
</div>
);
}