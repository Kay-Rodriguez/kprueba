import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';

const empty = { codigo:'', descripcion:'', id_tecnico:'', id_cliente:'', estado:'ABIERTO' };

export default function TicketsPage(){
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [errMsg, setErrMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setErrMsg('');
    try {
      const [tks, cls, t] = await Promise.all([
        api.get('/tecnicos'),
        api.get('/clientes'),
        api.get('/tickets') // ideal: que venga con populate
      ]);
      setTecnicos(clsAlphabet(cls.data));
      setClientes(clsAlphabet(cls.data)); // 👈 si prefieres, invierte: setClientes y setTecnicos por separado
      setTecnicos(tecAlphabet(tks.data));
      setItems(t.data);
    } catch (e) {
      setErrMsg(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{ load(); },[]);

  // Helpers de orden
  const tecAlphabet = (arr) =>
    [...arr].sort((a,b) => (a.nombre+a.apellido).localeCompare(b.nombre+b.apellido));
  const clsAlphabet = (arr) =>
    [...arr].sort((a,b) => (a.nombre+a.apellido).localeCompare(b.nombre+b.apellido));

  const validate = (data) => {
    if (!data.codigo?.trim()) return 'El código es requerido';
    if (!data.id_tecnico) return 'Selecciona un técnico';
    if (!data.id_cliente) return 'Selecciona un cliente';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrMsg('');
    const err = validate(form);
    if (err) { setErrMsg(err); return; }

    const payload = { ...form };
    try {
      if (editing) await api.put(`/tickets/${editing}`, payload);
      else        await api.post('/tickets', payload);
      setForm(empty);
      setEditing(null);
      load();
    } catch (e) {
      setErrMsg(e?.response?.data?.msg || e.message);
    }
  };

  const edit = (it) => {
    setEditing(it.id);
    setForm({
      codigo: it.codigo,
      descripcion: it.descripcion || '',
      estado: it.estado,
      id_tecnico: it.id_tecnico?.id || it.id_tecnico, // soporta poblado o id plano
      id_cliente: it.id_cliente?.id || it.id_cliente
    });
  };

  const del = async (id) => {
    if (confirm('¿Eliminar?')) {
      await api.delete(`/tickets/${id}`);
      load();
    }
  };

  const badgeClass = (estado) => {
    switch (estado) {
      case 'ABIERTO':     return 'badge badge-open';
      case 'EN_PROCESO':  return 'badge badge-progress';
      case 'CERRADO':     return 'badge badge-closed';
      default:            return 'badge';
    }
  };

  return (
    <div className="card">
      <h2>Tickets</h2>

      {errMsg && <p style={{ color: 'crimson' }}>{errMsg}</p>}

      <form onSubmit={submit} className="grid">
        <input
          placeholder="Código"
          value={form.codigo}
          onChange={e=>setForm({...form, codigo:e.target.value})}
        />
        <textarea
          placeholder="Descripción"
          value={form.descripcion}
          onChange={e=>setForm({...form, descripcion:e.target.value})}
          rows={2}
          style={{resize:'vertical'}}
        />
        <select
          value={form.estado}
          onChange={e=>setForm({...form, estado:e.target.value})}
        >
          {['ABIERTO','EN_PROCESO','CERRADO'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={form.id_tecnico}
          onChange={e=>setForm({...form, id_tecnico:e.target.value})}
        >
          <option value="">-- Selecciona Técnico --</option>
          {tecnicos.map(t => (
            <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
          ))}
        </select>

        <select
          value={form.id_cliente}
          onChange={e=>setForm({...form, id_cliente:e.target.value})}
        >
          <option value="">-- Selecciona Cliente --</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
          ))}
        </select>

        <div className="flex">
          <button className="btn" type="submit">{editing? 'Actualizar':'Crear'}</button>
          {editing && (
            <button className="btn secondary" type="button"
              onClick={()=>{ setEditing(null); setForm(empty); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3>Listado</h3>
      {loading ? <p>Cargando...</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="col-codigo">Código</th>
                <th className="col-estado">Estado</th>
                <th className="col-tec">Técnico</th>
                <th className="col-cli">Cliente</th>
                <th className="col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => {
                const tec = it.id_tecnico;
                const cli = it.id_cliente;
                return (
                  <tr key={it.id}>
                    <td className="col-codigo">{it.codigo}</td>
                    <td className="col-estado">
                      <span className={badgeClass(it.estado)}>{it.estado}</span>
                    </td>
                    <td className="col-tec">
                      {tec?.nombre} {tec?.apellido}
                    </td>
                    <td className="col-cli">
                      {cli?.nombre} {cli?.apellido}
                    </td>
                    <td className="col-acciones actions">
                      <button className="btn secondary" onClick={()=>edit(it)}>Editar</button>
                      <button className="btn" onClick={()=>del(it.id)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
