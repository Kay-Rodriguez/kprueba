import React, { useEffect, useState } from 'react';
import api from '../api';

const empty = {
    cedula: '',
    nombre: '',
    apellido: '',
    ciudad: '',
    email: '',
    direccion: '',
    telefono: '',
    fecha_nacimiento: '',
    dependencia: ''
};

// Podrías traer esto desde /dependencias; por ahora, opciones estáticas
const dependenciaOptions = [
    'Administración',
    'Contabilidad',
    'Sistemas',
    'Recursos Humanos',
    'Ventas',
    'Compras',
    'Mantenimiento',
    'Académica',
];

export default function ClientsPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const load = async () => {
        setLoading(true);
        setErrMsg('');
        try {
            const { data } = await api.get('/clientes');
            setItems(data);
        } catch (e) {
            setErrMsg(e?.response?.data?.msg || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const buildPayload = (src) => {
        const p = { ...src };
        // Normaliza vacíos
        Object.keys(p).forEach(k => { if (p[k] === '') delete p[k]; });
        // Fecha -> ISO
        if (src.fecha_nacimiento) {
            p.fecha_nacimiento = new Date(src.fecha_nacimiento).toISOString();
        }
        return p;
    };

    const validate = (data) => {
        if (!data.cedula || !/^\d{10}$/.test(data.cedula)) return 'Cédula debe tener 10 dígitos.';
        if (!data.nombre?.trim()) return 'Nombre es requerido.';
        if (!data.email?.trim()) return 'Email es requerido.';
        if (!data.direccion?.trim()) return 'Dirección es requerida.';
        if (!data.telefono?.trim()) return 'Teléfono es requerido.';
        if (!data.fecha_nacimiento) return 'Fecha de nacimiento es requerida.';
        if (!data.dependencia?.trim()) return 'Dependencia es requerida.';
        return null;
        // (El schema también validará en el backend)
    };

    const submit = async (e) => {
        e.preventDefault();
        setErrMsg('');
        const err = validate(form);
        if (err) { setErrMsg(err); return; }

        try {
            const payload = buildPayload(form);
            if (editing) {
                await api.put(`/clientes/${editing}`, payload);
            } else {
                await api.post('/clientes', payload);
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
        const f = it.fecha_nacimiento
            ? new Date(it.fecha_nacimiento).toISOString().slice(0, 10)
            : '';
        setForm({
            cedula: it.cedula || '',
            nombre: it.nombre || '',
            apellido: it.apellido || '',
            ciudad: it.ciudad || '',
            email: it.email || '',
            direccion: it.direccion || '',
            telefono: it.telefono || '',
            fecha_nacimiento: f,
            dependencia: it.dependencia || '',
        });
    };

    const del = async (id) => {
        if (confirm('¿Eliminar?')) {
            await api.delete(`/clientes/${id}`);
            load();
        }
    };

    return (
        <div className="card">
            <h2>Clientes</h2>

            {errMsg && <p style={{ color: 'crimson' }}>{errMsg}</p>}

            <form onSubmit={submit} className="grid">
                <input
                    placeholder="cédula (10 dígitos)"
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    inputMode="numeric"
                    maxLength={10}
                />
                <input
                    placeholder="nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
                <input
                    placeholder="apellido"
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                />
                <input
                    placeholder="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    placeholder="teléfono"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
                <input
                    placeholder="ciudad"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                />
                <input
                    placeholder="dirección"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
                <select
                    value={form.dependencia}
                    onChange={(e) => setForm({ ...form, dependencia: e.target.value })}
                >
                    <option value="">Dependencia</option>
                    {dependenciaOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={form.fecha_nacimiento}
                    onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                />

                <div className="flex">
                    <button className="btn" type="submit">
                        {editing ? 'Actualizar' : 'Crear'}
                    </button>
                    {editing && (
                        <button
                            className="btn secondary"
                            type="button"
                            onClick={() => { setEditing(null); setForm(empty); }}
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
                                <th className="col-ciudad">Ciudad</th>
                                <th className="col-dep">Dependencia</th>
                                <th className="col-acciones">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(it => (
                                <tr key={it.id}>
                                    <td className="col-cedula">{it.cedula}</td>
                                    <td className="col-nombre">{it.nombre}</td>
                                    <td className="col-apellido">{it.apellido}</td>
                                    <td className="col-email td-ellipsis" title={it.email}>{it.email}</td>
                                    <td className="col-telefono">{it.telefono}</td>
                                    <td className="col-ciudad">{it.ciudad}</td>
                                    <td className="col-dep">{it.dependencia}</td>
                                    <td className="col-acciones actions">
                                        <button className="btn secondary" onClick={() => edit(it)}>Editar</button>
                                        <button className="btn" onClick={() => del(it.id)}>Eliminar</button>
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
