'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import Badge from '@/components/Badge';
import ExportButton from '@/components/ExportButton';

export default function DeviceRequestsPage() {
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [plate, setPlate] = useState('');

  const fetchData = () => {
    api.get(`/devices/requests?page=${page}&limit=20`).then(r => setData(r.data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleCreate = async () => {
    try {
      await api.post('/devices/requests', { plate });
      fetchData();
      setShowForm(false);
      setPlate('');
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Cihaz İstekleri</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Yeni İstek</button>
          <ExportButton type="device_requests" />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Plaka</label>
            <input type="text" value={plate} onChange={e => setPlate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" placeholder="34 XX 001" />
          </div>
          <button onClick={handleCreate} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Gönder</button>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plaka</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">İstek Durumu</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Sipariş Durumu</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Montaj Kodu</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((row: any) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2.5">{row.fleet_name}</td>
                <td className="px-4 py-2.5 font-medium">{row.plate}</td>
                <td className="px-4 py-2.5"><Badge value={row.request_status} /></td>
                <td className="px-4 py-2.5"><Badge value={row.order_status} /></td>
                <td className="px-4 py-2.5">{row.assembly_code}</td>
                <td className="px-4 py-2.5">{formatDateTime(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={20} onPageChange={setPage} />
      </div>
    </div>
  );
}
