'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Badge from '@/components/Badge';

export default function AdminDashboardPage() {
  const [fleets, setFleets] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    api.get('/fleets').then(r => setFleets(r.data)).catch(() => {});
    api.get('/dashboard').then(r => setDashboard(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {dashboard?.adminSummary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Toplam Filo</p>
            <p className="text-3xl font-bold text-gray-800">{dashboard.adminSummary.totalFleets}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Aktif Filolar</p>
            <p className="text-3xl font-bold text-green-600">{dashboard.adminSummary.activeFleets}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Toplam Bakiye</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(dashboard.adminSummary.totalBalance)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Toplam Cihaz</p>
            <p className="text-3xl font-bold text-gray-800">{dashboard.adminSummary.totalDevices}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700">Tüm Filolar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Kod</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo Adı</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Yakıt Alımı</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ödeme</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Bakiye</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Limit</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Temsilci</th>
              </tr>
            </thead>
            <tbody>
              {fleets.map((f: any) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium">{f.fleet_code}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/fleets`} className="text-cyan-600 hover:underline">{f.fleet_name}</Link>
                  </td>
                  <td className="px-4 py-2.5"><Badge value={f.fuel_status} /></td>
                  <td className="px-4 py-2.5"><Badge value={f.payment_type} /></td>
                  <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(f.balance)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(f.defined_limit)}</td>
                  <td className="px-4 py-2.5">{f.sales_rep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
