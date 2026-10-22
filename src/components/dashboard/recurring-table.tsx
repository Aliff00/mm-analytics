import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecurringSubscriptionItem } from '@/core/types/analytics';
import { formatCurrency } from '@/core/utils/currency';
import { Repeat, CalendarClock, ShieldCheck } from 'lucide-react';

interface RecurringTableProps {
  subscriptions: RecurringSubscriptionItem[];
}

export function RecurringTable({ subscriptions }: RecurringTableProps) {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-8 text-center">
        <Repeat className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-600">No recurring subscriptions detected yet</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Once transactions spanning 2 or more months are imported, our heuristic detector will automatically identify monthly repeating bills.
        </p>
      </Card>
    );
  }

  const totalMonthlyRecurring = subscriptions.reduce((acc, item) => acc + item.averageAmount, 0);
  const totalAnnualRecurring = subscriptions.reduce((acc, item) => acc + item.estimatedAnnualCost, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-slate-600" />
            Detected Subscriptions & Recurring Bills
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-detected based on cross-month cadence and note consistency
          </p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div className="text-xs">
            <span className="text-slate-400">Total Run-rate: </span>
            <span className="font-mono font-semibold text-slate-900">
              {formatCurrency(totalMonthlyRecurring)}/mo
            </span>
            <span className="text-slate-400 text-[11px] ml-1">
              ({formatCurrency(totalAnnualRecurring)}/yr)
            </span>
          </div>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 font-medium">
              <th className="pb-2.5 font-medium">Subscription / Bill</th>
              <th className="pb-2.5 font-medium">Account & Category</th>
              <th className="pb-2.5 font-medium">Cadence</th>
              <th className="pb-2.5 font-medium text-right">Avg Amount</th>
              <th className="pb-2.5 font-medium text-right">Est. Annual Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscriptions.map((sub) => (
              <tr key={sub.key} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{sub.categoryEmoji || '🔄'}</span>
                    <div>
                      <div className="font-semibold text-slate-800">{sub.note}</div>
                      <div className="text-[11px] text-slate-400">
                        Observed in {sub.occurrences} months • Last: {sub.lastDate}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-slate-600">
                  <div>{sub.category}</div>
                  <div className="text-[11px] text-slate-400">{sub.account}</div>
                </td>
                <td className="py-2.5 pr-3">
                  <Badge variant="slate" size="sm">
                    <CalendarClock className="w-3 h-3 mr-0.5" />
                    {sub.cadence}
                  </Badge>
                </td>
                <td className="py-2.5 pr-3 text-right font-mono font-medium text-slate-900">
                  {formatCurrency(sub.averageAmount)}
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-slate-800">
                  {formatCurrency(sub.estimatedAnnualCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

