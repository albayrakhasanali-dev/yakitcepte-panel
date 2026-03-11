'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState('2025');
  const [deviceGroupId, setDeviceGroupId] = useState('');
  const [showAmount, setShowAmount] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ year });
    if (user?.fleet_id) params.set('fleet_id', user.fleet_id.toString());
    if (deviceGroupId) params.set('device_group_id', deviceGroupId);
    api.get(`/dashboard?${params}`).then(r => setData(r.data)).catch(() => {});
  }, [year, deviceGroupId, user?.fleet_id]);

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gösterge Paneli</h1>
        <div className="flex gap-3">
          {data.deviceGroups?.length > 0 && (
            <select
              value={deviceGroupId}
              onChange={(e) => setDeviceGroupId(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Tüm Cihaz Grupları</option>
              {data.deviceGroups.map((dg: any) => (
                <option key={dg.id} value={dg.id}>{dg.name}</option>
              ))}
            </select>
          )}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Admin Summary */}
      {data.adminSummary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Toplam Filo</p>
            <p className="text-2xl font-bold text-gray-800">{data.adminSummary.totalFleets}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Aktif Filolar</p>
            <p className="text-2xl font-bold text-green-600">{data.adminSummary.activeFleets}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Toplam Bakiye</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.adminSummary.totalBalance)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">Toplam Cihaz</p>
            <p className="text-2xl font-bold text-gray-800">{data.adminSummary.totalDevices}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Bu Ay Litre</p>
          <p className="text-2xl font-bold text-cyan-700">{formatNumber(data.thisMonth.litres)} Lt</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Bu Ay Tutar</p>
          <p className="text-2xl font-bold text-cyan-700">{formatCurrency(data.thisMonth.amount)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Bu Yıl Litre</p>
          <p className="text-2xl font-bold text-gray-800">{formatNumber(data.thisYear.litres)} Lt</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Bu Yıl Tutar</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.thisYear.amount)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Aylık {showAmount ? 'TL' : 'Litre'} Tüketimi
          </h2>
          <button
            onClick={() => setShowAmount(!showAmount)}
            className="px-4 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors"
          >
            {showAmount ? 'Litre Göster' : 'TL Tüketimi'}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis />
            <Tooltip
              formatter={(value) => showAmount ? formatCurrency(Number(value)) : `${formatNumber(Number(value))} Lt`}
            />
            <Bar
              dataKey={showAmount ? 'amount' : 'litres'}
              fill="#0891b2"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
