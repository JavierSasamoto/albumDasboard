import { useEffect, useState } from 'react';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RankingUser {
  id: string;
  posicion: number;
  puntos_totales: number;
  cromos_completados: number;
  ultima_actualizacion: string;
  perfil?: {
    email: string;
    perfil_detalles?: {
      nombres: string;
      apellidos: string;
    }[];
  };
}

export default function Ranking() {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ranking_global')
      .select(
        `
        *,
        perfil:perfiles(
          email,
          perfil_detalles(nombres, apellidos)
        )
      `
      )
      .order('puntos_totales', { ascending: false })
      .limit(100);

    if (data) {
      const rankedData = data.map((item, index) => ({
        ...item,
        posicion: index + 1,
      }));
      setRankings(rankedData as any);
    }
    setLoading(false);
  };

  const getMedalColor = (position: number) => {
    if (position === 1) return 'from-yellow-400 to-yellow-600';
    if (position === 2) return 'from-zinc-300 to-zinc-400';
    if (position === 3) return 'from-amber-600 to-amber-800';
    return 'from-zinc-700 to-zinc-800';
  };

  const getMedalIcon = (position: number) => {
    if (position <= 3) return <Medal size={24} />;
    return <TrendingUp size={20} />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Ranking Global
        </h1>
        <p className="text-zinc-400">
          Tabla de posiciones de los mejores coleccionistas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rankings.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className={`bg-gradient-to-br ${getMedalColor(
              index + 1
            )} rounded-xl p-6 text-center transform hover:scale-105 transition-all`}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-black/30 rounded-full">
                {getMedalIcon(index + 1)}
              </div>
            </div>
            <p className="text-4xl font-bold mb-2">#{index + 1}</p>
            <p className="text-lg font-bold mb-1">
              {user.perfil?.perfil_detalles?.[0]?.nombres}{' '}
              {user.perfil?.perfil_detalles?.[0]?.apellidos}
            </p>
            <p className="text-sm opacity-80 mb-4">{user.perfil?.email}</p>
            <div className="flex justify-center space-x-6">
              <div>
                <p className="text-2xl font-bold">{user.puntos_totales}</p>
                <p className="text-xs opacity-80">Puntos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{user.cromos_completados}</p>
                <p className="text-xs opacity-80">Cromos</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">
            Tabla Completa de Posiciones
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Posición
                </th>
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Usuario
                </th>
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Puntos Totales
                </th>
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Cromos Completados
                </th>
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Última Actualización
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {user.posicion <= 3 ? (
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMedalColor(
                            user.posicion
                          )} flex items-center justify-center font-bold`}
                        >
                          {user.posicion}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">
                          {user.posicion}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-white font-medium">
                        {user.perfil?.perfil_detalles?.[0]?.nombres}{' '}
                        {user.perfil?.perfil_detalles?.[0]?.apellidos}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {user.perfil?.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-yellow-400 font-bold text-lg">
                      {user.puntos_totales}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-white font-medium">
                      {user.cromos_completados}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-zinc-400 text-sm">
                    {new Date(user.ultima_actualizacion).toLocaleDateString(
                      'es-ES'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
