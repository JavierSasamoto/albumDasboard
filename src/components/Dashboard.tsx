import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell 
} from 'recharts';

// Datos de ejemplo para las gráficas
const dataIngresos = [
  { name: 'Lun', total: 400 }, { name: 'Mar', total: 700 },
  { name: 'Mie', total: 500 }, { name: 'Jue', total: 900 },
  { name: 'Vie', total: 1200 }, { name: 'Sab', total: 1500 },
  { name: 'Dom', total: 1100 },
];

const dataAlbumes = [
  { name: 'Llenos', value: 85, color: '#FFD700' },
  { name: 'Al 50%', value: 320, color: '#FF8042' },
  { name: 'Vacíos', value: 150, color: '#999' },
];

const dataUsuarios = [
  { name: 'Sem 1', reg: 100, act: 80 },
  { name: 'Sem 2', reg: 150, act: 120 },
  { name: 'Sem 3', reg: 200, act: 160 },
];

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px' }}>📊 Dashboard General</h2>

      {/* --- FILA DE CAJAS (KPIs) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {[
          { label: 'Usuarios Reg.', val: '1,250', color: '#2196F3' },
          { label: 'Usuarios Activos', val: '430', color: '#4CAF50' },
          { label: 'Álbumes Llenos', val: '85', color: '#FFC107' },
          { label: 'Álbumes 50%', val: '320', color: '#FF5722' },
          { label: 'Álbumes Vacíos', val: '150', color: '#757575' },
          { label: 'Ingresos Hoy', val: '$1,200', color: '#00C49F' },
        ].map((item, i) => (
          <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: `5px solid ${item.color}` }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{item.label}</p>
            <h3 style={{ margin: '5px 0 0', fontSize: '1.5rem' }}>{item.val}</h3>
          </div>
        ))}
      </div>

      {/* --- SECCIÓN DE GRÁFICAS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
        
        {/* 1. Tendencia de Ingresos */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h4>Tendencia de Ingresos (Semanal)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dataIngresos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Estado de los Álbumes */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h4>Distribución de Álbumes</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={dataAlbumes} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {dataAlbumes.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Comparativa Usuarios */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h4>Usuarios: Registrados vs Activos</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataUsuarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reg" name="Registrados" fill="#2196F3" />
              <Bar dataKey="act" name="Activos" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;