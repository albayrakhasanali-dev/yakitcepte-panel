'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import ExportButton from '@/components/ExportButton';

export default function PrepaidLogsPage() {
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get(`/devices/prepaidlogs?page=${page}&limit=20`).then(r => setData(r.data)).catch(() => {});
  }, [page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Bakiye Yükleme Geçmişi</h1>
        <ExportButton type="devices" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kart Numarası</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Fiş No</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Değişim</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((row: any) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2.5">{row.fleet_name}</td>
                <td className="px-4 py-2.5 font-medium">{row.card_number}</td>
                <td className="px-4 py-2.5">{row.receipt_no}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(row.change_amount)}</td>
                <td className="px-4 py-2.5">{formatDate(row.log_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={20} onPageChange={setPage} />
      </div>
    </div>
  );
}
