import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UsuarioAlbum {
  id: string;
  email: string;
  album_pasted: boolean[];
}

interface ItemInventario {
  cromo_nro: number;
  cantidad: number;
}

const TOTAL_CROMOS = 1470;

const Albunes: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showInvModal, setShowInvModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioAlbum | null>(null);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('perfiles').select('id, email, album_pasted');
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
      
      console.log("Buscando inventario para UUID:", userId);

      // Filtramos por user_id (que es UUID en tu tabla)
      const { data, error } = await supabase
        .from('inventario')
        .select('cromo_id')
        .eq('user_id', userId);

      if (error) {
        console.error("Error Supabase Inventario:", error);
        return;
      }

      console.log("Datos recibidos de la tabla inventario:", data);

      if (data && data.length > 0) {
        const conteo = data.reduce((acc: any, curr: any) => {
          const id = curr.cromo_id;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});

        const listaFormateada = Object.keys(conteo).map(id => ({
          cromo_nro: parseInt(id),
          cantidad: conteo[id]
        })).sort((a, b) => a.cromo_nro - b.cromo_nro);

        setInventario(listaFormateada);
      } else {
        console.warn("No se encontraron filas para este user_id en la tabla inventario");
      }
    } catch (error: any) { 
      console.error("Excepción en fetchInventario:", error);
    } finally { 
      setLoadingInv(false); 
    }
  };

  const calcularEstadisticas = (pasted: boolean[]) => {
    const pegadas = pasted ? pasted.filter(item => item === true).length : 0;
    const porcentaje = ((pegadas / TOTAL_CROMOS) * 100).toFixed(1);
    return { pegadas, porcentaje };
  };

  const filtered = usuarios.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

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
              <th style={th}>PROGRESO</th>
              <th style={th}>PEGADAS</th>
              <th style={th}>RESTANTES</th>
              <th style={th}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={emptyMsg}>Cargando...</td></tr>
            ) : (
              filtered.map(u => {
                const { pegadas, porcentaje } = calcularEstadisticas(u.album_pasted);
                return (
                  <tr key={u.id} style={rowStyle}>
                    <td style={td}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{u.email}</div>
                      <div style={{ fontSize: '10px', color: '#555' }}>ID: {u.id.slice(0,18)}...</div>
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
                      <button onClick={() => { setSelectedUser(u); setShowAlbumModal(true); }} style={btnAlbum}>📖 Álbum</button>
                      <button onClick={() => { setSelectedUser(u); fetchInventario(u.id); setShowInvModal(true); }} style={btnInventory}>💰 Bolsa</button>
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

      {/* MODAL INVENTARIO (BOLSA) */}
      {showInvModal && (
        <div style={modalOverlay} onClick={() => setShowInvModal(false)}>
          <div style={modalContentSmall} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={{color: '#eab308'}}>💰 Inventario en Bolsa</h3>
              <button onClick={() => setShowInvModal(false)} style={btnClose}>&times;</button>
            </div>
            {loadingInv ? (
              <p style={{textAlign: 'center', color: '#eab308', padding: '20px'}}>Conectando con base de datos...</p>
            ) : (
              <div style={bagList}>
                {inventario.length > 0 ? (
                  inventario.map(item => (
                    <div key={item.cromo_nro} style={bagItem}>
                      <span style={{color: '#888'}}>#</span>{item.cromo_nro} 
                      <strong style={{color: '#eab308', marginLeft: '5px'}}>({item.cantidad})</strong>
                    </div>
                  ))
                ) : (
                  <div style={{textAlign:'center', width:'100%', padding: '20px'}}>
                    <p style={{color:'#666', margin:0}}>Bolsa vacía para este ID</p>
                    <p style={{fontSize:'10px', color:'#444'}}>Revisar RLS de tabla "inventario"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS ---
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
const btnInventory = { background: '#854d0e', color: '#eab308', border: '1px solid #eab308', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' as 'bold' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: '#0a0a0a', padding: '25px', borderRadius: '12px', width: '90%', maxHeight: '85%', overflowY: 'auto', border: '1px solid #333' };
const modalContentSmall: React.CSSProperties = { ...modalContent, width: '450px' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px' };
const btnClose = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '24px' };
const gridCromos: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))', gap: '3px' };
const cromoBox = (pasted: boolean): React.CSSProperties => ({ aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 'bold', background: pasted ? '#166534' : '#7f1d1d', color: pasted ? '#4ade80' : '#fca5a5', border: `1px solid ${pasted ? '#22c55e' : '#ef4444'}`, borderRadius: '2px' });
const bagList: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' };
const bagItem = { background: '#111', padding: '10px', borderRadius: '6px', textAlign: 'center' as 'center', border: '1px solid #333', fontSize: '14px' };

export default Albunes;