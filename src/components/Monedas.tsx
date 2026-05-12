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
  verificado: boolean;
}

const Monedas: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loadingTrans, setLoadingTrans] = useState(false);

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
        .order('fecha_hora_registro', { ascending: false });

      if (error) throw error;
      setTransacciones(data || []);
    } catch (error: any) {
      console.error("Error transacciones:", error.message);
    } finally {
      setLoadingTrans(false);
    }
  };

  const toggleVerificacion = async (id: string, estadoActual: boolean) => {
    try {
      const { error } = await supabase
        .from('transacciones')
        .update({ verificado: !estadoActual })
        .eq('id', id);

      if (error) throw error;

      setTransacciones(prev => 
        prev.map(t => t.id === id ? { ...t, verificado: !estadoActual } : t)
      );
    } catch (error: any) {
      alert("Error de permisos o conexión: " + error.message);
    }
  };

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
                </td>
                <td style={td}>
                  <span style={coinText}>🪙 {u.monedas || 0}</span>
                </td>
                <td style={td}>
                  <button onClick={() => fetchTransacciones(u)} style={btnHistory}>📜 Historial</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedUser && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, color: '#eab308' }}>Transacciones de {selectedUser.email}</h3>
              <button onClick={() => setShowModal(false)} style={btnClose}>&times;</button>
            </div>

            {loadingTrans ? <p style={{ textAlign: 'center' }}>Cargando...</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableMain}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                      <th style={thSmall}>Fecha</th>
                      <th style={thSmall}>Monto</th>
                      <th style={thSmall}>Estado / Verificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={tdSmall}>{new Date(t.fecha_hora_registro).toLocaleDateString()}</td>
                        <td style={tdSmall}>Bs. {t.monto_dinero}</td>
                        <td style={tdSmall}>
                          {/* ESTADO ACTUAL */}
                          <div style={{ 
                            color: t.estado === 'completado' ? '#4ade80' : '#f87171',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            marginBottom: '8px'
                          }}>
                            {t.estado?.toUpperCase() || 'PENDIENTE'}
                          </div>

                          {/* CAMPO VERIFICADO DEBAJO DEL ESTADO */}
                          <div style={{ 
                            background: '#111', 
                            padding: '8px', 
                            borderRadius: '5px', 
                            border: `1px solid ${t.verificado ? '#166534' : '#444'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <input 
                              type="checkbox" 
                              checked={t.verificado || false} 
                              onChange={() => toggleVerificacion(t.id, t.verificado)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '10px', color: t.verificado ? '#4ade80' : '#888' }}>
                              {t.verificado ? 'PAGO VERIFICADO' : 'SIN VERIFICAR'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
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

const containerStyle: React.CSSProperties = { padding: '20px', color: 'white', backgroundColor: '#000', minHeight: '100vh' };
const tableWrapper = { background: '#0a0a0a', borderRadius: '10px', border: '1px solid #222' };
const tableMain: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const headerRow = { background: '#111', textAlign: 'left' as 'left' };
const th = { padding: '15px', color: '#eab308', fontSize: '13px' };
const thSmall = { padding: '12px', color: '#666', fontSize: '11px' };
const td = { padding: '15px', borderBottom: '1px solid #1a1a1a' };
const tdSmall = { padding: '12px', fontSize: '13px' };
const rowStyle = { transition: 'background 0.2s' };
const coinText = { color: '#eab308', fontWeight: 'bold', fontSize: '16px' };
const btnHistory = { background: '#333', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: '#0a0a0a', padding: '25px', borderRadius: '15px', width: '600px', maxHeight: '85%', overflowY: 'auto', border: '1px solid #333' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const btnClose = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '30px' };

export default Monedas;