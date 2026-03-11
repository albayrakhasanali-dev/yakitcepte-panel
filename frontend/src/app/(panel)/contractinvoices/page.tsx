'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import Badge from '@/components/Badge';

export default function ContractInvoicesPage() {
  const [data, setData] = useState<any>({ data: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get(`/admin/contractinvoices?page=${page}&limit=20`).then(r => setData(r.data)).catch(() => {});
  }, [page]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Fiyat Farkı Raporları</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kod</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Fatura Tarihi</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((row: any) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{row.code}</td>
                <td className="px-4 py-2.5">{row.fleet_name}</td>
                <td className="px-4 py-2.5">{formatDate(row.invoice_date)}</td>
                <td className="px-4 py-2.5"><Badge value={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={20} onPageChange={setPage} />
      </div>
    </div>
  );
}
