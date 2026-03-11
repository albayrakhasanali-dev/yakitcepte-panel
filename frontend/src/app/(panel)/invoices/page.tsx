'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import ExportButton from '@/components/ExportButton';
import Badge from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ invoice_no: '', date_from: '', date_to: '' });

  const fetchData = () => {
    const params = new URLSearchParams({ page: page.toString(), limit: '20' });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/invoices?${params}`).then(r => setData(r.data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleFilter = () => { setPage(1); fetchData(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Faturalar</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">Hepsini İndir</button>
          <ExportButton type="invoices" fleetId={user?.fleet_id || undefined} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fatura No</label>
          <input type="text" value={filters.invoice_no} onChange={e => setFilters({...filters, invoice_no: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm w-40" placeholder="Ara..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tarih Başlangıç</label>
          <input type="date" value={filters.date_from} onChange={e => setFilters({...filters, date_from: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tarih Bitiş</label>
          <input type="date" value={filters.date_to} onChange={e => setFilters({...filters, date_to: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <button onClick={handleFilter} className="px-4 py-1.5 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Filtrele</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1"></th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fatura No</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Ödenecek Tutar</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">KDV</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fatura Tarihi</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Vade</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tip</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((row: any) => (
                <tr key={row.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/invoices/detail/${row.id}`}>
                  <td className="w-1"><div className="w-1 h-10 bg-blue-500 rounded-r" /></td>
                  <td className="px-4 py-2.5">{row.fleet_name}</td>
                  <td className="px-4 py-2.5 font-medium text-cyan-600">{row.invoice_no}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(row.payable_amount)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(row.vat_amount)}</td>
                  <td className="px-4 py-2.5">{formatDate(row.invoice_date)}</td>
                  <td className="px-4 py-2.5">{formatDate(row.due_date)}</td>
                  <td className="px-4 py-2.5"><Badge value={row.invoice_type} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={20} onPageChange={setPage} />
      </div>
    </div>
  );
}
