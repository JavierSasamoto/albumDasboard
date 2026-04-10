import { useEffect, useState } from 'react';
import { Search, User, Phone, MapPin, Calendar, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  monedas: number;
  created_at: string;
  perfil_detalles?: {
    cedula_identidad: string;
    nombres: string;
    apellidos: string;
    whatsapp: string;
    ciudad: string;
    fecha_nacimiento: string;
  }[];
}

export default function Usuarios() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select(
        `
        *,
        perfil_detalles(*)
      `
      )
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data as any);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const detalles = user.perfil_detalles?.[0];
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      detalles?.nombres.toLowerCase().includes(searchLower) ||
      detalles?.apellidos.toLowerCase().includes(searchLower) ||
      detalles?.cedula_identidad.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-zinc-400">Administra los datos KYC de los usuarios</p>
      </div>

      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredUsers.map((user) => {
            const detalles = user.perfil_detalles?.[0];
            return (
              <div
                key={user.id}
                className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-6 hover:border-yellow-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <User className="text-yellow-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {detalles?.nombres} {detalles?.apellidos}
                      </h3>
                      <p className="text-sm text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-lg">
                      <Coins className="text-yellow-400" size={16} />
                      <span className="text-yellow-400 font-bold">
                        {user.monedas}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <User className="text-zinc-400" size={16} />
                    <span className="text-zinc-400">CI:</span>
                    <span className="text-white font-mono">
                      {detalles?.cedula_identidad || 'N/A'}
                    </span>
                  </div>

                  {detalles?.whatsapp && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="text-zinc-400" size={16} />
                      <span className="text-zinc-400">WhatsApp:</span>
                      <span className="text-white">{detalles.whatsapp}</span>
                    </div>
                  )}

                  {detalles?.ciudad && (
                    <div className="flex items-center space-x-3 text-sm">
                      <MapPin className="text-zinc-400" size={16} />
                      <span className="text-zinc-400">Ciudad:</span>
                      <span className="text-white">{detalles.ciudad}</span>
                    </div>
                  )}

                  {detalles?.fecha_nacimiento && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Calendar className="text-zinc-400" size={16} />
                      <span className="text-zinc-400">Nacimiento:</span>
                      <span className="text-white">
                        {new Date(
                          detalles.fecha_nacimiento
                        ).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-700">
                    <p className="text-xs text-zinc-500">
                      Registro:{' '}
                      {new Date(user.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto mb-4 text-zinc-600" size={48} />
            <p className="text-zinc-400">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  );
}
