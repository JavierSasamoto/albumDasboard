import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRightLeft,
  Hash,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';

interface Transaccion {
  id: string;
  monto_dinero: number;
  cantidad_monedas: number;
  banco_origen: string;
  cuenta_origen: string;
  cuenta_destino: string;
  comprobante_url: string;
  referencia_bancaria: string;
  estado: string;
  fecha_hora_registro: string;
  transsaccion: string; 
  fecha_hora_comprobante: string;
}

const Banco: React.FC = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros: 'todos', 'pendiente', 'completado'
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busquedaRef, setBusquedaRef] = useState('');
  const [busquedaFecha, setBusquedaFecha] = useState('');

  useEffect(() => {
    fetchTransacciones();
  }, []);

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transacciones')
        .select('*')
        .order('fecha_hora_registro', { ascending: false });
      
      if (error) throw error;
      
      // Log para depuración (puedes verlo en la consola del navegador)
      console.log("Datos recibidos de Supabase:", data);
      setTransacciones(data || []);
    } catch (error: any) {
      console.error('Error cargando transacciones:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const extraerNombreLimpio = (texto: string) => {
    if (!texto) return "Remitente Desconocido";
    const lineas = texto.split(' - ');
    const indiceOrigen = lineas.findIndex(l => l.toUpperCase().includes('ORIGEN'));
    if (indiceOrigen !== -1 && lineas[indiceOrigen + 1]) {
      return lineas[indiceOrigen + 1].trim();
    }
    return lineas[0] || "Remitente Desconocido";
  };

  const getStatusStyle = (estado: string) => {
    const e = (estado || '').toLowerCase().trim();
    if (e === 'completado') {
      return { color: '#22c55e', icon: <CheckCircle2 size={16} />, bg: 'rgba(20, 83, 45, 0.4)' };
    }
    if (e === 'pendiente') {
      return { color: '#fbbf24', icon: <Clock size={16} />, bg: 'rgba(120, 53, 15, 0.4)' };
    }
    return { color: '#ef4444', icon: <AlertCircle size={16} />, bg: 'rgba(127, 29, 29, 0.4)' };
  };

  // --- FILTRADO POR COINCIDENCIA EXACTA ---
  const transaccionesFiltradas = transacciones.filter(tx => {
    const estadoDB = (tx.estado || '').toLowerCase().trim();
    
    // Coincidencia de Estado
    const coincideEstado = filtroEstado === 'todos' || estadoDB === filtroEstado;
    
    // Coincidencia de Referencia
    const refDB = (tx.referencia_bancaria || '').toLowerCase();
    const coincideRef = refDB.includes(busquedaRef.toLowerCase());
    
    // Coincidencia de Fecha
    const fechaDB = (tx.fecha_hora_comprobante || '').toLowerCase();
    const coincideFecha = fechaDB.includes(busquedaFecha.toLowerCase());

    return coincideEstado && coincideRef && coincideFecha;
  });

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '100px' }}>Cargando...</div>;

  return (
    <div style={{ padding: '20px', color: '#f1f5f9', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowRightLeft color="#fbbf24" /> Historial de Pagos
        </h1>
      </div>

      {/* BARRA DE FILTROS */}
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '35px', 
        background: '#1a2233', padding: '15px', borderRadius: '16px', border: '1px solid #2d3748' 
      }}>
        
        {/* Cápsulas de Estado */}
        <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '50px', gap: '4px' }}>
          {[
            { label: 'TODOS', value: 'todos' },
            { label: 'PENDIENTES', value: 'pendiente' },
            { label: 'COMPLETADOS', value: 'completado' }
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFiltroEstado(btn.value)}
              style={{
                border: 'none', padding: '8px 20px', borderRadius: '50px', cursor: 'pointer',
                fontSize: '11px', fontWeight: 'bold',
                background: filtroEstado === btn.value ? '#fbbf24' : 'transparent',
                color: filtroEstado === btn.value ? '#0f172a' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Buscador Referencia */}
        <div style={{ 
          display: 'flex', alignItems: 'center', background: '#0f172a', 
          padding: '8px 20px', borderRadius: '50px', border: '1px solid #334155', flex: '1', minWidth: '180px'
        }}>
          <Hash size={14} color="#64748b" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Referencia..." 
            value={busquedaRef}
            onChange={(e) => setBusquedaRef(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '13px', outline: 'none', width: '100%' }}
          />
        </div>

        {/* Buscador Fecha */}
        <div style={{ 
          display: 'flex', alignItems: 'center', background: '#0f172a', 
          padding: '8px 20px', borderRadius: '50px', border: '1px solid #334155', flex: '1', minWidth: '180px'
        }}>
          <Calendar size={14} color="#64748b" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Fecha..." 
            value={busquedaFecha}
            onChange={(e) => setBusquedaFecha(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '13px', outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {transaccionesFiltradas.length > 0 ? (
          transaccionesFiltradas.map((tx) => {
            const status = getStatusStyle(tx.estado);
            return (
              <div key={tx.id} style={{ background: '#1a2233', borderRadius: '14px', border: '1px solid #2d3748', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #2d3748' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Bs {tx.monto_dinero}</div>
                    <div style={{ 
                      backgroundColor: status.bg, color: status.color, padding: '4px 10px', 
                      borderRadius: '6px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' 
                    }}>
                      {status.icon} {tx.estado?.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '4px' }}>+ {tx.cantidad_monedas} Monedas</div>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ArrowUpCircle size={18} color="#ef4444" />
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>ORIGEN</div>
                      <div style={{ fontSize: '13px' }}>{extraerNombreLimpio(tx.transsaccion)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Hash size={18} color="#4a5568" />
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>REFERENCIA</div>
                      <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>{tx.referencia_bancaria || '---'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 20px', background: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#718096', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} /> {tx.fecha_hora_comprobante || 'S.N.'}
                  </div>
                  {tx.comprobante_url && (
                    <a href={tx.comprobante_url} target="_blank" rel="noreferrer" style={{
                      color: '#fbbf24', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid #fbbf24', padding: '3px 8px', borderRadius: '4px'
                    }}>TICKET</a>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', color: '#4a5568', border: '2px dashed #2d3748', borderRadius: '15px' }}>
            No hay transacciones registradas como "{filtroEstado}".
          </div>
        )}
      </div>
    </div>
  );
};

export default Banco;