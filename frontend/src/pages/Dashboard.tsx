import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  Building2, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Wrench, 
  ArrowUpRight, 
  Activity,
  PlusCircle,
  Clock,
  CheckCircle,
  FileText,
  Home,
  Megaphone,
  Settings,
  Receipt,
  BarChart3,
  FileKey
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = api.auth.getCurrentUser();
  const role = user?.role || 'tenant';
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.get<any>('/dashboard/stats');
        setStats(data);

        // Fetch recent complaints and notices
        const complaintsList = await api.get<any[]>('/complaints');
        setRecentComplaints(complaintsList.slice(0, 4));

        const noticesList = await api.get<any[]>('/notices');
        setRecentNotices(noticesList.slice(0, 3));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Assembling society analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 font-semibold max-w-xl mx-auto my-12 text-center">
        {error}
      </div>
    );
  }

  const { summary, buildingStats, revenueChart, complaintCategoryStats } = stats;

  // Chart Formatting Constants
  const COLORS = ['#0ea5e9', '#6366f1', '#eab308', '#f43f5e', '#10b981', '#a855f7'];
  const complaintPieData = Object.entries(complaintCategoryStats || {})
    .map(([key, val]) => ({ name: key.toUpperCase(), value: Number(val || 0) }))
    .filter((item: any) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* 1. Header greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {role === 'tenant' 
              ? 'Review your flat dashboard, check billing dues and open notices.' 
              : 'Here is what is happening across your residential complex today.'}
          </p>
        </div>
        
        {role === 'tenant' ? (
          <Link 
            to="/complaints" 
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-400 hover:to-indigo-550 text-white font-bold text-sm shadow-md shadow-sky-500/15 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={16} /> File New Complaint
          </Link>
        ) : (
          <div className="flex gap-2">
            <Link 
              to="/rooms" 
              className="px-4 py-2 rounded-xl bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-darkBorder font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Building2 size={14} /> Manage Flats
            </Link>
            <Link 
              to="/tenants" 
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/10 transition-colors flex items-center gap-1.5"
            >
              <Users size={14} /> Add Tenant
            </Link>
          </div>
        )}
      </div>

      {/* 1.5 Quick Launchpad Hub for Ultimate Ease-of-Use */}
      <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" /> ⚡ Quick Launchpad
          </h3>
          <p className="text-xs text-slate-400 font-medium">Common daily operations structured for your role to keep management simple and effortless.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {role === 'tenant' && (
            <>
              <Link to="/billing" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-sky-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-sky-50/20 dark:hover:bg-sky-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Receipt size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Pay Rent Dues</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">UPI QR Simulator</span>
                </div>
              </Link>

              <Link to="/complaints" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-rose-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Wrench size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">File Complaint</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Upload Issues</span>
                </div>
              </Link>

              <Link to="/notices" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-amber-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-amber-50/20 dark:hover:bg-amber-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Megaphone size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Notice Board</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Read Broadcasts</span>
                </div>
              </Link>

              <Link to="/settings" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-emerald-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Settings size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">My Settings</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Manage Profile</span>
                </div>
              </Link>
            </>
          )}

          {(role === 'super_admin' || role === 'society_admin') && (
            <>
              <Link to="/tenants" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-sky-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-sky-50/20 dark:hover:bg-sky-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Add Tenant</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Register Profile</span>
                </div>
              </Link>

              <Link to="/rooms" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-emerald-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Home size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Allocate Flat</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Lease Vacancies</span>
                </div>
              </Link>

              <Link to="/buildings" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-indigo-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Setup Towers</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Towers & Floors</span>
                </div>
              </Link>

              <Link to="/notices" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-amber-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-amber-50/20 dark:hover:bg-amber-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Megaphone size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Broadcast Notice</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Post Announcement</span>
                </div>
              </Link>

              <Link to="/billing" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-violet-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Receipt size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Rent Billings</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Track Invoices</span>
                </div>
              </Link>

              <Link to="/analytics" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-rose-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Audit Reports</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Financial Exports</span>
                </div>
              </Link>
            </>
          )}

          {role === 'caretaker' && (
            <>
              <Link to="/visitors" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-sky-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-sky-50/20 dark:hover:bg-sky-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileKey size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Visitor Passes</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Security Gate Logs</span>
                </div>
              </Link>

              <Link to="/complaints" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-rose-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Fix Complaints</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Support Work Orders</span>
                </div>
              </Link>

              <Link to="/rooms" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-emerald-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Home size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Inspect Flats</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Unit Repair States</span>
                </div>
              </Link>

              <Link to="/notices" className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:border-amber-500/40 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-amber-50/20 dark:hover:bg-amber-950/10 flex flex-col items-center text-center gap-2 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Megaphone size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Notice Board</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Broadcast Message</span>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder flex items-center justify-between shadow-sm group hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupied Rooms</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {summary.occupiedRooms} <span className="text-xs font-semibold text-slate-400">/ {summary.occupiedRooms + summary.vacantRooms + summary.maintenanceRooms}</span>
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
              <TrendingUp size={10} />
              <span>{Math.round((summary.occupiedRooms / (summary.occupiedRooms + summary.vacantRooms + summary.maintenanceRooms || 1)) * 100)}% Occupancy</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-500 dark:text-sky-400 flex items-center justify-center">
            <Building2 size={24} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder flex items-center justify-between shadow-sm group hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Dues</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              ₹{summary.pendingDues.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
              <AlertTriangle size={10} />
              <span>Dues outstanding</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder flex items-center justify-between shadow-sm group hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Complaints</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {summary.pendingComplaints}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold">
              <Wrench size={10} />
              <span>Awaiting resolution</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder flex items-center justify-between shadow-sm group hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              ₹{summary.monthlyRevenue.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
              <TrendingUp size={10} />
              <span>Payments verified</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Rent Revenue Area Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center pb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Rent Billing Analytics</h3>
              <p className="text-xs text-slate-400 font-medium">Revenue vs outstanding dues by billing period</p>
            </div>
            <Link to="/billing" className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-0.5">
              Ledger <ArrowUpRight size={14} />
            </Link>
          </div>
          
          <div className="h-72 w-full">
            {revenueChart && revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      borderRadius: '10px', 
                      border: 'none', 
                      color: '#f8fafc',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area name="Paid Revenue" type="monotone" dataKey="paid" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPaid)" />
                  <Area name="Unpaid Dues" type="monotone" dataKey="pending" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPending)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                No billing history recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Complaints Pie Chart */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm flex flex-col">
          <div className="pb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Complaint Categories</h3>
            <p className="text-xs text-slate-400 font-medium">Breakdown of support tickets raised</p>
          </div>
          
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            {complaintPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={complaintPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {complaintPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      borderRadius: '10px', 
                      border: 'none', 
                      color: '#f8fafc',
                      fontSize: '11px'
                    }} 
                  />
                  <Legend iconSize={8} iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 font-semibold space-y-2 p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl w-full">
                <CheckCircle className="mx-auto text-emerald-500" size={24} />
                <p>All clean! No active complaints recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Tower occupancy visualizers & live lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tower Occupancy Visualizers */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm">
          <div className="pb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Tower-wise Status</h3>
            <p className="text-xs text-slate-400 font-medium">Flat configurations inside residential towers</p>
          </div>
          
          <div className="space-y-4 pt-2">
            {buildingStats.map((b: any) => {
              const occupancyRate = Math.round((b.occupied / (b.total || 1)) * 100);
              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5"><Building2 size={14} className="text-sky-500" /> {b.name}</span>
                    <span>{b.occupied} / {b.total} Flats ({occupancyRate}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden flex border border-slate-200/40 dark:border-slate-800/40">
                    <div className="bg-sky-500 rounded-full" style={{ width: `${occupancyRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                    <span>{b.vacant} vacant flats</span>
                    <span>{b.maintenance} under repair</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Notices & Board */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Notice Board Alerts</h3>
                <p className="text-xs text-slate-400 font-medium">Latest broadcast messages from the society desk</p>
              </div>
              <Link to="/notices" className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-0.5">
                All Board <ArrowUpRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-3 pt-2">
              {recentNotices.length > 0 ? (
                recentNotices.map((n: any) => {
                  const badgeColor = 
                    n.type === 'emergency' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                    n.type === 'maintenance' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    'bg-sky-500/10 text-sky-500 border-sky-500/20';
                  return (
                    <div 
                      key={n.id} 
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 flex gap-3 hover:border-slate-350 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="shrink-0 flex items-start mt-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${badgeColor}`}>
                          {n.type}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1 leading-normal">{n.content}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 font-medium">
                  No active notices.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold justify-center">
            <Activity size={12} className="text-sky-500 animate-pulse" /> Live connection synced
          </div>
        </div>
      </div>

      {/* 5. Live Activity Feed or Recent Complaints */}
      <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Active Complaint Tracker</h3>
            <p className="text-xs text-slate-400 font-medium">Tickets filed by residents awaiting feedback</p>
          </div>
          <Link to="/complaints" className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-0.5">
            Resolve Portal <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
          {recentComplaints.length > 0 ? (
            recentComplaints.map(c => {
              const statusColor = 
                c.status === 'open' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                c.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
              
              const priorityIcon = 
                c.priority === 'emergency' ? 'text-rose-500' :
                c.priority === 'high' ? 'text-amber-500' :
                'text-sky-500';

              return (
                <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className={`shrink-0 ${priorityIcon}`} />
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{c.title}</p>
                      <p className="text-[10px] text-slate-400 capitalize">Category: {c.category} • Priority: <span className="font-semibold">{c.priority}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(c.created_at).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${statusColor}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 font-medium">
              No recent complaints.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
