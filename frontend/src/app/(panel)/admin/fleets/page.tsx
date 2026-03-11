'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/Badge';

export default function AdminFleetsPage() {
  const [fleets, setFleets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ fleet_code: '', fleet_name: '', company_name: '', fuel_status: 'Kapalı', payment_type: 'Vadeli', defined_limit: 0, sales_rep: '' });

  const fetchFleets = () => api.get('/fleets').then(r => setFleets(r.data)).catch(() => {});

  useEffect(() => { fetchFleets(); }, []);

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/fleets/${editId}`, form);
      } else {
        await api.post('/fleets', form);
      }
      fetchFleets();
      setShowForm(false);
      setEditId(null);
      setForm({ fleet_code: '', fleet_name: '', company_name: '', fuel_status: 'Kapalı', payment_type: 'Vadeli', defined_limit: 0, sales_rep: '' });
    } catch {}
  };

  const handleEdit = (f: any) => {
    setForm({ fleet_code: f.fleet_code, fleet_name: f.fleet_name, company_name: f.company_name, fuel_status: f.fuel_status, payment_type: f.payment_type, defined_limit: f.defined_limit, sales_rep: f.sales_rep || '' });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu filoyu silmek istediğinizden emin misiniz?')) {
      await api.delete(`/fleets/${id}`);
      fetchFleets();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Firma Yönetimi</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ fleet_code: '', fleet_name: '', company_name: '', fuel_status: 'Kapalı', payment_type: 'Vadeli', defined_limit: 0, sales_rep: '' }); }} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
          Yeni Filo Ekle
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
          <h3 className="font-semibold">{editId ? 'Filo Düzenle' : 'Yeni Filo'}</h3>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" value={form.fleet_code} onChange={e => setForm({...form, fleet_code: e.target.value})} placeholder="Filo Kodu" className="px-3 py-2 border rounded-lg text-sm" disabled={!!editId} />
            <input type="text" value={form.fleet_name} onChange={e => setForm({...form, fleet_name: e.target.value})} placeholder="Filo Adı" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="Firma Adı" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.fuel_status} onChange={e => setForm({...form, fuel_status: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="Açık">Açık</option>
              <option value="Kapalı">Kapalı</option>
            </select>
            <select value={form.payment_type} onChange={e => setForm({...form, payment_type: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="Vadeli">Vadeli</option>
              <option value="Peşin">Peşin</option>
            </select>
            <input type="number" value={form.defined_limit} onChange={e => setForm({...form, defined_limit: parseFloat(e.target.value)})} placeholder="Tanımlı Limit" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.sales_rep} onChange={e => setForm({...form, sales_rep: e.target.value})} placeholder="Satış Temsilcisi" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Kaydet</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Kod</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo Adı</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Firma</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Yakıt</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ödeme</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Bakiye</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Limit</th>
                <th className="px-4 py-3 text-gray-500 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {fleets.map((f: any) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium">{f.fleet_code}</td>
                  <td className="px-4 py-2.5">{f.fleet_name}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{f.company_name}</td>
                  <td className="px-4 py-2.5"><Badge value={f.fuel_status} /></td>
                  <td className="px-4 py-2.5"><Badge value={f.payment_type} /></td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(f.balance)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(f.defined_limit)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(f)} className="px-2 py-1 text-xs bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100">Düzenle</button>
                      <button onClick={() => handleDelete(f.id)} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
