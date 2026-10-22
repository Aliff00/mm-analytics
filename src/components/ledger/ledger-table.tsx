import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NormalizedTransaction } from '@/core/types/ledger';
import { formatCurrency } from '@/core/utils/currency';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface LedgerTableProps {
  transactions: NormalizedTransaction[];
}

export function LedgerTable({ transactions }: LedgerTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Extract distinct accounts & categories
  const accounts = useMemo(() => {
    const set = new Set<string>();
    for (const t of transactions) if (t.account) set.add(t.account);
    return Array.from(set).sort();
  }, [transactions]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const t of transactions) if (t.category) set.add(t.category);
    return Array.from(set).sort();
  }, [transactions]);

  // Filtering and Sorting
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'transfer' && !t.isTransfer) return false;
        if (typeFilter !== 'transfer' && (t.isTransfer || t.type !== typeFilter)) return false;
      }

      // Account filter
      if (accountFilter !== 'all' && t.account !== accountFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNote = t.note.toLowerCase().includes(query);
        const matchCat = t.category.toLowerCase().includes(query);
        const matchSub = t.subcategory.toLowerCase().includes(query);
        const matchAcc = t.account.toLowerCase().includes(query);
        if (!matchNote && !matchCat && !matchSub && !matchAcc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'date_desc') return b.timestamp - a.timestamp;
      if (sortOrder === 'date_asc') return a.timestamp - b.timestamp;
      if (sortOrder === 'amount_desc') return b.amount - a.amount;
      if (sortOrder === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchQuery, typeFilter, accountFilter, categoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Transaction Ledger
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredTransactions.length.toLocaleString()} matching records
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search note, payee, category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
          />
        </div>
      </CardHeader>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pb-3 mb-2 border-b border-slate-100 text-xs">
        {/* Type pills */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md">
          {(['all', 'expense', 'income', 'transfer'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setTypeFilter(mode);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                typeFilter === mode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Account select */}
        {accounts.length > 0 && (
          <select
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
          >
            <option value="all">All Accounts ({accounts.length})</option>
            {accounts.map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>
        )}

        {/* Category select */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

        {/* Sort order */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="ml-auto px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none"
        >
          <option value="date_desc">Date: Newest first</option>
          <option value="date_asc">Date: Oldest first</option>
          <option value="amount_desc">Amount: Highest first</option>
          <option value="amount_asc">Amount: Lowest first</option>
        </select>
      </div>

      {/* Ledger Table */}
      {paginatedTransactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No transactions match your current search or filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-medium">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Note / Merchant</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Account</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 pr-3 font-mono text-slate-500 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-2.5 pr-3 max-w-[240px]">
                    <div className="font-medium text-slate-800 truncate">
                      {tx.note || tx.categoryRaw || '—'}
                    </div>
                    {tx.isTransfer && (
                      <Badge variant="indigo" size="sm" className="mt-0.5">
                        Internal Transfer ({tx.transferDirection === 'in' ? 'Incoming' : 'Outgoing'})
                      </Badge>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{tx.categoryEmoji || '📁'}</span>
                      <span>{tx.category}</span>
                    </div>
                    {tx.subcategory && (
                      <div className="text-[10px] text-slate-400 pl-4">{tx.subcategory}</div>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600 whitespace-nowrap">
                    {tx.account}
                  </td>
                  <td className="py-2.5 text-right font-mono font-medium whitespace-nowrap">
                    <span
                      className={
                        tx.isTransfer
                          ? 'text-slate-500'
                          : tx.type === 'income'
                          ? 'text-emerald-600 font-semibold'
                          : 'text-slate-900'
                      }
                    >
                      {tx.type === 'income' ? '+' : tx.isTransfer ? '' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

