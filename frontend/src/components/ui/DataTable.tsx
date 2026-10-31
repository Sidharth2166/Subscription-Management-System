import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  pageSize?: number;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [density, setDensity] = useState<'normal' | 'compact'>('normal');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      return sortDirection === 'asc' ? 1 : -1;
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const rowPadding = density === 'compact' ? 'py-2.5 px-4' : 'py-3.5 px-5';

  return (
    <div className="w-full bg-card/60 border border-glass-border rounded-card overflow-hidden backdrop-blur-md">
      {/* Table header & density toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-glass-border/60 text-xs text-text-3">
        <span>Showing {paginatedData.length} of {data.length} entries</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDensity(density === 'compact' ? 'normal' : 'compact')}
            className="hover:text-neon transition-colors cursor-pointer"
          >
            Density: <span className="text-text-1 capitalize">{density}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-surface/80 text-[11px] font-bold uppercase tracking-wider text-text-2 border-b border-glass-border sticky top-0 z-10 backdrop-blur-md">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3 px-5 select-none ${
                    col.sortable ? 'cursor-pointer hover:text-neon transition-colors' : ''
                  } ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-text-3">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-neon" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-neon" />
                          )
                        ) : (
                          <div className="w-3.5 h-3.5 opacity-30 flex flex-col items-center">
                            <ChevronUp className="w-2 h-2 -mb-0.5" />
                            <ChevronDown className="w-2 h-2" />
                          </div>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-glass-border/40">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className={rowPadding}>
                      <div className="h-4 bg-surface rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-surface border border-glass-border flex items-center justify-center text-text-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-text-1 text-base">{emptyTitle}</p>
                    <p className="text-xs text-text-3 max-w-sm">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Rows
              paginatedData.map((item, index) => {
                const key = keyExtractor(item);
                return (
                  <motion.tr
                    key={key}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors duration-200 group ${
                      onRowClick ? 'cursor-pointer hover:bg-surface/60' : 'hover:bg-surface/30'
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${rowPadding} ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {col.render ? col.render(item) : (item as any)[col.key] ?? '—'}
                      </td>
                    ))}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-glass-border/60 text-xs">
          <span className="text-text-3">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-glass-border text-text-2 hover:text-white hover:border-glass-border-strong disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-glass-border text-text-2 hover:text-white hover:border-glass-border-strong disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
