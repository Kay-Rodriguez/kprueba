import React, { useEffect, useState } from 'react';
import api from '../api';

const empty = { cedula:'', nombre:'', apellido:'', ciudad:'', email:'', direccion:'', telefono:'', fecha_nacimiento:'', dependencia:'' };

export default function ClientsPage(){
const [items, setItems] = useState([]); const [form, setForm] = useState(empty); const [editing, setEditing] = useState(null); const [loading, setLoading] = useState(false);
const load = async () => { setLoading(true); const { data } = await api.get('/clientes'); setItems(data); setLoading(false); };
useEffect(()=>{ load(); },[]);
const submit = async (e) => { e.preventDefault(); if (editing) await api.put(`/clientes/${editing}`, form); else await api.post('/clientes', form); setForm(empty); setEditing(null); load(); };
const edit = (it) => { setEditing(it.id); setForm({...it, fecha_nacimiento: (it.fecha_nacimiento||'').substring?.(0,10) }); };
const del = async (id) => { if (confirm('¿Eliminar?')) { await api.delete(`/clientes/${id}`); load(); } };
return (
<div className="card">
<h2>Clientes</h2>
<form onSubmit={submit} className="grid">
{Object.keys(empty).map(k => (<input key={k} placeholder={k} value={form[k]||''} onChange={e=>setForm({...form, [k]:e.target.value})}/>))}
<div className="flex"><button className="btn" type="submit">{editing? 'Actualizar':'Crear'}</button>{editing&&<button className="btn secondary" onClick={()=>{setEditing(null); setForm(empty);}} type="button">Cancelar</button>}</div>
</form>
<h3>Listado</h3>
{loading? <p>Cargando...</p> : (
<table>
<thead><tr><th>Cédula</th><th>Nombre</th><th>Email</th><th>Acciones</th></tr></thead>
<tbody>{items.map(it=> (
<tr key={it.id}><td>{it.cedula}</td><td>{it.nombre} {it.apellido}</td><td>{it.email}</td>
<td className="actions"><button className="btn secondary" onClick={()=>edit(it)}>Editar</button><button className="btn" onClick={()=>del(it.id)}>Eliminar</button></td>
</tr>))}
</tbody>
</table>) }
</div>
);
}
