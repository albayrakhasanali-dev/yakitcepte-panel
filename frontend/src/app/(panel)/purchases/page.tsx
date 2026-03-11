'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import ExportButton from '@/components/ExportButton';
import { useAuth } from '@/context/AuthContext';

export default function PurchasesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ city: '', plate: '', product: '', date_from: '', date_to: '' });

  const fetchData = () => {
    const params = new URLSearchParams({ page: page.toString(), limit: '20' });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/purchases?${params}`).then(r => setData(r.data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleFilter = () => { setPage(1); fetchData(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Alışlar</h1>
        <ExportButton type="purchases" fleetId={user?.fleet_id || undefined} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Şehir</label>
          <input type="text" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm w-32" placeholder="Ara..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Plaka</label>
          <input type="text" value={filters.plate} onChange={e => setFilters({...filters, plate: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm w-32" placeholder="Ara..." />
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1"></th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Şehir</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Plaka</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ürün</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Litre</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tutar</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tarih</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((row: any) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="w-1"><div className="w-1 h-10 bg-cyan-500 rounded-r" /></td>
                  <td className="px-4 py-2.5">{row.fleet_name}</td>
                  <td className="px-4 py-2.5">{row.city}</td>
                  <td className="px-4 py-2.5 font-medium">{row.plate}</td>
                  <td className="px-4 py-2.5"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{row.product}</span></td>
                  <td className="px-4 py-2.5 text-right">{formatNumber(row.litre)}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-2.5">{formatDate(row.purchase_date)}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/purchases/detail/${row.id}`} className="text-cyan-600 hover:underline text-xs">Detay</Link>
                  </td>
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
