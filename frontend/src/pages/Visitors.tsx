import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  FileKey, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  User, 
  Truck, 
  ArrowRight,
  LogOut,
  ChevronRight,
  CalendarDays
} from 'lucide-react';

export const Visitors: React.FC = () => {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Delivery');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [flatNumber, setFlatNumber] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const list = await api.get<any[]>('/visitors');
      setVisitors(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visitor logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/visitors', {
        name,
        phone,
        purpose,
        vehicle_number: vehicleNumber || null,
        flat_number: flatNumber
      });
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to check-in visitor');
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await api.put(`/visitors/${id}`, {});
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to check-out visitor');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setPurpose('Delivery');
    setVehicleNumber('');
    setFlatNumber('');
  };

  const filteredVisitors = visitors.filter(v => {
    const query = search.toLowerCase();
    return v.name.toLowerCase().includes(query) || 
           v.flat_number.toLowerCase().includes(query) ||
           v.phone.includes(query) ||
           (v.vehicle_number && v.vehicle_number.toLowerCase().includes(query));
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Consulting guard registers...</span>
      </div>
    );
  }

  const activeVisitors = visitors.filter(v => !v.check_out).length;
  const totalLogsToday = visitors.length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gate Security</p>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Visitor Security Entry Log</h2>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/10 flex items-center gap-1 transition-colors"
        >
          <Plus size={15} /> Log Guest Check-In
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider leading-none mb-1">Active in Complex</span>
            <p className="text-base font-black text-slate-800 dark:text-white">{activeVisitors}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CalendarDays size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider leading-none mb-1">Total Logs today</span>
            <p className="text-base font-black text-slate-800 dark:text-white">{totalLogsToday}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-darkCard rounded-2xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center text-xs font-semibold">
        <div className="relative w-full md:w-80">
          <input 
            type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guests name, vehicle plate, flat targeted..."
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-darkBorder focus:border-sky-500 px-3.5 py-2.5 pl-9 rounded-xl text-slate-700 dark:text-slate-200 outline-none"
          />
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Live Visitors Gate Passes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVisitors.map((v) => {
          const isInside = !v.check_out;
          
          return (
            <div 
              key={v.id} 
              className={`p-5 rounded-2xl bg-white dark:bg-darkCard border shadow-sm relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200
                ${isInside 
                  ? 'border-sky-500/30 hover:border-sky-500/50' 
                  : 'border-slate-200/50 dark:border-darkBorder opacity-80'}`}
            >
              {/* Security Strip Pattern */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 
                ${isInside ? 'bg-gradient-to-r from-sky-400 to-indigo-650' : 'bg-slate-300 dark:bg-slate-800'}`} 
              />

              <div>
                {/* Header pass */}
                <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Security Gate Pass</span>
                    <span className="text-[12px] font-mono font-bold tracking-widest text-slate-800 dark:text-slate-250 mt-1 block">
                      {v.gate_pass}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase
                    ${isInside 
                      ? 'bg-sky-500/10 text-sky-500 border-sky-500/20 shadow-sm' 
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}
                  >
                    {isInside ? 'Checked-In' : 'Checked-Out'}
                  </span>
                </div>

                {/* Gate Pass details (resmbling ticket) */}
                <div className="py-4 space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-350">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Visitor:</span>
                    <span className="flex items-center gap-1"><User size={13} className="text-sky-500" /> {v.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Phone:</span>
                    <span>{v.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Destination:</span>
                    <span className="text-sky-500 font-bold">Flat {v.flat_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Purpose:</span>
                    <span>{v.purpose}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Vehicle:</span>
                    <span className="flex items-center gap-1 font-mono uppercase text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-800/80">
                      <Truck size={12} className="text-sky-500" /> {v.vehicle_number || 'NONE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check-in stamp footer */}
              <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
                <div className="space-y-1 text-[10px] text-slate-400 font-semibold">
                  <p className="flex justify-between">
                    <span>Gate Check-In:</span>
                    <span>{new Date(v.check_in).toLocaleTimeString()}</span>
                  </p>
                  {!isInside && (
                    <p className="flex justify-between text-rose-500">
                      <span>Gate Check-Out:</span>
                      <span>{new Date(v.check_out).toLocaleTimeString()}</span>
                    </p>
                  )}
                </div>

                {isInside && (
                  <button 
                    onClick={() => handleCheckOut(v.id)}
                    className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-sm transition-colors"
                  >
                    <LogOut size={12} /> Complete Check-Out
                  </button>
                )}
              </div>
            </div>
          )})}

          {filteredVisitors.length === 0 && (
            <div className="col-span-full text-center py-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-medium">
              No check-in entries match your filters.
            </div>
          )}
      </div>

      {/* Add Visitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><FileKey size={16} className="text-sky-500" /> Log Guest Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Guest Name</label>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mahesh Vyas"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Telephone</label>
                  <input 
                    type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9988776655"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Target Apartment</label>
                  <input 
                    type="text" required value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} placeholder="e.g. A-101"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Purpose</label>
                  <select 
                    value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="Delivery (Amazon)">Delivery (Amazon)</option>
                    <option value="Delivery (Swiggy/Zomato)">Delivery (Zomato/Swiggy)</option>
                    <option value="Guest (Friend/Relative)">Guest (Friend/Relative)</option>
                    <option value="Maintenance / Technician">Maintenance Worker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Vehicle License Plate (Optional)</label>
                <input 
                  type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="e.g. DL-3C-AS-1234"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Generate Security Gate Pass
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
