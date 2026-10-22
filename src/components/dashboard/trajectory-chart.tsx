import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { TrajectoryPoint } from '@/core/types/analytics';
import { formatCurrency, formatCompactCurrency } from '@/core/utils/currency';
import { TrendingUp, Info } from 'lucide-react';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  totalBudget: number;
}

export function TrajectoryChart({ data, totalBudget }: TrajectoryChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Format custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: TrajectoryPoint = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
          <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1">
            Day {label} ({item.date})
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
              Actual Cumulative:
            </span>
            <span className="font-mono font-medium text-slate-900">
              {item.isPastOrToday ? formatCurrency(item.actualCumulativeSpend) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              Ideal Linear Target:
            </span>
            <span className="font-mono text-slate-700">
              {formatCurrency(item.idealLinearSpend)}
            </span>
          </div>
          {!item.isPastOrToday && (
            <div className="flex items-center justify-between text-indigo-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                Projected Spend:
              </span>
              <span className="font-mono font-medium">
                {formatCurrency(item.projectedSpend)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            Cumulative Spend Trajectory (Days 1–31)
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Real cumulative spend vs. ideal straight-line budget ceiling
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-900 rounded-full" />
            <span>Actual Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400" />
            <span>Ideal Linear Burn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500" />
            <span>Projected</span>
          </div>
        </div>
      </CardHeader>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `D${v}`}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCompactCurrency(v)}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Ideal Linear Burn Line */}
            <Line
              type="linear"
              dataKey="idealLinearSpend"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />

            {/* Projected Spend for future days */}
            <Line
              type="monotone"
              dataKey="projectedSpend"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />

            {/* Actual Spend Area + Line */}
            <Area
              type="monotone"
              dataKey="actualCumulativeSpend"
              fill="#f1f5f9"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 2, fill: '#0f172a' }}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

