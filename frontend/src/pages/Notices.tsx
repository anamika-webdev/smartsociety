import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Megaphone, 
  AlertTriangle, 
  Wrench, 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  User
} from 'lucide-react';

export const Notices: React.FC = () => {
  const user = api.auth.getCurrentUser();
  const role = user?.role || 'tenant';
  
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('announcement');
  const [date, setDate] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const list = await api.get<any[]>('/notices');
      setNotices(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notice board.');
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
      await api.post('/notices', {
        title,
        content,
        type,
        date: date || new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to post notice');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('announcement');
    setDate('');
  };

  const getNoticeIcon = (t: string) => {
    switch (t) {
      case 'emergency': return <AlertTriangle className="text-rose-500" size={18} />;
      case 'maintenance': return <Wrench className="text-amber-500" size={18} />;
      case 'event': return <Calendar className="text-emerald-500" size={18} />;
      default: return <Megaphone className="text-sky-500" size={18} />;
    }
  };

  const getNoticeBorder = (t: string) => {
    switch (t) {
      case 'emergency': return 'border-l-4 border-l-rose-500 hover:border-slate-350 dark:hover:border-slate-700';
      case 'maintenance': return 'border-l-4 border-l-amber-500 hover:border-slate-350 dark:hover:border-slate-700';
      case 'event': return 'border-l-4 border-l-emerald-500 hover:border-slate-350 dark:hover:border-slate-700';
      default: return 'border-l-4 border-l-sky-500 hover:border-slate-350 dark:hover:border-slate-700';
    }
  };

  const getNoticeBadge = (t: string) => {
    switch (t) {
      case 'emergency': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'maintenance': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'event': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading notices broadcast...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Announcement Desk</p>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Society Notice Board</h2>
        </div>
        {role !== 'tenant' && (
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/10 flex items-center gap-1 transition-colors"
          >
            <Plus size={15} /> Post New Broadcast
          </button>
        )}
      </div>

      {/* Notice Board List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((n) => (
          <div 
            key={n.id} 
            className={`p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/50 dark:border-darkBorder shadow-sm flex flex-col justify-between transition-all ${getNoticeBorder(n.type)}`}
          >
            <div>
              {/* Header details */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                    {getNoticeIcon(n.type)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-normal">{n.title}</h3>
                    <span className={`inline-block mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getNoticeBadge(n.type)}`}>
                      {n.type}
                    </span>
                  </div>
                </div>

                {role !== 'tenant' && (
                  <button 
                    onClick={() => handleDelete(n.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Broadcast Content */}
              <p className="py-4 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {n.content}
              </p>
            </div>

            {/* Footer stamp */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1"><Clock size={12} className="text-sky-500" /> Target Date: {new Date(n.date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><User size={12} className="text-sky-500" /> Authorized Desk</span>
            </div>
          </div>
        ))}

        {notices.length === 0 && (
          <div className="col-span-full text-center py-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-medium">
            The notice board is clear. No active broadcasts.
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Megaphone size={16} className="text-sky-500" /> Post New notice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Notice Category</label>
                <select 
                  value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="announcement">Announcement / Broadcast</option>
                  <option value="emergency">Emergency / Alert</option>
                  <option value="maintenance">Maintenance Shutdown</option>
                  <option value="event">Social Event / Celebration</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Broadcast Title</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Elevators Maintenance schedule"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Notice Content</label>
                <textarea 
                  required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Draft the notice content in full detail..." rows={5}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Target/Schedule Date</label>
                <input 
                  type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Publish Notice Board
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
