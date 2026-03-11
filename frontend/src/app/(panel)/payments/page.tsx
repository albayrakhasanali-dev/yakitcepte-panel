'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import ExportButton from '@/components/ExportButton';
import { useAuth } from '@/context/AuthContext';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ description: '', payment_type: '', date_from: '', date_to: '' });

  const fetchData = () => {
    const params = new URLSearchParams({ page: page.toString(), limit: '20' });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/payments?${params}`).then(r => setData(r.data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleFilter = () => { setPage(1); fetchData(); };

  const typeColors: Record<string, string> = {
    'Banka Hareketi': 'bg-green-500',
    'Muhasebe': 'bg-gray-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Ödemeler</h1>
        <ExportButton type="payments" fleetId={user?.fleet_id || undefined} />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Açıklama</label>
          <input type="text" value={filters.description} onChange={e => setFilters({...filters, description: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm w-40" placeholder="Ara..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ödeme Tipi</label>
          <select value={filters.payment_type} onChange={e => setFilters({...filters, payment_type: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm">
            <option value="">Tümü</option>
            <option value="Banka Hareketi">Banka Hareketi</option>
            <option value="Muhasebe">Muhasebe</option>
          </select>
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
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Açıklama</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tutar</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ödeme Tarihi</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ödeme Tipi</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Kaynak</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((row: any) => (
                <tr key={row.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/payments/detail/${row.id}`}>
                  <td className="w-1"><div className={`w-1 h-10 rounded-r ${typeColors[row.payment_type] || 'bg-gray-300'}`} /></td>
                  <td className="px-4 py-2.5">{row.fleet_name}</td>
                  <td className="px-4 py-2.5 font-medium">{row.description}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-2.5">{formatDate(row.payment_date)}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs ${row.payment_type === 'Banka Hareketi' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{row.payment_type}</span></td>
                  <td className="px-4 py-2.5"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{row.source}</span></td>
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
