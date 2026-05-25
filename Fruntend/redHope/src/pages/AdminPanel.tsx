import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Droplets, Heart, Activity, TrendingUp, ShieldCheck,
  AlertTriangle, CheckCircle2, XCircle, Clock, MapPin,
  BarChart2, Award, Bell, RefreshCw, Eye, Ban, Search,
  ChevronRight, Flame, Zap, Star, Calendar, Phone
} from 'lucide-react';

/* ═══════════════════════════ DUMMY DATA ═══════════════════════════ */

const STATS = [
  { label: 'Total Users',       value: 1_284, delta: '+48 this month', icon: Users,       color: 'text-sky-400',     bg: 'bg-sky-950/40 border-sky-700/30' },
  { label: 'Active Donors',     value: 876,   delta: '+22 this week',  icon: Heart,       color: 'text-blood-400',   bg: 'bg-blood-950/40 border-blood-700/30' },
  { label: 'Blood Requests',    value: 342,   delta: '18 open now',    icon: Droplets,    color: 'text-amber-400',   bg: 'bg-amber-950/40 border-amber-700/30' },
  { label: 'Donations Done',    value: 519,   delta: '+64 this month', icon: CheckCircle2,color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-700/30' },
  { label: 'Urgent Requests',   value: 7,     delta: 'needs attention', icon: AlertTriangle,color:'text-red-400',    bg: 'bg-red-950/50 border-red-700/40' },
  { label: 'Reward Points Issued',value:'4.2K',delta:'+380 this week', icon: Award,       color: 'text-purple-400',  bg: 'bg-purple-950/40 border-purple-700/30' },
];

const BLOOD_DIST = [
  { group: 'O+',  donors: 210, requests: 78,  pct: 82 },
  { group: 'A+',  donors: 178, requests: 62,  pct: 70 },
  { group: 'B+',  donors: 156, requests: 55,  pct: 61 },
  { group: 'AB+', donors: 88,  requests: 22,  pct: 34 },
  { group: 'O-',  donors: 62,  requests: 41,  pct: 48 },
  { group: 'A-',  donors: 54,  requests: 37,  pct: 42 },
  { group: 'B-',  donors: 48,  requests: 29,  pct: 38 },
  { group: 'AB-', donors: 21,  requests: 18,  pct: 24 },
];

const RECENT_REQUESTS = [
  { id: 'RQ-1021', patient: 'Ravi Sharma',   blood: 'O-',  units: 2, hospital: 'AIIMS Delhi',        city: 'Delhi',       urgency: 'Critical', status: 'OPEN',      date: '25 May 2026' },
  { id: 'RQ-1020', patient: 'Priya Singh',   blood: 'B+',  units: 1, hospital: 'Fortis Hospital',    city: 'Noida',       urgency: 'Normal',   status: 'FULFILLED', date: '25 May 2026' },
  { id: 'RQ-1019', patient: 'Amir Khan',     blood: 'AB-', units: 3, hospital: 'Medanta',            city: 'Gurugram',    urgency: 'Critical', status: 'OPEN',      date: '24 May 2026' },
  { id: 'RQ-1018', patient: 'Sunita Yadav',  blood: 'A+',  units: 1, hospital: 'Safdarjung Hospital',city: 'Delhi',       urgency: 'Normal',   status: 'CANCELLED', date: '24 May 2026' },
  { id: 'RQ-1017', patient: 'Mohammed Ali',  blood: 'O+',  units: 2, hospital: 'City Hospital',      city: 'Lucknow',     urgency: 'Critical', status: 'OPEN',      date: '23 May 2026' },
  { id: 'RQ-1016', patient: 'Kavya Reddy',   blood: 'B-',  units: 1, hospital: 'Apollo Hospital',    city: 'Hyderabad',   urgency: 'Normal',   status: 'FULFILLED', date: '23 May 2026' },
  { id: 'RQ-1015', patient: 'Deepak Gupta',  blood: 'A-',  units: 2, hospital: 'Max Hospital',       city: 'Faridabad',   urgency: 'Normal',   status: 'FULFILLED', date: '22 May 2026' },
];

const RECENT_USERS = [
  { id: 'U-0091', name: 'Alexaa Mehra',    email: 'alexaa@example.com',  blood: 'B-',  city: 'Delhi',       role: 'Donor',    rank: 'Silver', joined: '24 May 2026', status: 'active' },
  { id: 'U-0090', name: 'Rahul Verma',     email: 'rahul@example.com',   blood: 'O+',  city: 'Lucknow',     role: 'Receiver', rank: '—',      joined: '24 May 2026', status: 'active' },
  { id: 'U-0089', name: 'Neha Patel',      email: 'neha@example.com',    blood: 'A+',  city: 'Surat',       role: 'Donor',    rank: 'Bronze', joined: '23 May 2026', status: 'active' },
  { id: 'U-0088', name: 'Aravind Kumar',   email: 'aravind@example.com', blood: 'AB+', city: 'Bangalore',   role: 'Donor',    rank: 'Gold',   joined: '22 May 2026', status: 'active' },
  { id: 'U-0087', name: 'Fatima Sheikh',   email: 'fatima@example.com',  blood: 'O-',  city: 'Mumbai',      role: 'Receiver', rank: '—',      joined: '21 May 2026', status: 'inactive' },
  { id: 'U-0086', name: 'Rohan Das',       email: 'rohan@example.com',   blood: 'B+',  city: 'Kolkata',     role: 'Donor',    rank: 'Silver', joined: '20 May 2026', status: 'active' },
];

const RECENT_NOTIFICATIONS = [
  { type: 'URGENT_ALERT',           title: '🚨 Urgent: O- blood needed',       msg: 'AIIMS Delhi needs 2 units immediately — no donor found yet.', time: '8m ago' },
  { type: 'DONATION_ACCEPTED',      title: '✅ Donation accepted',             msg: 'Alexaa accepted B- request for Henary in Bikapur.',           time: '32m ago' },
  { type: 'BLOOD_REQUEST_MATCH',    title: '🩸 New blood match found',         msg: '3 donors matched for AB- request in Gurugram.',               time: '1h ago' },
  { type: 'SYSTEM',                 title: 'ℹ️ System: DB backup complete',    msg: 'Automated database backup completed successfully.',             time: '2h ago' },
  { type: 'REWARD_EARNED',          title: '🏆 Reward milestone: Aravind',     msg: 'Aravind Kumar reached Gold rank — 500 pts earned.',           time: '3h ago' },
];

const TOP_DONORS = [
  { name: 'Aravind Kumar',  blood: 'AB+', donations: 12, rank: 'Gold',   pts: 1200, city: 'Bangalore' },
  { name: 'Rohan Das',      blood: 'B+',  donations: 9,  rank: 'Silver', pts: 900,  city: 'Kolkata' },
  { name: 'Alexaa Mehra',   blood: 'B-',  donations: 7,  rank: 'Silver', pts: 700,  city: 'Delhi' },
  { name: 'Neha Patel',     blood: 'A+',  donations: 5,  rank: 'Bronze', pts: 500,  city: 'Surat' },
  { name: 'Suresh Pillai',  blood: 'O+',  donations: 4,  rank: 'Bronze', pts: 400,  city: 'Chennai' },
];

const MONTHLY_TREND = [
  { month: 'Jan', requests: 28, donations: 19 },
  { month: 'Feb', requests: 34, donations: 26 },
  { month: 'Mar', requests: 41, donations: 33 },
  { month: 'Apr', requests: 52, donations: 44 },
  { month: 'May', requests: 68, donations: 57 },
];

/* ═══════════════════════════ HELPERS ═══════════════════════════ */

function statusBadge(status: string) {
  switch (status) {
    case 'OPEN':      return 'bg-amber-950/50 border-amber-600/40 text-amber-400';
    case 'FULFILLED': return 'bg-emerald-950/50 border-emerald-600/40 text-emerald-400';
    case 'CANCELLED': return 'bg-neutral-900 border-neutral-700 text-neutral-500';
    default:          return 'bg-neutral-900 border-neutral-700 text-neutral-400';
  }
}

function urgencyBadge(u: string) {
  return u === 'Critical'
    ? 'bg-red-950/60 border-red-600/40 text-red-400'
    : 'bg-neutral-900 border-neutral-700 text-neutral-400';
}

function rankColor(rank: string) {
  if (rank === 'Gold')   return 'text-amber-400';
  if (rank === 'Silver') return 'text-slate-300';
  if (rank === 'Bronze') return 'text-orange-400';
  return 'text-neutral-500';
}

function notifTypeColor(type: string) {
  switch (type) {
    case 'URGENT_ALERT':        return 'border-l-blood-500 bg-blood-950/20';
    case 'DONATION_ACCEPTED':   return 'border-l-emerald-500 bg-emerald-950/20';
    case 'BLOOD_REQUEST_MATCH': return 'border-l-blood-500 bg-blood-950/10';
    case 'REWARD_EARNED':       return 'border-l-amber-500 bg-amber-950/20';
    default:                    return 'border-l-neutral-600 bg-neutral-900/30';
  }
}

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */

type AdminTab = 'overview' | 'requests' | 'users' | 'donors' | 'notifications';

const AdminPanel: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  /* Guard — only ADMIN can see this page */
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const TAB_CONFIG: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',      label: 'Overview',      icon: BarChart2 },
    { id: 'requests',      label: 'Blood Requests', icon: Droplets },
    { id: 'users',         label: 'Users',          icon: Users },
    { id: 'donors',        label: 'Top Donors',     icon: Heart },
    { id: 'notifications', label: 'Alerts',         icon: Bell },
  ];

  /* Filter helpers */
  const filteredRequests = RECENT_REQUESTS.filter(r =>
    !searchQuery ||
    r.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.blood.includes(searchQuery.toUpperCase()) ||
    r.city.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUsers = RECENT_USERS.filter(u =>
    !searchQuery ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ─── Trend bar ─── */
  const maxVal = Math.max(...MONTHLY_TREND.map(m => Math.max(m.requests, m.donations)));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Admin Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blood-950 border border-blood-500/30 flex items-center justify-center shadow-lg shadow-blood-600/10">
              <ShieldCheck className="w-6 h-6 text-blood-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-100">Admin Panel</h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Logged in as <span className="text-blood-400 font-semibold">{user?.name}</span> · RedHope Network
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-700/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> System Online
            </span>
            <button className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex overflow-x-auto gap-1 mb-8 p-1 bg-neutral-900/50 rounded-2xl border border-neutral-800 scrollbar-hide">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  active
                    ? 'bg-blood-600 text-white shadow-lg shadow-blood-600/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ════════════════════ TAB: OVERVIEW ════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className={`rounded-2xl border p-4 space-y-2 ${s.bg} hover:scale-105 transition-transform duration-200`}>
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${s.color}`} />
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                    </div>
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.value.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-neutral-300 leading-tight">{s.label}</p>
                    <p className="text-[10px] text-neutral-500">{s.delta}</p>
                  </div>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Monthly Trend Bar Chart */}
              <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
                <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-blood-500" /> Monthly Activity
                </h3>
                <div className="flex items-end gap-3 h-40">
                  {MONTHLY_TREND.map(m => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
                        <div
                          className="flex-1 rounded-t-md bg-blood-600/70 hover:bg-blood-600 transition-colors"
                          style={{ height: `${(m.requests / maxVal) * 100}%` }}
                          title={`Requests: ${m.requests}`}
                        />
                        <div
                          className="flex-1 rounded-t-md bg-emerald-600/70 hover:bg-emerald-600 transition-colors"
                          style={{ height: `${(m.donations / maxVal) * 100}%` }}
                          title={`Donations: ${m.donations}`}
                        />
                      </div>
                      <span className="text-[9px] text-neutral-500 font-semibold">{m.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3">
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blood-600/70" /> Requests</span>
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600/70" /> Donations</span>
                </div>
              </div>

              {/* Blood Group Distribution */}
              <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
                <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-5">
                  <Droplets className="w-4 h-4 text-blood-500" /> Blood Group Distribution
                </h3>
                <div className="space-y-3">
                  {BLOOD_DIST.map(b => (
                    <div key={b.group} className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-blood-400 w-7 text-right flex-shrink-0">{b.group}</span>
                      <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blood-700 to-blood-500 rounded-full transition-all duration-700"
                          style={{ width: `${b.pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 w-14 text-right flex-shrink-0">
                        {b.donors}D · {b.requests}R
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Requests Preview */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-blood-500" /> Recent Blood Requests
                </h3>
                <button onClick={() => setActiveTab('requests')} className="text-xs text-blood-400 hover:text-blood-300 font-semibold flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {RECENT_REQUESTS.slice(0, 4).map(r => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 transition-all">
                    <span className="text-xs font-extrabold text-blood-400 w-8">{r.blood}</span>
                    <span className="text-sm font-semibold text-neutral-200 flex-grow min-w-0 truncate">{r.patient}</span>
                    <span className="text-[10px] text-neutral-500 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{r.city}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyBadge(r.urgency)}`}>{r.urgency}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(r.status)}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB: BLOOD REQUESTS ════════════════════ */}
        {activeTab === 'requests' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by patient, blood group, city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 focus:border-blood-500 rounded-xl text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2 text-[11px] font-bold">
                {[['OPEN', 'text-amber-400'], ['FULFILLED', 'text-emerald-400'], ['CANCELLED', 'text-neutral-500']].map(([s, c]) => (
                  <span key={s} className={`px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 ${c}`}>
                    {s}: {RECENT_REQUESTS.filter(r => r.status === s).length}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-900 bg-neutral-900/60">
                      {['ID', 'Patient', 'Blood', 'Units', 'Hospital', 'City', 'Urgency', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {filteredRequests.map(r => (
                      <tr key={r.id} className="hover:bg-neutral-900/40 transition-colors group">
                        <td className="px-4 py-3 text-[11px] font-mono text-neutral-500">{r.id}</td>
                        <td className="px-4 py-3 font-semibold text-neutral-200 whitespace-nowrap">{r.patient}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-extrabold text-blood-400 bg-blood-950/40 border border-blood-700/30 px-2 py-0.5 rounded-lg">{r.blood}</span>
                        </td>
                        <td className="px-4 py-3 text-neutral-400 text-center">{r.units}</td>
                        <td className="px-4 py-3 text-neutral-400 text-xs whitespace-nowrap max-w-[140px] truncate">{r.hospital}</td>
                        <td className="px-4 py-3 text-neutral-400 text-xs whitespace-nowrap">{r.city}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyBadge(r.urgency)}`}>{r.urgency}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(r.status)}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-neutral-500 whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-sky-400 transition-colors" title="View">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-blood-400 transition-colors" title="Cancel">
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRequests.length === 0 && (
                <div className="py-12 text-center text-neutral-500 text-sm">No requests match your search.</div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB: USERS ════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search users by name, email, city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 focus:border-blood-500 rounded-xl text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredUsers.map(u => (
                <div key={u.id} className={`bg-neutral-950 rounded-2xl border p-5 flex items-start gap-4 hover:border-neutral-700 transition-all group ${
                  u.status === 'inactive' ? 'opacity-60 border-neutral-900' : 'border-neutral-800'
                }`}>
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-blood-950 border border-blood-500/20 flex items-center justify-center flex-shrink-0 text-sm font-extrabold text-blood-400">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-neutral-100">{u.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        u.role === 'Donor'
                          ? 'bg-blood-950/60 border border-blood-600/30 text-blood-400'
                          : 'bg-sky-950/60 border border-sky-600/30 text-sky-400'
                      }`}>{u.role}</span>
                      {u.status === 'inactive' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-500">Inactive</span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{u.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] text-neutral-500 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{u.city}</span>
                      <span className="text-[10px] font-extrabold text-blood-400">{u.blood}</span>
                      {u.rank !== '—' && (
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${rankColor(u.rank)}`}>
                          <Star className="w-2.5 h-2.5" />{u.rank}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-600 flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" /> {u.joined}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-sky-400 transition-colors" title="View Profile">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-blood-400 transition-colors" title="Suspend">
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="md:col-span-2 py-12 text-center text-neutral-500 text-sm">No users match your search.</div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB: TOP DONORS ════════════════════ */}
        {activeTab === 'donors' && (
          <div className="space-y-5">
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-neutral-200">Top Performing Donors</h3>
              </div>
              <div className="divide-y divide-neutral-900">
                {TOP_DONORS.map((d, idx) => (
                  <div key={d.name} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-900/40 transition-colors group">
                    {/* Rank badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${
                      idx === 0 ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : idx === 1 ? 'bg-slate-700/40 border border-slate-500/40 text-slate-300'
                      : idx === 2 ? 'bg-orange-900/40 border border-orange-600/40 text-orange-400'
                      : 'bg-neutral-900 border border-neutral-700 text-neutral-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-100">{d.name}</span>
                        <span className={`text-[10px] font-bold ${rankColor(d.rank)}`}>
                          {d.rank}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-[10px] text-neutral-500 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{d.city}</span>
                        <span className="text-[10px] font-extrabold text-blood-400">{d.blood}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0 text-right">
                      <div>
                        <p className="text-sm font-extrabold text-emerald-400">{d.donations}</p>
                        <p className="text-[9px] text-neutral-600">donations</p>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-amber-400">{d.pts}</p>
                        <p className="text-[9px] text-neutral-600">reward pts</p>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-20 hidden lg:block">
                      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blood-700 to-blood-500 rounded-full"
                          style={{ width: `${(d.donations / 12) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blood Group Supply vs Demand */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
              <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-5">
                <Zap className="w-4 h-4 text-amber-400" /> Supply vs Demand by Blood Group
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BLOOD_DIST.map(b => {
                  const surplus = b.donors - b.requests;
                  const isCritical = surplus < 10;
                  return (
                    <div key={b.group} className={`rounded-xl border p-4 text-center ${
                      isCritical ? 'bg-blood-950/30 border-blood-700/40' : 'bg-neutral-900/50 border-neutral-800'
                    }`}>
                      <span className={`text-lg font-extrabold ${isCritical ? 'text-blood-400' : 'text-neutral-200'}`}>{b.group}</span>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-neutral-500">Donors</span>
                          <span className="text-emerald-400 font-bold">{b.donors}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-neutral-500">Requests</span>
                          <span className="text-blood-400 font-bold">{b.requests}</span>
                        </div>
                        <div className={`text-[10px] font-extrabold mt-1 ${isCritical ? 'text-blood-400' : 'text-emerald-400'}`}>
                          {surplus > 0 ? `+${surplus} surplus` : `${Math.abs(surplus)} short`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB: NOTIFICATIONS / ALERTS ════════════════════ */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-neutral-300">System-Wide Alerts & Activity</h3>
              <span className="text-[11px] text-blood-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blood-400 animate-pulse" /> Live feed (demo)
              </span>
            </div>

            <div className="space-y-3">
              {RECENT_NOTIFICATIONS.map((n, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border-l-4 border border-neutral-800 p-5 ${notifTypeColor(n.type)} transition-all hover:border-neutral-700`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-neutral-100">{n.title}</p>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{n.msg}</p>
                    </div>
                    <span className="text-[10px] text-neutral-500 whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {n.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* System Health */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 mt-6">
              <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-sky-400" /> System Health
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'API Response Time', value: '84ms', status: 'good', icon: Zap },
                  { label: 'DB Connections',    value: '12/50', status: 'good', icon: Activity },
                  { label: 'Active Sessions',   value: '147',  status: 'warn', icon: Users },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 p-4 bg-neutral-900/60 rounded-xl border border-neutral-800">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        item.status === 'good' ? 'bg-emerald-950/60 border border-emerald-700/30' : 'bg-amber-950/60 border border-amber-700/30'
                      }`}>
                        <Icon className={`w-4 h-4 ${item.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-neutral-100">{item.value}</p>
                        <p className="text-[10px] text-neutral-500">{item.label}</p>
                      </div>
                      <span className={`ml-auto w-2 h-2 rounded-full ${item.status === 'good' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
