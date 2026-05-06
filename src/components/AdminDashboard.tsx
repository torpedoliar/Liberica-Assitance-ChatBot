import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, serverTimestamp, getCountFromServer, collectionGroup, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Shield, Trash2, Mail, Plus, Activity, Users, Database, Server, Zap, Clock, AlertTriangle, TrendingUp, Cpu, Network, PenTool } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const usageData = [
  { name: 'Mon', requests: 400, tokens: 240 },
  { name: 'Tue', requests: 300, tokens: 139 },
  { name: 'Wed', requests: 550, tokens: 380 },
  { name: 'Thu', requests: 470, tokens: 310 },
  { name: 'Fri', requests: 620, tokens: 490 },
  { name: 'Sat', requests: 250, tokens: 150 },
  { name: 'Sun', requests: 340, tokens: 200 },
];

const modeData = [
  { name: 'Solusi', value: 400 },
  { name: 'Diskusi', value: 300 },
  { name: 'Market', value: 300 },
  { name: 'Prompting', value: 200 },
  { name: 'AI News', value: 100 },
];

const COLORS = ['#111827', '#374151', '#4B5563', '#6B7280', '#9CA3AF'];

interface AdminUser {
  email: string;
  addedBy: string;
  createdAt: number;
}

interface AdminDashboardProps {
  sessionUser: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ sessionUser }) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ users: 0, sessions: 0, pinned: 0, activities: 142, uptime: '99.9%' });

  const [actualModeData, setActualModeData] = useState<any[]>([
    { name: 'Solusi', value: 0 },
    { name: 'Diskusi', value: 0 },
    { name: 'Market', value: 0 },
    { name: 'Prompting', value: 0 },
    { name: 'AI News', value: 0 },
  ]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'admins'));
      const snapshot = await getDocs(q);
      const adminsData = snapshot.docs.map(doc => doc.data() as AdminUser);
      setAdmins(adminsData);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('missing or insufficient permissions') || err.code === 'permission-denied') {
        setError('Akses Ditolak. Anda bukan Admin.');
      } else {
        setError('Gagal memuat data admin.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchActualStats = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const sessionsSnap = await getCountFromServer(collectionGroup(db, 'sessions'));
        const pinnedSnap = await getCountFromServer(query(collectionGroup(db, 'sessions'), where('isPinned', '==', true)));
        
        setStats(prev => ({ 
          ...prev, 
          users: usersSnap.data().count,
          sessions: sessionsSnap.data().count,
          pinned: pinnedSnap.data().count
        }));
        // Fetch counts for specific modes
        const modes = [
          { key: 'troubleshoot', label: 'Solusi' },
          { key: 'brainstorm', label: 'Diskusi' },
          { key: 'market', label: 'Market' },
          { key: 'chat', label: 'Prompting' },
          { key: 'news', label: 'AI News' },
        ];

        const modeCounts = await Promise.all(modes.map(async (m) => {
          const q = query(collectionGroup(db, 'sessions'), where('mode', '==', m.key));
          const snap = await getCountFromServer(q);
          return { name: m.label, value: snap.data().count };
        }));

        setActualModeData(modeCounts);
      } catch (e) {
        console.error("Error fetching actual stats", e);
      }
    };

    fetchAdmins();
    fetchActualStats();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    try {
      const emailLower = newAdminEmail.trim().toLowerCase();
      const docRef = doc(db, 'admins', emailLower);
      await setDoc(docRef, {
        email: emailLower,
        addedBy: sessionUser.email || 'Admin',
        createdAt: serverTimestamp()
      });
      setNewAdminEmail('');
      fetchAdmins();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'admins');
      alert('Gagal menambah admin. Pastikan Anda memiliki akses dan email valid.');
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    const emailLower = email.toLowerCase();
    if (emailLower === 'yohanesoctav@gmail.com') {
      alert('Super admin tidak dapat dihapus.');
      return;
    }
    if (window.confirm(`Hapus ${email} dari admin?`)) {
      try {
        await deleteDoc(doc(db, 'admins', emailLower));
        fetchAdmins();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'admins');
        alert('Gagal menghapus admin.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-sys-ink)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center pt-20">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold font-mono tracking-widest uppercase mb-4 text-[var(--color-sys-ink)]">Akses Ditolak</h2>
        <p className="text-red-600 font-medium p-4 border border-red-200 bg-red-50 rounded-xl max-w-sm">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b-2 border-[var(--color-sys-line)] pb-6 mb-8 mt-2">
        <Shield className="w-10 h-10 text-[var(--color-sys-ink)]" />
        <div>
          <h1 className="text-3xl font-black font-mono tracking-widest uppercase text-[var(--color-sys-ink)]">Admin Control</h1>
          <p className="font-mono text-sm opacity-60 font-bold tracking-widest uppercase">Monitoring & Otorisasi</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-[var(--color-sys-ink)] rounded-xl p-4 shadow-[4px_4px_0_var(--color-sys-ink)]">
          <div className="flex items-center justify-between mb-2 opacity-60">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono">{stats.users}</div>
        </div>
        <div className="bg-white border-2 border-[var(--color-sys-ink)] rounded-xl p-4 shadow-[4px_4px_0_var(--color-sys-ink)]">
          <div className="flex items-center justify-between mb-2 opacity-60">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">Activities</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono">{stats.activities}</div>
        </div>
        <div className="bg-white border-2 border-[var(--color-sys-ink)] rounded-xl p-4 shadow-[4px_4px_0_var(--color-sys-ink)]">
          <div className="flex items-center justify-between mb-2 opacity-60">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">DB Load</span>
            <Database className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono">1.2ms</div>
        </div>
        <div className="bg-white border-2 border-[var(--color-sys-ink)] rounded-xl p-4 shadow-[4px_4px_0_var(--color-sys-ink)]">
          <div className="flex items-center justify-between mb-2 opacity-60">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">Uptime</span>
            <Server className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-green-600">{stats.uptime}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="p-6 border-4 border-[var(--color-sys-ink)] rounded-2xl shadow-[8px_8px_0_var(--color-sys-ink)] bg-white h-auto sticky top-4">
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider mb-4 border-b-2 border-dashed border-gray-200 pb-2 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Invite Admin
            </h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider mb-2">Email Google/Admin</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-sys-bg)] border-2 border-[var(--color-sys-ink)] rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--color-sys-ink)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] rounded-xl font-mono tracking-widest uppercase font-bold text-sm hover:opacity-90 transition-all shadow-[4px_4px_0_var(--color-sys-bg),6px_6px_0_var(--color-sys-ink)] hover:translate-y-1 hover:shadow-none"
              >
                Kirim Undangan
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="p-6 border-4 border-[var(--color-sys-ink)] rounded-2xl shadow-[8px_8px_0_var(--color-sys-ink)] bg-zinc-50">
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider mb-6 flex justify-between items-center">
              <span>Admin Terdaftar</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">{admins.length + 1} Akun</span>
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white border-2 border-[var(--color-sys-ink)] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    yohanesoctav@gmail.com
                    <span className="bg-red-100 text-red-700 text-[10px] uppercase px-2 py-0.5 rounded-full font-mono font-black tracking-wider border border-red-200">Owner</span>
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">Sistem default</p>
                </div>
              </div>

              {admins.map((admin) => (
                <div key={admin.email} className="bg-white border-2 border-[var(--color-sys-ink)] rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div className="overflow-hidden">
                    <h3 className="font-bold truncate">{admin.email}</h3>
                    <p className="text-xs text-gray-600 font-mono mt-1 opacity-80">
                      Diundang oleh: <span className="font-semibold">{admin.addedBy}</span>
                    </p>
                  </div>
                  {(sessionUser?.email === 'yohanesoctav@gmail.com' || sessionUser?.email === admin.addedBy) && (
                    <button
                      onClick={() => handleRemoveAdmin(admin.email)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent rounded-lg hover:border-red-200 transition-all self-end sm:self-auto"
                      title="Cabut Akses Admin"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              {admins.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500">
                  <p className="font-mono text-sm uppercase tracking-widest">Belum ada admin tambahan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI & API Usage */}
        <div className="p-6 border-4 border-[var(--color-sys-ink)] rounded-2xl shadow-[8px_8px_0_var(--color-sys-ink)] bg-white relative">
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold font-mono px-2 py-1 rounded">MOCK DATA - BUTUH BACKEND</div>
          <h2 className="text-lg font-bold font-mono uppercase tracking-wider mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" /> AI & API Usage
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-800 mb-1">Total Requests</p>
              <p className="text-2xl font-black font-mono text-indigo-900">2,540</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-purple-800 mb-1">Est. Tokens</p>
              <p className="text-2xl font-black font-mono text-purple-900">1.6M</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-blue-800 mb-1">Avg Latency</p>
              <p className="text-2xl font-black font-mono text-blue-900">850ms</p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-red-800 mb-1">Error Rate</p>
              <p className="text-2xl font-black font-mono text-red-900">0.5%</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid #111827', fontWeight: 'bold' }} />
                <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Requests" />
                <Line yAxisId="right" type="monotone" dataKey="tokens" stroke="#9333EA" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Tokens (k)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity */}
        <div className="p-6 border-4 border-[var(--color-sys-ink)] rounded-2xl shadow-[8px_8px_0_var(--color-sys-ink)] bg-white">
          <h2 className="text-lg font-bold font-mono uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" /> Analitik Perilaku Pengguna
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 col-span-1">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-green-800 mb-1">Total Users</p>
              <p className="text-2xl font-black font-mono text-green-900">{stats.users}</p>
            </div>
            <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 col-span-1">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 mb-1">Total Sesi</p>
              <p className="text-2xl font-black font-mono text-teal-900">{stats.sessions}</p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 col-span-1">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-1">Pin Sesi</p>
              <p className="text-2xl font-black font-mono text-emerald-900">{stats.pinned}</p>
            </div>
          </div>
          
          <div className="flex h-48 w-full items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={actualModeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {actualModeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid #111827', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 pl-4 flex flex-col justify-center space-y-2">
              <p className="font-mono text-xs font-bold uppercase text-gray-500 mb-2">Mode Terpopuler</p>
              {actualModeData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-semibold">{entry.name}</span>
                  </div>
                  <span className="font-mono font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="p-6 border-4 border-[var(--color-sys-ink)] rounded-2xl shadow-[8px_8px_0_var(--color-sys-ink)] bg-white">
          <h2 className="text-lg font-bold font-mono uppercase tracking-wider mb-6 flex items-center gap-2">
            <Network className="w-5 h-5 text-orange-600" /> Kesehatan Sistem
          </h2>
          <div className="space-y-4">
            <div className="p-4 border-2 border-gray-200 rounded-xl flex items-center justify-between relative">
              <div className="absolute top-1 right-1 bg-yellow-100 text-yellow-800 text-[8px] font-bold font-mono px-1 rounded">MOCK</div>
              <div>
                <p className="font-bold">RSS News API</p>
                <p className="text-xs text-gray-500 font-mono mt-1">Status fetch terakhir</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold font-mono tracking-wider">OK - 10m ago</span>
              </div>
            </div>
            <div className="p-4 border-2 border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold">Firestore Limits (Actual)</p>
                <p className="text-xs text-gray-500 font-mono mt-1">Kuota tidak bisa dicek via Frontend SDK.</p>
              </div>
              <div className="text-right">
                <a href="https://console.firebase.google.com/project/_/firestore/usage" target="_blank" rel="noreferrer" className="inline-block px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full text-xs font-bold font-mono tracking-wider transition-colors">
                  CEK CONSOLE ↗
                </a>
              </div>
            </div>
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl relative">
              <div className="absolute top-1 right-1 bg-yellow-100 text-yellow-800 text-[8px] font-bold font-mono px-1 rounded">MOCK</div>
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <p className="font-bold text-sm">Log Error Terkini (Last 24h)</p>
              </div>
              <ul className="text-xs space-y-2 font-mono text-red-600">
                <li>• [AUTH] Missing or insufficient permissions. (2x)</li>
                <li>• [API] Gemini timeout during text-generation. (1x)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Top Insights */}
        <div className="p-6 border-4 border-[var(--color-sys-ink)] rounded-2xl shadow-[8px_8px_0_var(--color-sys-ink)] bg-white relative">
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold font-mono px-2 py-1 rounded">MOCK DATA</div>
          <h2 className="text-lg font-bold font-mono uppercase tracking-wider mb-6 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-600" /> Insight Ringkasan
          </h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-3 border-b-2 border-dashed border-gray-200 pb-2">Market Asset Terpopuler Top 3</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500">1</span>
                    <span className="font-bold">BBCA (BCA)</span>
                  </div>
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono font-bold">142 Mentions</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500">2</span>
                    <span className="font-bold">BTC/USDT</span>
                  </div>
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono font-bold">98 Mentions</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500">3</span>
                    <span className="font-bold">GOTO</span>
                  </div>
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono font-bold">85 Mentions</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-3 border-b-2 border-dashed border-gray-200 pb-2">Top Troubleshoot</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[var(--color-sys-ink)] text-[var(--color-sys-bg)] px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide">React Hooks (45%)</span>
                <span className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide">Firebase Data (30%)</span>
                <span className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide">Tailwind CSS (25%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
