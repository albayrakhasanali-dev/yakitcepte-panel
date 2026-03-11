'use client';

const colorMap: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
  gray: 'bg-gray-100 text-gray-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
};

const valueColors: Record<string, string> = {
  'Açık': 'green', 'Aktif': 'green', 'Evet': 'green', 'Banka Hareketi': 'green', 'Başarılı': 'green',
  'Onaylandı': 'green', 'Tamamlandı': 'green', 'Kabul Edildi': 'green',
  'Kapalı': 'red', 'Hayır': 'red', 'Red': 'red', 'İptal': 'red',
  'Petrol Ofisi': 'orange', 'Vadeli': 'orange', 'Beklemede': 'orange', 'Hazırlanıyor': 'orange',
  'Muhasebe': 'gray', 'Seçilmedi': 'gray', 'Muhasebe Programı': 'gray',
  'Borç': 'blue', 'Web Servisi': 'blue', 'Peşin': 'blue',
};

export default function Badge({ value, color }: { value: string | number | boolean | null | undefined; color?: string }) {
  if (value == null) return null;
  const displayValue = typeof value === 'boolean' ? (value ? 'Evet' : 'Hayır') : String(value);
  const resolvedColor = color || valueColors[displayValue] || 'gray';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[resolvedColor] || colorMap.gray}`}>
      {displayValue}
    </span>
  );
}
