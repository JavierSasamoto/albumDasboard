import { useEffect, useState } from 'react';
import { FileText, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuditoriaLog } from '../types/database';

export default function Auditoria() {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('auditoria_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter !== 'all') {
      query = query.eq('tabla_afectada', filter);
    }

    const { data } = await query;

    if (data) setLogs(data);
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREAR') || action.includes('APROBAR'))
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (action.includes('ELIMINAR') || action.includes('RECHAZAR'))
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (action.includes('EDITAR') || action.includes('ACTUALIZAR'))
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Registro de Auditoría
        </h1>
        <p className="text-zinc-400">
          Historial completo de acciones administrativas
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <Filter className="text-zinc-400" size={20} />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
        >
          <option value="all">Todas las tablas</option>
          <option value="cromos_info">Cromos</option>
          <option value="transacciones_monedas">Transacciones</option>
          <option value="perfiles">Perfiles</option>
          <option value="trivia">Trivia</option>
          <option value="notificaciones">Notificaciones</option>
        </select>
      </div>

      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">
            Últimas 100 Acciones
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Fecha y Hora
                </th>
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Acción
                </th>
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Tabla Afectada
                </th>
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Registro ID
                </th>
                <th className="text-left py-4 px-6 text-zinc-400 font-medium">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-4 px-6 text-zinc-300 text-sm">
                    {new Date(log.created_at).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(
                        log.accion
                      )}`}
                    >
                      {log.accion}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white font-mono text-sm">
                    {log.tabla_afectada || '-'}
                  </td>
                  <td className="py-4 px-6 text-zinc-400 font-mono text-sm">
                    {log.registro_id?.substring(0, 8) || '-'}
                  </td>
                  <td className="py-4 px-6">
                    {log.detalle_cambio ? (
                      <details className="cursor-pointer">
                        <summary className="text-yellow-400 text-sm hover:text-yellow-300">
                          Ver detalles
                        </summary>
                        <pre className="mt-2 p-3 bg-zinc-800 rounded text-xs text-zinc-300 overflow-x-auto">
                          {JSON.stringify(log.detalle_cambio, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-zinc-500 text-sm">
                        Sin detalles
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto mb-4 text-zinc-600" size={48} />
              <p className="text-zinc-400">No hay registros de auditoría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
