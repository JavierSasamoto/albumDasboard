import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UsuarioAlbum {
  id: string;
  email: string;
  album_pasted: boolean[];
  monedas: number; // 💡 Añadido para controlar el saldo de canje
}

interface ItemInventario {
  cromo_nro: number;
  cantidad: number;
}

const TOTAL_CROMOS = 1470;
const COSTO_LLENADO = 15000;

const Albunes: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showInvModal, setShowInvModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioAlbum | null>(null);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null); // Bloqueo individual por usuario

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      // 💡 Se agrega 'monedas' al select para poder leer el saldo del usuario
      const { data, error } = await supabase.from('perfiles').select('id, email, album_pasted, monedas');
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error: any) {
      console.error("Error perfiles:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventario = async (userId: string) => {
    try {
      setLoadingInv(true);
      setInventario([]);

      const { data, error } = await supabase
        .from('inventarios')
        .select('cromo_id')
        .eq('user_id', userId);

      if (error) { console.error("Error Supabase Inventario:", error); return; }

      if (data && data.length > 0) {
        const conteo = data.reduce((acc: any, curr: any) => {
          const id = curr.cromo_id;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});

        const listaFormateada = Object.keys(conteo).map(id => ({
          cromo_nro: parseInt(id),
          cantidad: conteo[id],
        })).sort((a, b) => a.cromo_nro - b.cromo_nro);

        setInventario(listaFormateada);
      }
    } catch (error: any) {
      console.error("Excepción en fetchInventario:", error);
    } finally {
      setLoadingInv(false);
    }
  };

  // 🔥 NUEVA FUNCIÓN: Llenar todo el álbum validando monedas
  const manejarLlenadoCompleto = async (usuario: UsuarioAlbum) => {
    const monedasActuales = usuario.monedas || 0;

    if (monedasActuales < COSTO_LLENADO) {
      alert(`❌ Operación denegada. El usuario necesita al menos ${COSTO_LLENADO} monedas. Saldo actual: ${monedasActuales}`);
      return;
    }

    const confirmar = window.confirm(`¿Estás seguro de que deseas llenar el álbum completo de ${usuario.email}? Esto descontará ${COSTO_LLENADO} monedas.`);
    if (!confirmar) return;

    try {
      setLoadingAction(usuario.id);

      const nuevoAlbumCompleto = Array(TOTAL_CROMOS).fill(true);
      const nuevoSaldoMonedas = monedasActuales - COSTO_LLENADO;

      const { error } = await supabase
        .from('perfiles')
        .update({
          album_pasted: nuevoAlbumCompleto,
          monedas: nuevoSaldoMonedas
        })
        .eq('id', usuario.id);

      if (error) throw error;

      setUsuarios(prevUsuarios =>
        prevUsuarios.map(u =>
          u.id === usuario.id
            ? { ...u, album_pasted: nuevoAlbumCompleto, monedas: nuevoSaldoMonedas }
            : u
        )
      );

      const audio = new Audio("https://gmwwnjxglvzszsbasyra.supabase.co/storage/v1/object/public/sonidos/pfiltro.mp3");
      audio.play().catch(() => {});

      alert(`🎉 ¡Álbum completado con éxito! Se descontaron ${COSTO_LLENADO} monedas.`);
    } catch (error: any) {
      console.error("Error al llenar el álbum:", error.message);
      alert("Hubo un error al procesar el llenado automático.");
    } finally {
      setLoadingAction(null);
    }
  };

  const calcularEstadisticas = (pasted: boolean[]) => {
    const pegadas = pasted ? pasted.filter(item => item === true).length : 0;
    const porcentaje = ((pegadas / TOTAL_CROMOS) * 100).toFixed(1);
    return { pegadas, porcentaje };
  };

  const filtered = usuarios.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Estilo dinámico local para el botón de llenar
  const obtenerEstiloBotonLlenar = (habilitado: boolean) => ({
    background: habilitado ? '#ca8a04' : '#1e293b',
    color: habilitado ? '#fff' : '#64748b',
    border: `1px solid ${habilitado ? '#eab308' : '#334155'}`,
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: habilitado ? 'pointer' : 'not-allowed',
    fontSize: '12px',
    fontWeight: 'bold' as 'bold'
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ color: '#eab308', margin: 0 }}>📊 Seguimiento de Álbumes</h2>
        <input
          type="text"
          placeholder="Buscar coleccionista..."
          style={inputSearch}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={tableWrapper}>
        <table style={tableMain}>
          <thead>
            <tr style={headerRow}>
              <th style={th}>USUARIO / EMAIL</th>
              <th style={th}>MONEDAS</th>
              <th style={th}>PROGRESO</th>
              <th style={th}>PEGADAS</th>
              <th style={th}>RESTANTES</th>
              <th style={th}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={emptyMsg}>Cargando...</td></tr>
            ) : (
              filtered.map(u => {
                const { pegadas, porcentaje } = calcularEstadisticas(u.album_pasted);
                const tieneSuficiente = (u.monedas || 0) >= COSTO_LLENADO;
                
                return (
                  <tr key={u.id} style={rowStyle}>
                    <td style={td}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{u.email}</div>
                      <div style={{ fontSize: '10px', color: '#555' }}>ID: {u.id.slice(0, 18)}...</div>
                    </td>
                    <td style={td}>
                      <span style={{ fontWeight: 'bold', color: tieneSuficiente ? '#eab308' : '#64748b' }}>
                        🪙 {(u.monedas || 0).toLocaleString()}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={barContainer}>
                        <div style={barFill(Number(porcentaje))} />
                        <span style={barLabel}>{porcentaje}%</span>
                      </div>
                    </td>
                    <td style={td}><span style={badgeStyle('#4ade80')}>✅ {pegadas}</span></td>
                    <td style={td}><span style={badgeStyle('#ff4444')}>❌ {TOTAL_CROMOS - pegadas}</span></td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => { setSelectedUser(u); setShowAlbumModal(true); }} style={btnAlbum}>📖 Álbum</button>
                        <button onClick={() => { setSelectedUser(u); fetchInventario(u.id); setShowInvModal(true); }} style={btnInventory}>🎴 Bolsa</button>
                        
                        <button 
                          onClick={() => manejarLlenadoCompleto(u)}
                          disabled={loadingAction === u.id}
                          style={{
                            ...obtenerEstiloBotonLlenar(tieneSuficiente),
                            opacity: loadingAction === u.id ? 0.6 : 1
                          }}
                        >
                          {loadingAction === u.id ? '⚡...' : '🚀 Llenar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL MAPA DEL ÁLBUM */}
      {showAlbumModal && selectedUser && (
        <div style={modalOverlay} onClick={() => setShowAlbumModal(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3>Mapa Visual: {selectedUser.email}</h3>
              <button onClick={() => setShowAlbumModal(false)} style={btnClose}>&times;</button>
            </div>
            <div style={gridCromos}>
              {selectedUser.album_pasted?.map((pasted, index) => (
                <div key={index} style={cromoBox(pasted)} title={`Cromo #${index + 1}`}>
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL BOLSA DE CROMOS */}
      {showInvModal && selectedUser && (
        <div style={modalOverlay} onClick={() => setShowInvModal(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>🎴 Bolsa de Cromos: {selectedUser.email}</h3>
                {!loadingInv && (
                  <p style={{ color: '#555', fontSize: '11px', margin: '4px 0 0' }}>
                    {inventario.length} cromos distintos · {inventario.reduce((a, b) => a + b.cantidad, 0)} figuras en total
                  </p>
                )}
              </div>
              <button onClick={() => setShowInvModal(false)} style={btnClose}>&times;</button>
            </div>

            {loadingInv ? (
              <p style={{ textAlign: 'center', color: '#eab308', padding: '20px' }}>Cargando inventario...</p>
            ) : (
              <div style={gridCromos}>
                {Array.from({ length: TOTAL_CROMOS }, (_, index) => {
                  const nro = index + 1;
                  const item = inventario.find(i => i.cromo_nro === nro);
                  const tiene = !!item;
                  return (
                    <div
                      key={nro}
                      style={{
                        aspectRatio: '1/1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        background: tiene ? '#1e3a5f' : '#7f1d1d',
                        color: tiene ? '#93c5fd' : '#fca5a5',
                        border: `1px solid ${tiene ? '#3b82f6' : '#ef4444'}`,
                        borderRadius: '2px',
                        lineHeight: 1.2,
                      }}
                      title={tiene ? `Cromo #${nro} — x${item!.cantidad}` : `Cromo #${nro}`}
                    >
                      {nro}
                      {tiene && (
                        <span style={{ fontSize: '6px', color: '#bfdbfe' }}>
                          ({item!.cantidad})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS ORIGINALES ---
const containerStyle: React.CSSProperties = { padding: '20px', color: 'white' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const inputSearch = { background: '#000', border: '1px solid #333', color: 'white', padding: '10px', borderRadius: '5px', width: '300px' };
const tableWrapper = { background: '#111', borderRadius: '10px', border: '1px solid #222', overflow: 'hidden' };
const tableMain: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const headerRow = { background: '#0a0a0a', textAlign: 'left' as 'left' };
const th = { padding: '15px', color: '#eab308', fontSize: '12px', borderBottom: '2px solid #222' };
const td = { padding: '15px', borderBottom: '1px solid #1a1a1a' };
const rowStyle = { borderBottom: '1px solid #1a1a1a' };
const emptyMsg = { textAlign: 'center' as 'center', padding: '40px', color: '#666' };
const barContainer: React.CSSProperties = { width: '150px', height: '18px', background: '#222', borderRadius: '10px', position: 'relative', overflow: 'hidden', border: '1px solid #333' };
const barFill = (pct: number): React.CSSProperties => ({ width: `${pct}%`, height: '100%', background: pct > 80 ? '#4ade80' : pct > 40 ? '#eab308' : '#ff4444' });
const barLabel: React.CSSProperties = { position: 'absolute', width: '100%', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', top: '2px', color: 'white', textShadow: '1px 1px 1px black' };
const badgeStyle = (color: string) => ({ background: `${color}15`, color: color, padding: '4px 8px', borderRadius: '4px', border: `1px solid ${color}`, fontSize: '12px', fontWeight: 'bold' as 'bold' });
const btnAlbum = { background: '#166534', color: '#4ade80', border: '1px solid #4ade80', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px', fontWeight: 'bold' as 'bold' };
const btnInventory = { background: '#1e3a5f', color: '#60a5fa', border: '1px solid #3b82f6', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' as 'bold' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: '#0a0a0a', padding: '25px', borderRadius: '12px', width: '90%', maxHeight: '85%', overflowY: 'auto', border: '1px solid #333' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px' };
const btnClose = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '24px' };
const gridCromos: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))', gap: '3px' };

const cromoBox = (pasted: boolean): React.CSSProperties => ({
  aspectRatio: '1/1',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '8px', fontWeight: 'bold',
  background: pasted ? '#166534' : '#7f1d1d',
  color: pasted ? '#4ade80' : '#fca5a5',
  border: `1px solid ${pasted ? '#22c55e' : '#ef4444'}`,
  borderRadius: '2px',
});

const cromoBoxBolsa = (tiene: boolean): React.CSSProperties => ({
  aspectRatio: '1/1',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: '1px',
  background: tiene ? '#1e3a5f' : '#111',
  color: tiene ? '#93c5fd' : '#333',
  border: `1px solid ${tiene ? '#3b82f6' : '#222'}`,
  borderRadius: '2px',
  cursor: 'default',
});

export default Albunes;