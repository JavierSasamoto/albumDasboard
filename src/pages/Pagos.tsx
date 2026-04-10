import { useEffect, useState } from 'react';
import { Check, X, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Transaccion } from '../types/database';

interface TransactionWithUser extends Transaccion {
  perfil?: {
    email: string;
    perfil_detalles?: {
      nombres: string;
      apellidos: string;
      cedula_identidad: string;
    }[];
  };
}

export default function Pagos() {
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [filter, setFilter] = useState<'en curso' | 'exitoso' | 'rechazado'>('en curso');
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithUser | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transacciones_monedas')
      .select(
        `
        *,
        perfil:perfiles!inner(
          email,
          perfil_detalles(nombres, apellidos, cedula_identidad)
        )
      `
      )
      .eq('estado', filter)
      .order('fecha_hora', { ascending: false });

    if (data) {
      setTransactions(data as any);
    }
    setLoading(false);
  };

  const handleApprove = async (transaction: TransactionWithUser) => {
    if (
      !confirm(
        `¿Aprobar pago de $${transaction.monto_dinero} para ${transaction.cantidad_monedas} monedas?`
      )
    )
      return;

    setLoading(true);

    const { error: updateError } = await supabase
      .from('transacciones_monedas')
      .update({ estado: 'exitoso' })
      .eq('id', transaction.id);

    if (!updateError) {
      const { data: currentProfile } = await supabase
        .from('perfiles')
        .select('monedas')
        .eq('id', transaction.perfil_id)
        .single();

      if (currentProfile) {
        await supabase
          .from('perfiles')
          .update({
            monedas: currentProfile.monedas + transaction.cantidad_monedas,
          })
          .eq('id', transaction.perfil_id);
      }

      await supabase.from('auditoria_log').insert({
        accion: 'APROBAR_PAGO',
        tabla_afectada: 'transacciones_monedas',
        registro_id: transaction.id,
        detalle_cambio: {
          monto: transaction.monto_dinero,
          monedas: transaction.cantidad_monedas,
          perfil_id: transaction.perfil_id,
        },
      });
    }

    await loadTransactions();
    setSelectedTransaction(null);
    setLoading(false);
  };

  const handleReject = async (transaction: TransactionWithUser) => {
    if (
      !confirm(
        `¿Rechazar pago de $${transaction.monto_dinero}? Esta acción no se puede deshacer.`
      )
    )
      return;

    setLoading(true);

    await supabase
      .from('transacciones_monedas')
      .update({ estado: 'rechazado' })
      .eq('id', transaction.id);

    await supabase.from('auditoria_log').insert({
      accion: 'RECHAZAR_PAGO',
      tabla_afectada: 'transacciones_monedas',
      registro_id: transaction.id,
      detalle_cambio: {
        monto: transaction.monto_dinero,
        perfil_id: transaction.perfil_id,
      },
    });

    await loadTransactions();
    setSelectedTransaction(null);
    setLoading(false);
  };

  const getStatusBadge = (estado: string) => {
    const styles = {
      'en curso': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      exitoso: 'bg-green-500/20 text-green-400 border-green-500/30',
      rechazado: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[estado as keyof typeof styles];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Gestión de Pagos
        </h1>
        <p className="text-zinc-400">
          Verifica y procesa las transacciones bancarias
        </p>
      </div>

      <div className="flex space-x-4">
        {(['en curso', 'exitoso', 'rechazado'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {status === 'en curso' && 'Pendientes'}
            {status === 'exitoso' && 'Aprobados'}
            {status === 'rechazado' && 'Rechazados'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6 hover:border-yellow-500/40 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                      transaction.estado
                    )}`}
                  >
                    {transaction.estado.toUpperCase()}
                  </span>
                  <span className="text-zinc-400 text-sm">
                    {new Date(transaction.fecha_hora).toLocaleString('es-ES')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Usuario</p>
                    <p className="text-white font-medium">
                      {transaction.perfil?.perfil_detalles?.[0]?.nombres}{' '}
                      {transaction.perfil?.perfil_detalles?.[0]?.apellidos}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {transaction.perfil?.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Monto</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      ${Number(transaction.monto_dinero).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Monedas</p>
                    <p className="text-xl font-bold text-white">
                      {transaction.cantidad_monedas}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Banco</p>
                    <p className="text-white font-medium">
                      {transaction.banco_origen || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">
                      Referencia Bancaria
                    </p>
                    <p className="text-white font-mono text-sm">
                      {transaction.referencia_bancaria || 'Sin referencia'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-1">
                      Cuenta Origen
                    </p>
                    <p className="text-white font-mono text-sm">
                      {transaction.cuenta_origen || 'N/A'}
                    </p>
                  </div>
                </div>

                {transaction.comprobante_url && (
                  <div className="mt-4">
                    <a
                      href={transaction.comprobante_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm font-medium">
                        Ver Comprobante
                      </span>
                    </a>
                  </div>
                )}
              </div>

              {filter === 'en curso' && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleApprove(transaction)}
                    disabled={loading}
                    className="p-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => handleReject(transaction)}
                    disabled={loading}
                    className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
            <Clock className="mx-auto mb-4 text-zinc-600" size={48} />
            <p className="text-zinc-400 text-lg">
              No hay transacciones {filter === 'en curso' ? 'pendientes' : filter}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
