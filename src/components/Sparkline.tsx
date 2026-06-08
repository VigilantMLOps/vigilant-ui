import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useChartTheme } from '../context/ThemeContext';

interface SparklineProps {
  data: { time: string; value: number }[];
  color?: string;
  label: string;
  currentValue: string;
  unit?: string;
  status?: 'healthy' | 'warning' | 'critical';
}

const statusColors = {
  healthy: { stroke: '#34d399', fill: '#34d39920' },
  warning: { stroke: '#fbbf24', fill: '#fbbf2420' },
  critical: { stroke: '#f87171', fill: '#f8717120' },
};

export default function Sparkline({ data, label, currentValue, unit = '', status = 'healthy' }: SparklineProps) {
  const colors = statusColors[status];
  const { tooltipStyle } = useChartTheme();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1 dark:text-gray-100">
            {currentValue}<span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
        <div
          className="w-2 h-2 rounded-full mt-1"
          style={{ backgroundColor: colors.stroke }}
        />
      </div>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colors.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [`${v}${unit}`, label]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.stroke}
              fill={`url(#grad-${label})`}
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
