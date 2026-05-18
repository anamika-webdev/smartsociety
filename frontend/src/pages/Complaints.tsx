import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  PlusCircle, 
  Wrench, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Eye, 
  Image as ImageIcon,
  MessageCircle,
  FileText
} from 'lucide-react';

export const Complaints: React.FC = () => {
  const user = api.auth.getCurrentUser();
  const role = user?.role || 'tenant';
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [activeComplaint, setActiveComplaint] = useState<any>(null);

  // New Complaint fields
  const [category, setCategory] = useState('water');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Update Complaint fields
  const [status, setStatus] = useState('open');
  const [adminComments, setAdminComments] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const list = await api.get<any[]>('/complaints');
      const tList = await api.get<any[]>('/tenants').catch(() => []);
      setComplaints(list);
      setTenants(tList);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets.');
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
      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      if (proofFile) {
        formData.append('proof', proofFile);
      }

      await api.post('/complaints', formData, true);
      
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to file complaint');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    try {
      await api.put(`/complaints/${activeComplaint.id}`, {
        status,
        admin_comments: adminComments
      });
      
      setShowResolveModal(false);
      setActiveComplaint(null);
      setAdminComments('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket');
    }
  };

  const resetForm = () => {
    setCategory('water');
    setTitle('');
    setDescription('');
    setPriority('medium');
    setProofFile(null);
  };

  const getTenantName = (tId: number) => {
    return tenants.find(t => t.id === tId)?.name || 'Resident';
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'emergency': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'medium': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Opening maintenance dispatch desk...</span>
      </div>
    );
  }

  // Count aggregates
  const openCount = complaints.filter(c => c.status === 'open').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Complaint Desk</p>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Maintenance & Tickets Portal</h2>
        </div>
        {role === 'tenant' && (
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-400 hover:to-indigo-550 text-white font-bold text-xs shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={15} /> Raise Support Ticket
          </button>
        )}
      </div>

      {/* Aggregate Widgets */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <AlertOctagon size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider leading-none mb-1">Open</span>
            <p className="text-base font-black text-slate-800 dark:text-white">{openCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider leading-none mb-1">In Progress</span>
            <p className="text-base font-black text-slate-800 dark:text-white">{inProgressCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider leading-none mb-1">Resolved</span>
            <p className="text-base font-black text-slate-800 dark:text-white">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {complaints.map((c) => {
          const statusStyle = 
            c.status === 'open' ? 'bg-rose-550/10 text-rose-500 border-rose-500/20' : 
            c.status === 'in_progress' ? 'bg-amber-550/10 text-amber-500 border-amber-500/20' : 
            'bg-emerald-550/10 text-emerald-500 border-emerald-500/20';

          return (
            <div 
              key={c.id} 
              className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm flex flex-col justify-between group hover:border-sky-500/40 hover:-translate-y-0.5 transition-all"
            >
              <div>
                {/* Header Meta */}
                <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Support Ticket #TCK00{c.id}</span>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1 leading-normal">{c.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${statusStyle}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-2 py-3 border-b border-dashed border-slate-100 dark:border-slate-800/80">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityColor(c.priority)}`}>
                    Priority: {c.priority}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase">
                    Category: {c.category}
                  </span>
                  {role !== 'tenant' && (
                    <span className="text-[9px] font-bold text-sky-500 self-center">
                      Filed by: {getTenantName(c.tenant_id)}
                    </span>
                  )}
                </div>

                {/* Description details */}
                <p className="py-4 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {c.description}
                </p>

                {/* Proof image rendering if attached */}
                {c.proof_url && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-200/50 dark:border-darkBorder max-h-48 flex bg-slate-50 dark:bg-slate-900 items-center justify-center p-2 relative group-hover:border-sky-500/20 transition-colors">
                    <img 
                      src={`http://localhost:5000${c.proof_url}`} 
                      alt="Complaint Proof"
                      className="max-h-44 rounded-lg object-contain w-full"
                      onError={(e) => {
                        // Fallback indicator
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <a 
                        href={`http://localhost:5000${c.proof_url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/95 text-slate-800 font-bold text-[10px] flex items-center gap-1 shadow"
                      >
                        <Eye size={12} /> View Proof Image
                      </a>
                    </div>
                  </div>
                )}

                {/* Comments box */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/30 dark:border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-1">
                    <MessageSquare size={11} className="text-sky-500" /> Admin Feedback
                  </span>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-350 italic">
                    {c.admin_comments || 'No admin notes posted yet.'}
                  </p>
                </div>
              </div>

              {/* Action row (Admins can resolve/update) */}
              {role !== 'tenant' && (
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                  <button 
                    onClick={() => {
                      setActiveComplaint(c);
                      setStatus(c.status);
                      setAdminComments(c.admin_comments || '');
                      setShowResolveModal(true);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] flex items-center gap-1 shadow transition-colors"
                  >
                    <Wrench size={12} /> Dispatch & Update Ticket
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {complaints.length === 0 && (
          <div className="col-span-full text-center py-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-medium">
            No complaints logged. Everything is in order!
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><ImageIcon size={16} className="text-sky-500" /> File Support Ticket</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Category</label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="water">Water / Plumbing</option>
                  <option value="electricity">Electricity / Power</option>
                  <option value="cleaning">Housekeeping / Cleaning</option>
                  <option value="security">Security / Gate</option>
                  <option value="maintenance">Structural Repairs</option>
                  <option value="internet">Broadband / Internet</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Ticket Summary (Title)</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Water leak in kitchen wall"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Detailed Description</label>
                <textarea 
                  required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide full details of the malfunction..." rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Urgency (Priority)</label>
                  <select 
                    value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Fix in 48h</option>
                    <option value="high">High - Fix in 24h</option>
                    <option value="emergency">Emergency - Fix immediately</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Proof Photo</label>
                  <input 
                    type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-extrabold file:bg-sky-500 file:text-white hover:file:bg-sky-400"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Post Support Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Comment & Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><MessageCircle size={16} className="text-sky-500" /> Dispatch Maintenance Dispatch</h3>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/40 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Active Task</p>
                <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">{activeComplaint?.title}</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Action Status</label>
                <select 
                  value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="open">Awaiting Dispatch (Open)</option>
                  <option value="in_progress">Technician Assigned (In Progress)</option>
                  <option value="resolved">Issue Fixed & Confirmed (Resolved)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Admin Dispatch Notes</label>
                <textarea 
                  required value={adminComments} onChange={(e) => setAdminComments(e.target.value)} placeholder="Provide action description (e.g. Electrician Sharma visited flat, replaced wiring board)..." rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Update Dispatch Records
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
