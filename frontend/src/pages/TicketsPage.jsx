import React, { useEffect, useState } from 'react';
import api from '../api';

const empty = { codigo:'', descripcion:'', id_tecnico:'', id_cliente:'', estado:'ABIERTO' };

export default function TicketsPage(){
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [clientes, setClientes] = useState([]);

  const load = async () => {
    setLoading(true);
    const [tks, cls, t] = await Promise.all([
      api.get('/technicians'),
      api.get('/clients'),
      api.get('/tickets')
    ]);
    setTecnicos(tks.data); setClientes(cls.data); setItems(t.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, id_tecnico: Number(form.id_tecnico), id_cliente: Number(form.id_cliente) };
    if (editing) await api.put(`/tickets/${editing}`, payload);
    else await api.post('/tickets', payload);
    setForm(empty); setEditing(null); load();
  };
  const edit = (it) => { setEditing(it.id); setForm({ ...it, id_tecnico: it.id_tecnico || it?.tecnico?.id, id_cliente: it.id_cliente || it?.cliente?.id }); };
  const del = async (id) => { if (confirm('¿Eliminar?')) { await api.delete(`/tickets/${id}`); load(); } };

  return (
    <div className="card">
      <h2>Tickets</h2>

      <form onSubmit={submit} className="grid">
        <input placeholder="Código" value={form.codigo} onChange={e=>setForm({...form, codigo:e.target.value})} />
        <input placeholder="Descripción" value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} />
        <select value={form.estado} onChange={e=>setForm({...form, estado:e.target.value})}>
          <option value="ABIERTO">ABIERTO</option>
          <option value="CERRADO">CERRADO</option>
        </select>
        <select value={form.id_tecnico} onChange={e=>setForm({...form, id_tecnico:e.target.value})}>
          <option value="">-- Selecciona Técnico --</option>
          {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>)}
        </select>
        <select value={form.id_cliente} onChange={e=>setForm({...form, id_cliente:e.target.value})}>
          <option value="">-- Selecciona Cliente --</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
        </select>
        <div className="flex">
          <button className="btn" type="submit">{editing ? 'Actualizar' : 'Crear'}</button>
          {editing && <button className="btn secondary" onClick={()=>{setEditing(null); setForm(empty);}} type="button">Cancelar</button>}
        </div>
      </form>

      <h3>Listado</h3>
      {loading ? <p>Cargando...</p> : (
        <table>
          <thead><tr><th>ID</th><th>Código</th><th>Estado</th><th>Técnico</th><th>Cliente</th><th>Acciones</th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.id}</td>
                <td>{it.codigo}</td>
                <td>{it.estado}</td>
                <td>{it?.tecnico ? `${it.tecnico.nombre} ${it.tecnico.apellido}` : it.id_tecnico}</td>
                <td>{it?.cliente ? `${it.cliente.nombre} ${it.cliente.apellido}` : it.id_cliente}</td>
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
