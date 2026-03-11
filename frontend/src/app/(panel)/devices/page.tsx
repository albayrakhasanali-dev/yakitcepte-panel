'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Pagination from '@/components/Pagination';
import ExportButton from '@/components/ExportButton';
import Badge from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';

export default function DevicesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ plate: '', device_number: '', status: '' });

  const fetchData = () => {
    const params = new URLSearchParams({ page: page.toString(), limit: '20' });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/devices?${params}`).then(r => setData(r.data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleFilter = () => { setPage(1); fetchData(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Cihazlar</h1>
        <ExportButton type="devices" fleetId={user?.fleet_id || undefined} />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Cihaz No</label>
          <input type="text" value={filters.device_number} onChange={e => setFilters({...filters, device_number: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm w-32" placeholder="Ara..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Plaka</label>
          <input type="text" value={filters.plate} onChange={e => setFilters({...filters, plate: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm w-32" placeholder="Ara..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Durum</label>
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm">
            <option value="">Tümü</option>
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
          </select>
        </div>
        <button onClick={handleFilter} className="px-4 py-1.5 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Filtrele</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Grup</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Cihaz No</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Plaka</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Davranış</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((row: any) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2.5">{row.fleet_name}</td>
                  <td className="px-4 py-2.5">{row.group_name}</td>
                  <td className="px-4 py-2.5 font-medium">{row.device_number}</td>
                  <td className="px-4 py-2.5 font-medium">{row.plate}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">{row.limit_behaviour}</td>
                  <td className="px-4 py-2.5"><Badge value={row.status} /></td>
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
