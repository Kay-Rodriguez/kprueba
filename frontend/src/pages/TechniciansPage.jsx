import React, { useEffect, useState } from 'react';
import api from '../api';

// Incluye cedula y usa string para fecha (controlado por <input type="date">)
const empty = {
    nombre: '',
    apellido: '',
    cedula: '',
    genero: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    email: '',
    fecha_nacimiento: ''
};

export default function TechniciansPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const load = async () => {
        setLoading(true);
        setErrMsg('');
        try {
            const { data } = await api.get('/tecnicos');
            setItems(data);
        } catch (e) {
            setErrMsg(e?.response?.data?.msg || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // Normaliza payload: convierte '' en undefined y la fecha a Date ISO
    const buildPayload = (src) => {
        const p = { ...src };
        Object.keys(p).forEach(k => { if (p[k] === '') delete p[k]; });
        if (src.fecha_nacimiento) {
            // Enviamos ISO para que Mongoose lo parsee bien
            p.fecha_nacimiento = new Date(src.fecha_nacimiento).toISOString();
        }
        return p;
    };

    const submit = async (e) => {
        e.preventDefault();
        setErrMsg('');
        try {
            const payload = buildPayload(form);
            if (editing) {
                await api.put(`/tecnicos/${editing}`, payload);
            } else {
                await api.post('/tecnicos', payload);
            }
            setForm(empty);
            setEditing(null);
            load();
        } catch (e) {
            setErrMsg(e?.response?.data?.msg || e.message);
        }
    };

    const edit = (it) => {
        setEditing(it.id);
        const f =
            it.fecha_nacimiento
                ? new Date(it.fecha_nacimiento).toISOString().slice(0, 10)
                : '';
        setForm({ ...empty, ...it, fecha_nacimiento: f });
    };

    const del = async (id) => {
        if (confirm('¿Eliminar?')) {
            await api.delete(`/tecnicos/${id}`);
            load();
        }
    };

    return (
        <div className="card">
            <h2>Técnicos</h2>

            {errMsg && <p style={{ color: 'crimson' }}>{errMsg}</p>}

            <form onSubmit={submit} className="grid">
                <input
                    placeholder="nombre"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                />
                <input
                    placeholder="apellido"
                    value={form.apellido}
                    onChange={e => setForm({ ...form, apellido: e.target.value })}
                />
                <input
                    placeholder="cedula"
                    value={form.cedula}
                    onChange={e => setForm({ ...form, cedula: e.target.value })}
                />
                <input
                    placeholder="email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <input
                    placeholder="telefono"
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                />
                <input
                    placeholder="ciudad"
                    value={form.ciudad}
                    onChange={e => setForm({ ...form, ciudad: e.target.value })}
                />
                <input
                    placeholder="direccion"
                    value={form.direccion}
                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                />
                <select
                    value={form.genero}
                    onChange={e => setForm({ ...form, genero: e.target.value })}
                >
                    <option value="">género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                </select>
                <input
                    type="date"
                    value={form.fecha_nacimiento}
                    onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })}
                />

                <div className="flex">
                    <button className="btn" type="submit">
                        {editing ? 'Actualizar' : 'Crear'}
                    </button>
                    {editing && (
                        <button
                            className="btn secondary"
                            type="button"
                            onClick={() => {
                                setEditing(null);
                                setForm(empty);
                            }}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <h3>Listado</h3>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="col-cedula">Cédula</th>
                                <th className="col-nombre">Nombre</th>
                                <th className="col-apellido">Apellido</th>
                                <th className="col-email">Email</th>
                                <th className="col-telefono">Teléfono</th>
                                <th className="col-acciones">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(it => (
                                <tr key={it.id}>
                                    <td className="col-cedula">{it.cedula}</td>
                                    <td className="col-nombre">{it.nombre}</td>
                                    <td className="col-apellido">{it.apellido}</td>
                                    <td className="col-email td-ellipsis" title={it.email}>
                                        {it.email}
                                    </td>
                                    <td className="col-telefono">{it.telefono}</td>
                                    <td className="col-acciones actions">
                                        <button className="btn secondary" onClick={() => edit(it)}>
                                            Editar
                                        </button>
                                        <button className="btn" onClick={() => del(it.id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

}
