import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { CategorySummary } from '@/core/types/analytics';
import { formatCurrency } from '@/core/utils/currency';
import { PieChart, ChevronDown, ChevronRight, Layers } from 'lucide-react';

interface CategoryBreakdownProps {
  categories: CategorySummary[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  if (!categories || categories.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-8 text-center">
        <Layers className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-600">No expense records found for this period</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-600" />
            Category & Subcategory Breakdown
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any parent category to expand subcategory allocations
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 font-medium">
          {categories.length} categories
        </div>
      </CardHeader>

      <div className="space-y-3 pt-1">
        {categories.map((cat) => {
          const isExpanded = expandedCategories.has(cat.category);

          return (
            <div
              key={cat.category}
              className="border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-colors bg-white"
            >
              <div
                onClick={() => toggleCategory(cat.category)}
                className="flex items-center justify-between cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg leading-none shrink-0">
                    {cat.categoryEmoji || '📁'}
                  </span>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-slate-950 flex items-center gap-1.5">
                      <span>{cat.category}</span>
                      {cat.subcategories.length > 0 && (
                        <span className="text-slate-400">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 inline" /> : <ChevronRight className="w-3.5 h-3.5 inline" />}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {cat.count} transactions • {cat.subcategories.length} subcategories
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <div className="font-mono text-sm font-semibold text-slate-900">
                    {formatCurrency(cat.amount)}
                  </div>
                  <div className="font-mono text-xs text-slate-500">
                    {cat.percentage}% of spend
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                />
              </div>

              {/* Expanded Subcategories */}
              {isExpanded && cat.subcategories.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2 pl-7 animate-in fade-in duration-150">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.name}
                      className="flex items-center justify-between text-xs py-1 hover:bg-slate-50 px-2 rounded"
                    >
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span>{sub.name}</span>
                        <span className="text-[10px] text-slate-400">({sub.count})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {sub.percentage}%
                        </span>
                        <span className="font-mono font-medium text-slate-800">
                          {formatCurrency(sub.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
