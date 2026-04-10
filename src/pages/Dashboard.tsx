import { useEffect, useState } from 'react';
import { DollarSign, Users, Image as ImageIcon, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import { supabase } from '../lib/supabase';

const RARITY_COLORS = {
  Común: '#71717a',
  Inusual: '#22c55e',
  Raro: '#3b82f6',
  Épico: '#a855f7',
  Legendario: '#f59e0b',
  Único: '#ef4444',
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalCromos: 0,
    pendingPayments: 0,
  });

  const [rarityDistribution, setRarityDistribution] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [transactionsRes, usersRes, cromosRes, rarityRes] = await Promise.all([
      supabase
        .from('transacciones_monedas')
        .select('monto_dinero, estado, fecha_hora')
        .eq('estado', 'exitoso'),
      supabase.from('perfiles').select('id', { count: 'exact', head: true }),
      supabase.from('cromos_info').select('id', { count: 'exact', head: true }),
      supabase.from('cromos_info').select('rareza'),
    ]);

    if (transactionsRes.data) {
      const total = transactionsRes.data.reduce(
        (sum, t) => sum + Number(t.monto_dinero),
        0
      );
      setStats((prev) => ({ ...prev, totalRevenue: total }));

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const revenueByDay = last7Days.map((date) => {
        const dayRevenue = transactionsRes.data
          .filter((t) => t.fecha_hora.startsWith(date))
          .reduce((sum, t) => sum + Number(t.monto_dinero), 0);
        return {
          date: new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
          }),
          revenue: dayRevenue,
        };
      });
      setRevenueData(revenueByDay);
    }

    const pendingCount = await supabase
      .from('transacciones_monedas')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'en curso');

    setStats((prev) => ({
      ...prev,
      totalUsers: usersRes.count || 0,
      totalCromos: cromosRes.count || 0,
      pendingPayments: pendingCount.count || 0,
    }));

    if (rarityRes.data) {
      const rarityCounts = rarityRes.data.reduce((acc: any, cromo) => {
        const rarity = cromo.rareza || 'Común';
        acc[rarity] = (acc[rarity] || 0) + 1;
        return acc;
      }, {});

      const rarityArray = Object.entries(rarityCounts).map(([name, value]) => ({
        name,
        value,
      }));
      setRarityDistribution(rarityArray);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">
          Resumen general del sistema de álbum de cromos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: '12%', positive: true }}
          subtitle="Últimos 30 días"
        />
        <StatCard
          title="Usuarios Registrados"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: '8%', positive: true }}
          subtitle="Total en plataforma"
        />
        <StatCard
          title="Cromos en Catálogo"
          value={stats.totalCromos}
          icon={ImageIcon}
          subtitle="Colección completa"
        />
        <StatCard
          title="Pagos Pendientes"
          value={stats.pendingPayments}
          icon={TrendingUp}
          subtitle="Requieren verificación"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Ingresos Últimos 7 Días
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #eab308',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#eab308"
                strokeWidth={3}
                dot={{ fill: '#eab308', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Distribución por Rareza
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rarityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {rarityDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={RARITY_COLORS[entry.name as keyof typeof RARITY_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #eab308',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Actividad Reciente
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
            >
              <div>
                <p className="text-white font-medium">
                  Nuevo usuario registrado
                </p>
                <p className="text-sm text-zinc-400">Hace {i} horas</p>
              </div>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                KYC
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
