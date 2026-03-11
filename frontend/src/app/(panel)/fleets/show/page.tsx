'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import Badge from '@/components/Badge';

export default function FleetShowPage() {
  const { user } = useAuth();
  const [fleet, setFleet] = useState<any>(null);

  useEffect(() => {
    if (user?.fleet_id) {
      api.get(`/fleets/${user.fleet_id}`).then(r => setFleet(r.data)).catch(() => {});
    } else if (user?.role === 'admin') {
      api.get('/fleets').then(r => {
        if (r.data.length > 0) {
          api.get(`/fleets/${r.data[0].id}`).then(r2 => setFleet(r2.data));
        }
      }).catch(() => {});
    }
  }, [user]);

  if (!fleet) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Filo Özet</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">İşlemler</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Erişim</button>
        </div>
      </div>

      {/* Fleet Info Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-500">ID</p>
            <p className="font-semibold">{fleet.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Filo Adı</p>
            <p className="font-semibold">{fleet.fleet_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Yakıt Alımı</p>
            <Badge value={fleet.fuel_status} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Ödeme Şekli</p>
            <Badge value={fleet.payment_type} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Bakiye</p>
            <p className="font-semibold">{formatCurrency(fleet.balance)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Net Bakiye</p>
            <p className="font-semibold">{formatCurrency(fleet.net_balance)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Muhasebeleşmiş Bakiye</p>
            <p className="font-semibold">{formatCurrency(fleet.accounted_balance)} <Link href="/invoices" className="text-cyan-600 text-xs hover:underline">Ekstre</Link></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">İrsaliye</p>
            <p className="font-semibold">{formatCurrency(fleet.waybill)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Net İrsaliye</p>
            <p className="font-semibold">{formatCurrency(fleet.net_waybill)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tanımlı Limit</p>
            <p className="font-semibold">{formatCurrency(fleet.defined_limit)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Kalan Limit</p>
            <p className="font-semibold">{formatCurrency(fleet.remaining_limit)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Satış Temsilcisi</p>
            <p className="font-semibold">{fleet.sales_rep || '-'}</p>
          </div>
        </div>
      </div>

      {/* 4 Tables Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Credit Limits */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700">Kredi Limitleri</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">İsim</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Tip</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Tutar</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {fleet.creditLimits?.map((cl: any) => (
                <tr key={cl.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{cl.name}</td>
                  <td className="px-4 py-2">{cl.type}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(cl.amount)}</td>
                  <td className="px-4 py-2"><Badge value={cl.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Son Ödemeler</h3>
            <Link href="/payments" className="text-cyan-600 text-xs hover:underline">Tüm Ödemeler</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">İsim</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Tutar</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Giriş Tarihi</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Ödeme Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {fleet.recentPayments?.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{p.description}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-2">{formatDate(p.announcement_date)}</td>
                  <td className="px-4 py-2">{formatDate(p.payment_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Consumption History */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Yakıt Alımı Geçmişi</h3>
            <Link href="/purchases" className="text-cyan-600 text-xs hover:underline">Tüm Yakıt Alımları</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Ay</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Litre</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Değişim %</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Brüt Tutar</th>
              </tr>
            </thead>
            <tbody>
              {fleet.consumption?.map((c: any) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(c.year_month)}</td>
                  <td className="px-4 py-2 text-right">{formatNumber(c.total_litres)}</td>
                  <td className="px-4 py-2 text-right">
                    <Badge value={`${c.change_pct > 0 ? '+' : ''}${c.change_pct}%`} color={c.change_pct >= 0 ? 'green' : 'red'} />
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(c.gross_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t bg-gray-50 text-sm text-gray-600">
            Son 12 Ay: {formatNumber(fleet.totalLitres12)} Lt
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Son Faturalar</h3>
            <Link href="/invoices" className="text-cyan-600 text-xs hover:underline">Tüm Faturalar</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Fatura No</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Tutar</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Tarih</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Vade</th>
              </tr>
            </thead>
            <tbody>
              {fleet.recentInvoices?.map((inv: any) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/invoices/detail/${inv.id}`} className="text-cyan-600 hover:underline">{inv.invoice_no}</Link>
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(inv.payable_amount)}</td>
                  <td className="px-4 py-2">{formatDate(inv.invoice_date)}</td>
                  <td className="px-4 py-2">{formatDate(inv.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
