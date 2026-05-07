import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Transaccion {
  id: string;
  fecha_hora_registro: string;
  monto_dinero: number;
  cantidad_monedas: number;
  concepto: string;
  transsaccion: string;
  estado: string;
}

const Monedas: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loadingTrans, setLoadingTrans] = useState(false);

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('perfiles').select('id, email, monedas');
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error: any) { console.error(error.message); } 
    finally { setLoading(false); }
  };

  const fetchTransacciones = async (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
    setLoadingTrans(true);
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .select('*')
        .eq('perfil_id', user.id)
        .eq('estado', 'completado')
        .order('fecha_hora_registro', { ascending: false });

      if (error) throw error;
      setTransacciones(data || []);
    } catch (error: any) {
      console.error("Error transacciones:", error.message);
    } finally {
      setLoadingTrans(false);
    }
  };

  const aumentarMonedas = async (id: string, actuales: number) => {
    const nuevaCantidad = (actuales || 0) + 10;
    const { error } = await supabase.from('perfiles').update({ monedas: nuevaCantidad }).eq('id', id);
    if (!error) setUsuarios(usuarios.map(u => u.id === id ? { ...u, monedas: nuevaCantidad } : u));
  };

  // Lógica de filtrado por fecha en el cliente
  const transaccionesFiltradas = transacciones.filter(t => {
    const fechaReg = new Date(t.fecha_hora_registro).toISOString().split('T')[0];
    if (fechaInicio && fechaReg < fechaInicio) return false;
    if (fechaFin && fechaReg > fechaFin) return false;
    return true;
  });

  // Cálculos de totales filtrados
  const totalDinero = transaccionesFiltradas.reduce((acc, curr) => acc + (Number(curr.monto_dinero) || 0), 0);
  const totalMonedas = transaccionesFiltradas.reduce((acc, curr) => acc + (Number(curr.cantidad_monedas) || 0), 0);

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#eab308', marginBottom: '20px' }}>🪙 Panel de Monedas y Caja</h2>

      <div style={tableWrapper}>
        <table style={tableMain}>
          <thead>
            <tr style={headerRow}>
              <th style={th}>USUARIO</th>
              <th style={th}>SALDO</th>
              <th style={th}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} style={rowStyle}>
                <td style={td}>
                  <strong>{u.email}</strong>
                  <div style={{ fontSize: '10px', color: '#555' }}>ID: {u.id.slice(0, 8)}...</div>
                </td>
                <td style={td}>
                  <span style={coinText}>🪙 {u.monedas || 0}</span>
                </td>
                <td style={td}>
                  <button onClick={() => aumentarMonedas(u.id, u.monedas)} style={btnPlus}>+10</button>
                  <button onClick={() => fetchTransacciones(u)} style={btnHistory}>📜 Historial</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE HISTORIAL */}
      {showModal && selectedUser && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0 }}>Transacciones de {selectedUser.email}</h3>
              <button onClick={() => setShowModal(false)} style={btnClose}>&times;</button>
            </div>

            {/* FILTROS DE FECHA */}
            <div style={filterBar}>
              <div style={filterGroup}>
                <label style={labelStyle}>Desde:</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={inputDate} />
              </div>
              <div style={filterGroup}>
                <label style={labelStyle}>Hasta:</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={inputDate} />
              </div>
              <button onClick={() => { setFechaInicio(''); setFechaFin(''); }} style={btnReset}>Limpiar</button>
            </div>

            {/* RESUMEN DE TOTALES */}
            <div style={summaryCards}>
              <div style={card}>
                <span style={cardLabel}>TOTAL MONEDAS</span>
                <span style={cardValue}>🪙 {totalMonedas}</span>
              </div>
              <div style={card}>
                <span style={cardLabel}>TOTAL DINERO</span>
                <span style={cardValue}>Bs. {totalDinero.toFixed(2)}</span>
              </div>
            </div>

            {loadingTrans ? <p style={{ textAlign: 'center', padding: '20px' }}>Cargando...</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableMain}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                      <th style={thSmall}>Fecha</th>
                      <th style={thSmall}>Detalle</th>
                      <th style={thSmall}>Monedas</th>
                      <th style={thSmall}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaccionesFiltradas.length > 0 ? transaccionesFiltradas.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td style={tdSmall}>{new Date(t.fecha_hora_registro).toLocaleDateString()}</td>
                        <td style={tdSmall}>{t.concepto || t.transsaccion || 'Compra'}</td>
                        <td style={tdSmall}><span style={{color: '#eab308'}}>+{t.cantidad_monedas}</span></td>
                        <td style={tdSmall}>Bs. {t.monto_dinero}</td>
                      </tr>
                    )) : <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#666' }}>No hay resultados</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS ---
const containerStyle: React.CSSProperties = { padding: '20px', color: 'white', backgroundColor: '#000', minHeight: '100vh' };
const tableWrapper = { background: '#111', borderRadius: '10px', border: '1px solid #222', overflow: 'hidden' };
const tableMain: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const headerRow = { background: '#0a0a0a', textAlign: 'left' as 'left' };
const th = { padding: '15px', color: '#eab308', fontSize: '13px' };
const thSmall = { padding: '10px', color: '#888', fontSize: '11px' };
const td = { padding: '15px', borderBottom: '1px solid #1a1a1a' };
const tdSmall = { padding: '10px', fontSize: '12px' };
const rowStyle = { transition: 'background 0.2s' };
const coinText = { color: '#eab308', fontWeight: 'bold' as 'bold', fontSize: '16px' };

const btnPlus = { background: '#166534', color: '#4ade80', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', marginRight: '8px', fontWeight: 'bold' as 'bold' };
const btnHistory = { background: '#333', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' };

const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: '#0a0a0a', padding: '25px', borderRadius: '12px', width: '750px', maxHeight: '85%', overflowY: 'auto', border: '1px solid #333' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '15px' };
const btnClose = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '24px' };

const filterBar: React.CSSProperties = { display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '20px', background: '#111', padding: '15px', borderRadius: '8px' };
const filterGroup = { display: 'flex', flexDirection: 'column' as 'column', gap: '5px' };
const labelStyle = { fontSize: '11px', color: '#888', fontWeight: 'bold' as 'bold' };
const inputDate = { background: '#000', border: '1px solid #333', color: 'white', padding: '8px', borderRadius: '4px', fontSize: '12px' };
const btnReset = { background: 'transparent', color: '#666', border: '1px solid #333', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };

const summaryCards: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' };
const card: React.CSSProperties = { background: '#161b22', padding: '15px', borderRadius: '8px', border: '1px solid #30363d', display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center' };
const cardLabel = { fontSize: '10px', color: '#8b949e', marginBottom: '5px', fontWeight: 'bold' as 'bold' };
const cardValue = { fontSize: '20px', color: '#eab308', fontWeight: 'bold' as 'bold' };

export default Monedas;