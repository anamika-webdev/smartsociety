import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  FileSpreadsheet, 
  FileDown, 
  Printer, 
  BarChart3, 
  TrendingUp, 
  PieChart,
  Building2,
  DollarSign,
  Wrench,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsData = await api.get<any>('/dashboard/stats');
        const payList = await api.get<any[]>('/payments');
        const roomList = await api.get<any[]>('/rooms');
        
        setStats(statsData);
        setPayments(payList);
        setRooms(roomList);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reporting data.');
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
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Compiling financial ledgers...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 font-semibold max-w-xl mx-auto my-12 text-center">
        {error || 'Failed to load details.'}
      </div>
    );
  }

  const { summary, buildingStats, revenueChart } = stats;

  // Chart preparation
  const occupancyPercentage = Math.round((summary.occupiedRooms / (summary.occupiedRooms + summary.vacantRooms || 1)) * 100);
  const radialData = [
    {
      name: 'Occupancy',
      uv: occupancyPercentage,
      pv: 2400,
      fill: '#0ea5e9',
    }
  ];

  // Detailed ledgers lists
  const occupancyLedger = buildingStats.map((b: any) => ({
    name: b.name,
    total: b.total,
    occupied: b.occupied,
    vacant: b.vacant,
    maint: b.maintenance,
    efficiency: b.total ? Math.round((b.occupied / b.total) * 100) : 0
  }));

  // Operations Mock Expenses Ledger
  const operationsExpenses = [
    { id: 1, title: 'Elevators Servicing & Lubrication', category: 'Maintenance', date: 'May 04, 2026', amount: 15400, status: 'approved' },
    { id: 2, title: 'Borewell Pump Repair & Rewinding', category: 'Water Supply', date: 'May 10, 2026', amount: 8900, status: 'approved' },
    { id: 3, title: 'CCTV Camera Replacements (Tower B)', category: 'Security', date: 'May 12, 2026', amount: 12500, status: 'approved' },
    { id: 4, title: 'Central Corridor LED Tubes & Cabling', category: 'Electrical', date: 'May 15, 2026', amount: 6200, status: 'approved' }
  ];

  const totalExpenses = operationsExpenses.reduce((sum, e) => sum + e.amount, 0);

  const simulateExport = (format: 'pdf' | 'excel', ledgerName: string) => {
    alert(`Generating secure transaction export...\nDocument: "${ledgerName}.${format}" is ready!\nSimulating file transmission complete.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Analytics Hub</p>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Society Reports & Audits</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => simulateExport('pdf', 'Executive_Report_May_2026')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-darkBorder font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileDown size={14} /> Download PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} /> Print Audit
          </button>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Realized Revenue Bar Chart */}
        <div className="lg:col-span-8 p-5 bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder rounded-2xl shadow-sm">
          <div className="pb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Target vs Realized Collections</h3>
            <p className="text-xs text-slate-400 font-medium">Billed outstanding vs verified deposits by period</p>
          </div>
          
          <div className="h-64 w-full">
            {revenueChart && revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
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
                  <Bar name="Deposited Revenue" dataKey="paid" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar name="Outstanding Dues" dataKey="pending" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No billing history recorded.
              </div>
            )}
          </div>
        </div>

        {/* Radial Occupancy Gauge */}
        <div className="lg:col-span-4 p-5 bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Occupancy Efficiency</h3>
            <p className="text-xs text-slate-400 font-medium">Residential rooms space efficiency gauge</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar
                  background
                  dataKey="uv"
                  cornerRadius={30}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-855 dark:text-white">{occupancyPercentage}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Occupied</span>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 font-semibold leading-relaxed">
            {summary.occupiedRooms} occupied chambers vs {summary.vacantRooms} empty units across complex towers.
          </div>
        </div>
      </div>

      {/* Operational Sheets Section */}
      <div className="space-y-6">
        {/* Sheet 1: Occupancy Sheet */}
        <div className="bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <Building2 size={16} className="text-sky-500" /> Tower occupancy visualizers
            </h3>
            <button 
              onClick={() => simulateExport('excel', 'Occupancy_Sheet')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold text-[10px] flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet size={13} /> Export Excel
            </button>
          </div>
          <div className="overflow-x-auto text-xs font-semibold">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold text-slate-400 border-b border-slate-100 dark:border-slate-800 tracking-wider uppercase">
                  <th className="px-6 py-3">Tower Name</th>
                  <th className="px-6 py-3">Total Chambers</th>
                  <th className="px-6 py-3">Occupied Units</th>
                  <th className="px-6 py-3">Vacant Units</th>
                  <th className="px-6 py-3">Under Repair</th>
                  <th className="px-6 py-3 text-right">Occupancy Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-350">
                {occupancyLedger.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-white">{row.name}</td>
                    <td className="px-6 py-3.5">{row.total}</td>
                    <td className="px-6 py-3.5 text-sky-500">{row.occupied}</td>
                    <td className="px-6 py-3.5 text-emerald-500">{row.vacant}</td>
                    <td className="px-6 py-3.5 text-rose-500">{row.maint}</td>
                    <td className="px-6 py-3.5 text-right font-bold">{row.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sheet 2: Expenses Log */}
        <div className="bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <Wrench size={16} className="text-sky-500" /> Maintenance Operations Expenses
            </h3>
            <button 
              onClick={() => simulateExport('excel', 'Maintenance_Expenses')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold text-[10px] flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet size={13} /> Export Excel
            </button>
          </div>
          <div className="overflow-x-auto text-xs font-semibold">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold text-slate-400 border-b border-slate-100 dark:border-slate-800 tracking-wider uppercase">
                  <th className="px-6 py-3">Expense item</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Settlement Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-350">
                {operationsExpenses.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-3.5 font-bold text-slate-850 dark:text-slate-200">{row.title}</td>
                    <td className="px-6 py-3.5 text-slate-400">{row.category}</td>
                    <td className="px-6 py-3.5">{row.date}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded border text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-800 dark:text-white">₹{row.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-slate-50 dark:bg-slate-900/40 font-black text-slate-800 dark:text-white">
                  <td colSpan={4} className="px-6 py-4">Total Aggregate Expenditures:</td>
                  <td className="px-6 py-4 text-right">₹{totalExpenses.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
