'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/utils';
import Badge from '@/components/Badge';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/invoices/${id}`).then(r => setData(r.data)).catch(() => {});
  }, [id]);

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/invoices" className="text-cyan-600 hover:underline">&larr; Faturalar</Link>
          <h1 className="text-2xl font-bold text-gray-800">Fatura Detay</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Döküm</button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">Fatura</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500">ID</p>
            <p className="font-semibold">{data.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Filo Kodu</p>
            <p className="font-semibold">{data.fleet_code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Filo</p>
            <Link href="/fleets/show" className="text-cyan-600 hover:underline font-semibold">{data.fleet_name}</Link>
          </div>
          <div>
            <p className="text-xs text-gray-500">Cari Hesap</p>
            <Link href="/fleets/show" className="text-cyan-600 hover:underline font-semibold">{data.fleet_code}</Link>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ünvan</p>
            <p className="font-semibold">{data.company_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fatura No</p>
            <p className="font-semibold">{data.invoice_no}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">UUID</p>
            <p className="font-semibold text-xs">{data.uuid}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ETTN</p>
            <p className="font-semibold text-xs">{data.ettn}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ödenecek Tutar</p>
            <p className="font-semibold text-lg">{formatCurrency(data.payable_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Mal Hizmet Tutarı</p>
            <p className="font-semibold">{formatCurrency(data.service_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Miktar</p>
            <p className="font-semibold">{formatNumber(data.quantity)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">KDV</p>
            <p className="font-semibold">{formatCurrency(data.vat_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fatura Tarihi</p>
            <p className="font-semibold">{formatDate(data.invoice_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ödeme Tarihi</p>
            <p className="font-semibold">{formatDate(data.due_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">E-Fatura</p>
            <Badge value={data.e_invoice ? 'Evet' : 'Hayır'} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Fatura Tipi</p>
            <Badge value={data.invoice_type} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Zarf Durum Özeti</p>
            <Badge value={data.envelope_status} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Zarf Durumu</p>
            <Badge value={data.envelope_detail} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Kayıt Tarihi</p>
            <p className="font-semibold">{formatDateTime(data.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Kalemler</h3>
          <Link href="/purchases" className="px-3 py-1 bg-cyan-600 text-white rounded text-xs hover:bg-cyan-700">Satışlar</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Mal Hizmet</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Miktar</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Birim Fiyat</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">İskonto</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">KDV</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Hizmet Tutarı</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">KDV Matrahı</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item: any) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{item.product}</td>
                  <td className="px-4 py-2 text-right">{formatNumber(item.quantity)}</td>
                  <td className="px-4 py-2 text-right">₺{item.unit_price}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.discount)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.vat)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.service_amount)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.vat_base)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
