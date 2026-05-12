import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Transaccion {
  id: string;
  monto_dinero: number;
  banco_origen: string;
  estado: string;
  verificado: boolean;
  fecha_hora_registro: string;
}

const Economico: React.FC = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransacciones();
  }, []);

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      // Traemos los datos filtrados directamente desde la consulta para mayor eficiencia
      const { data, error } = await supabase
        .from('transacciones')
        .select('id, monto_dinero, banco_origen, fecha_hora_registro, estado, verificado')
        .eq('estado', 'completado')
        .eq('verificado', true)
        .order('fecha_hora_registro', { ascending: false });

      if (error) throw error;
      setTransacciones(data || []);
    } catch (error: any) {
      console.error("Error cargando finanzas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // La suma ahora es directa sobre el array filtrado
  const totalRecaudado = transacciones.reduce((acc, t) => acc + (t.monto_dinero || 0), 0);

  return (
    <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* CARD DE RECAUDACIÓN TOTAL */}
      <div style={{ 
        background: 'linear-gradient(135deg, #111 0%, #000 100%)', 
        padding: '35px', 
        borderRadius: '20px', 
        border: '1px solid #eab308',
        marginBottom: '30px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(234, 179, 8, 0.15)'
      }}>
        <span style={{ fontSize: '13px', color: '#eab308', fontWeight: 'bold', letterSpacing: '2px' }}>
          RECAUDACIÓN TOTAL VERIFICADA
        </span>
        <h1 style={{ fontSize: '56px', margin: '10px 0', fontWeight: '900' }}>
          {totalRecaudado.toLocaleString('es-BO')} <span style={{ color: '#444', fontSize: '24px' }}>Bs.</span>
        </h1>
        <div style={{ display: 'inline-block', background: '#eab30822', color: '#eab308', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 'bold' }}>
          {transacciones.length} Comprobantes verificados
        </div>
      </div>

      {/* GRILLA SIMPLIFICADA */}
      <div style={{ background: '#111', borderRadius: '15px', overflow: 'hidden', border: '1px solid #222' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#1a1a1a', color: '#666', fontSize: '11px' }}>
              <th style={thStyle}>FECHA</th>
              <th style={thStyle}>INSTITUCIÓN</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>MONTO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#444' }}>Sincronizando con Tesorería...</td></tr>
            ) : transacciones.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#444' }}>No hay registros completados y verificados.</td></tr>
            ) : (
              transacciones.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #1a1a1a', transition: 'background 0.2s' }}>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{new Date(t.fecha_hora_registro).toLocaleDateString('es-BO')}</div>
                    <div style={{ fontSize: '10px', color: '#444' }}>{new Date(t.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={bankText}>{t.banco_origen || 'DEPÓSITO'}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#4ade80' }}>
                      {t.monto_dinero.toLocaleString('es-BO')} <span style={{ fontSize: '10px', opacity: 0.6 }}>Bs.</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- ESTILOS ---

const thStyle: React.CSSProperties = { 
  padding: '15px 20px', 
  fontWeight: '800', 
  letterSpacing: '1px',
  borderBottom: '1px solid #222' 
};

const tdStyle: React.CSSProperties = { 
  padding: '18px 20px' 
};

const bankText: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#e2e8f0',
  textTransform: 'uppercase'
};

export default Economico;