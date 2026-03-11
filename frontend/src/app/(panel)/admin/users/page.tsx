'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import Badge from '@/components/Badge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [fleets, setFleets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'customer', fleet_id: '', full_name: '' });
  const [resetPw, setResetPw] = useState<{ id: number; password: string } | null>(null);

  const fetchUsers = () => api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});

  useEffect(() => {
    fetchUsers();
    api.get('/fleets').then(r => setFleets(r.data)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/admin/users', { ...form, fleet_id: form.fleet_id ? parseInt(form.fleet_id) : null });
      fetchUsers();
      setShowForm(false);
      setForm({ username: '', password: '', role: 'customer', fleet_id: '', full_name: '' });
    } catch {}
  };

  const handleResetPassword = async () => {
    if (resetPw) {
      await api.put(`/admin/users/${resetPw.id}/password`, { password: resetPw.password });
      setResetPw(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
          Yeni Kullanıcı Ekle
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
          <h3 className="font-semibold">Yeni Kullanıcı</h3>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Ad Soyad" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Kullanıcı adı" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Parola" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="customer">Müşteri</option>
              <option value="admin">Admin</option>
            </select>
            <select value={form.fleet_id} onChange={e => setForm({...form, fleet_id: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Filo Seçin</option>
              {fleets.map((f: any) => <option key={f.id} value={f.id}>{f.fleet_name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Kaydet</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}

      {resetPw && (
        <div className="bg-white rounded-xl p-4 shadow-sm border flex gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Yeni Parola</label>
            <input type="password" value={resetPw.password} onChange={e => setResetPw({...resetPw, password: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button onClick={handleResetPassword} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Şifre Sıfırla</button>
          <button onClick={() => setResetPw(null)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Ad Soyad</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kullanıcı Adı</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Rol</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kayıt Tarihi</th>
              <th className="px-4 py-3 text-gray-500 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{u.full_name}</td>
                <td className="px-4 py-2.5">{u.username}</td>
                <td className="px-4 py-2.5"><Badge value={u.role === 'admin' ? 'Admin' : 'Müşteri'} color={u.role === 'admin' ? 'blue' : 'green'} /></td>
                <td className="px-4 py-2.5">{u.fleet_name || '-'}</td>
                <td className="px-4 py-2.5">{formatDateTime(u.created_at)}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <button onClick={() => setResetPw({ id: u.id, password: '' })} className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100">Şifre</button>
                    <button onClick={() => handleDelete(u.id)} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
