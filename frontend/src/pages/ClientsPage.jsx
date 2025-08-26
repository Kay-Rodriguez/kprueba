import React, { useEffect, useState } from 'react';
import api from '../api';

const empty = { cedula:'', nombre:'', apellido:'', ciudad:'', email:'', direccion:'', telefono:'', fecha_nacimiento:'', dependencia:'' };

export default function ClientsPage(){
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/clients');
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/clients/${editing}`, form);
    else await api.post('/clients', form);
    setForm(empty); setEditing(null); load();
  };
  const edit = (it) => { setEditing(it.id); setForm({...it}); };
  const del = async (id) => { if (confirm('¿Eliminar?')) { await api.delete(`/clients/${id}`); load(); } };

  return (
    <div className="card">
      <h2>Clientes</h2>

      <form onSubmit={submit} className="grid">
        <input placeholder="Cédula" value={form.cedula} onChange={e=>setForm({...form, cedula:e.target.value})} />
        <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} />
        <input placeholder="Apellido" value={form.apellido} onChange={e=>setForm({...form, apellido:e.target.value})} />
        <input placeholder="Ciudad" value={form.ciudad} onChange={e=>setForm({...form, ciudad:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input placeholder="Dirección" value={form.direccion} onChange={e=>setForm({...form, direccion:e.target.value})} />
        <input placeholder="Teléfono" value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})} />
        <input placeholder="Fecha de nacimiento" value={form.fecha_nacimiento} onChange={e=>setForm({...form, fecha_nacimiento:e.target.value})} />
        <input placeholder="Dependencia" value={form.dependencia} onChange={e=>setForm({...form, dependencia:e.target.value})} />
        <div className="flex">
          <button className="btn" type="submit">{editing ? 'Actualizar' : 'Crear'}</button>
          {editing && <button className="btn secondary" onClick={()=>{setEditing(null); setForm(empty);}} type="button">Cancelar</button>}
        </div>
      </form>

      <h3>Listado</h3>
      {loading ? <p>Cargando...</p> : (
        <table>
          <thead><tr><th>ID</th><th>Cédula</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>Acciones</th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.id}</td>
                <td>{it.cedula}</td>
                <td>{it.nombre}</td>
                <td>{it.apellido}</td>
                <td>{it.email}</td>
                <td className="actions">
                  <button className="btn secondary" onClick={()=>edit(it)}>Editar</button>
                  <button className="btn" onClick={()=>del(it.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
