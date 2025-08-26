import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';


export default function Dashboard(){
const { user } = useAuth();
return (
<div className="card">
<h2>Bienvenido - {user?.nombre} {user?.apellido}</h2>
<p>Selecciona un módulo:</p>
<div className="flex">
<Link className="btn" to="/technicians">Técnicos</Link>
<Link className="btn" to="/clients">Clientes</Link>
<Link className="btn" to="/tickets">Tickets</Link>
</div>
</div>
);
}