import { useEffect, useState } from 'react';
import { Send, Bell, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Notificaciones() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'general',
    destinatario: 'todos',
    usuario_especifico: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('perfiles')
      .select(
        `
        id,
        email,
        perfil_detalles(nombres, apellidos)
      `
      )
      .order('email', { ascending: true });

    if (data) setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const notificaciones = [];

    if (formData.destinatario === 'todos') {
      for (const user of users) {
        notificaciones.push({
          perfil_id: user.id,
          titulo: formData.titulo,
          mensaje: formData.mensaje,
          tipo: formData.tipo,
          leido: false,
        });
      }
    } else {
      notificaciones.push({
        perfil_id: formData.usuario_especifico,
        titulo: formData.titulo,
        mensaje: formData.mensaje,
        tipo: formData.tipo,
        leido: false,
      });
    }

    await supabase.from('notificaciones').insert(notificaciones);

    await supabase.from('auditoria_log').insert({
      accion: 'ENVIAR_NOTIFICACION',
      tabla_afectada: 'notificaciones',
      detalle_cambio: {
        titulo: formData.titulo,
        destinatarios: formData.destinatario,
        cantidad: notificaciones.length,
      },
    });

    setFormData({
      titulo: '',
      mensaje: '',
      tipo: 'general',
      destinatario: 'todos',
      usuario_especifico: '',
    });

    alert(
      `Notificación enviada exitosamente a ${notificaciones.length} usuario(s)`
    );
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Sistema de Notificaciones
        </h1>
        <p className="text-zinc-400">
          Envía notificaciones a los usuarios de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              Nueva Notificación
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Destinatarios *
                </label>
                <select
                  required
                  value={formData.destinatario}
                  onChange={(e) =>
                    setFormData({ ...formData, destinatario: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="todos">Todos los usuarios</option>
                  <option value="especifico">Usuario específico</option>
                </select>
              </div>

              {formData.destinatario === 'especifico' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Seleccionar Usuario *
                  </label>
                  <select
                    required
                    value={formData.usuario_especifico}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usuario_especifico: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">Selecciona un usuario</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email} -{' '}
                        {user.perfil_detalles?.[0]?.nombres || 'Sin nombre'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tipo de Notificación *
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="general">General</option>
                  <option value="promocion">Promoción</option>
                  <option value="alerta">Alerta</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="Ej: Nueva actualización disponible"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Mensaje *
                </label>
                <textarea
                  required
                  value={formData.mensaje}
                  onChange={(e) =>
                    setFormData({ ...formData, mensaje: e.target.value })
                  }
                  placeholder="Escribe el mensaje de la notificación..."
                  rows={5}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50"
              >
                <Send size={20} />
                <span>{loading ? 'Enviando...' : 'Enviar Notificación'}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Users className="text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{users.length}</p>
                <p className="text-sm text-zinc-400">Usuarios Registrados</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Tipos de Notificación
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-zinc-300 text-sm">General</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-zinc-300 text-sm">Promoción</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-zinc-300 text-sm">Alerta</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-zinc-300 text-sm">Mantenimiento</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
            <Bell className="text-yellow-400 mb-3" size={32} />
            <h3 className="text-white font-bold mb-2">
              Notificaciones Push
            </h3>
            <p className="text-sm text-zinc-400">
              Las notificaciones se envían en tiempo real a través del sistema
              de la aplicación móvil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
