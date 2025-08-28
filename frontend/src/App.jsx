import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Confirm from './pages/Confirm';
import Dashboard from './pages/Dashboard';
import TechniciansPage from './pages/TechniciansPage';
import ClientsPage from './pages/ClientsPage';
import TicketsPage from './pages/TicketsPage';
 import Forgot from './pages/Forgot';
import Reset from './pages/Reset';  

function Layout({ children }){
const { logout } = useAuth();
return (
<div className="container">
<div className="card" style={{marginTop:20}}>
<div className="flex" style={{justifyContent:'space-between',alignItems:'center'}}>
<div><b>caso de estudio 5</b></div>
<div className="nav">
<Link to="/dashboard">Inicio</Link>
<Link to="/technicians">Técnicos</Link>
<Link to="/clients">Clientes</Link>
<Link to="/tickets">Tickets</Link>
<button className="btn secondary" onClick={logout}>Salir</button>
</div>
</div>
</div>
<div style={{height:16}}/>
{children}
<div style={{height:24}}/>
<div className="card"><small>© 2025 prueba de fin de carrera Karla Rodriguez e Isaac Quinapallo.</small></div>
</div>
);
}


export default function App(){
return (
<AuthProvider>
<Routes>
<Route path="/" element={<Navigate to="/login" replace/>} />
<Route path="/login" element={<Login/>} />
<Route path="/register" element={<Register/>} />
<Route path="/confirm/:token" element={<Confirm/>} />

<Route path="/forgot" element={<Forgot />} />
<Route path="/reset/:token" element={<Reset />} />
<Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
<Route path="/technicians" element={<ProtectedRoute><Layout><TechniciansPage/></Layout></ProtectedRoute>} />
<Route path="/clients" element={<ProtectedRoute><Layout><ClientsPage/></Layout></ProtectedRoute>} />
<Route path="/tickets" element={<ProtectedRoute><Layout><TicketsPage/></Layout></ProtectedRoute>} />
<Route path="*" element={<div className="container"><div className="card">404</div></div>} />
</Routes>
</AuthProvider>
);
}