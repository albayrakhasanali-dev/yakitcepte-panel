'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import Badge from '@/components/Badge';

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/purchases/${id}`).then(r => setData(r.data)).catch(() => {});
  }, [id]);

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full" /></div>;

  const fields = [
    { label: 'ID', value: data.id },
    { label: 'Ana Filo Kodu', value: data.fleet_code },
    { label: 'Filo', value: data.fleet_name },
    { label: 'Şehir', value: data.city },
    { label: 'İstasyon', value: data.station_name },
    { label: 'İstasyon Kodu', value: data.station_code },
    { label: 'Cihaz Grupları', value: data.device_group_name, badge: true },
    { label: 'Plaka', value: data.plate, link: '/devices' },
    { label: 'Cihaz Numarası', value: data.device_number },
    { label: 'Ürün', value: data.product, badge: true, color: 'green' },
    { label: 'Litre', value: formatNumber(data.litre) },
    { label: 'Birim Fiyat', value: `₺${data.unit_price}` },
    { label: 'Tutar', value: formatCurrency(data.amount) },
    { label: 'İskontolu Tutar', value: formatCurrency(data.discounted_amount) },
    { label: 'KDV Oranı', value: `%${data.vat_rate}` },
    { label: 'İskonto', value: `%${data.discount_rate}` },
    { label: 'Distribütör Kodu ID', value: data.id },
    { label: 'Kilometre', value: data.kilometre?.toLocaleString('tr-TR') },
    { label: 'Distribütör', value: data.distributor, badge: true, color: 'orange' },
    { label: 'Tarih', value: formatDate(data.purchase_date) },
    { label: 'Fatura Dönemi', value: formatDate(data.invoice_period) },
    { label: 'UTTS', value: '-' },
    { label: 'Kaynak', value: data.source, badge: true },
    { label: 'İşlendi', value: data.processed ? 'Evet' : 'Hayır', badge: true },
    { label: 'Fatura', value: data.invoice_no, link: data.invoice_id ? `/invoices/detail/${data.invoice_id}` : undefined },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/purchases" className="text-cyan-600 hover:underline">&larr; Alışlar</Link>
        <h1 className="text-2xl font-bold text-gray-800">Satış Detay #{data.id}</h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-3 gap-4">
          {fields.map((f, i) => (
            <div key={i}>
              <p className="text-xs text-gray-500">{f.label}</p>
              {f.badge ? (
                <Badge value={f.value} color={f.color} />
              ) : f.link ? (
                <Link href={f.link} className="text-cyan-600 hover:underline font-semibold">{f.value || '-'}</Link>
              ) : (
                <p className="font-semibold text-gray-800">{f.value || '-'}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
