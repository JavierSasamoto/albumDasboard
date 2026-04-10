import { Video as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, subtitle }: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-xl border border-yellow-500/20 p-6 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-500/30">
          <Icon className="text-yellow-400" size={24} />
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.positive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <h3 className="text-zinc-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
    </div>
  );
}
