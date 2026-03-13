import { Image, Users, Package, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCromos: 0,
    usuarios: 156,
    inventarios: 89,
    crecimiento: 23,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { count } = await supabase
      .from('cromos_info')
      .select('*', { count: 'exact', head: true });

    setStats(prev => ({ ...prev, totalCromos: count || 0 }));
  };

  const statCards = [
    {
      title: 'Total de Cromos',
      value: stats.totalCromos,
      icon: Image,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      title: 'Usuarios Activos',
      value: stats.usuarios,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      title: 'Inventarios',
      value: stats.inventarios,
      icon: Package,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      title: 'Crecimiento',
      value: `${stats.crecimiento}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Dashboard Principal</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-400/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
