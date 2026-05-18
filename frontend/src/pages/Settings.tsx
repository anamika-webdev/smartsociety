import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Moon, 
  Sun, 
  FileText, 
  Bell, 
  Save, 
  Activity,
  History,
  Info
} from 'lucide-react';

export const Settings: React.FC = () => {
  const user = api.auth.getCurrentUser();
  const { theme, toggleTheme } = useTheme();

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Notifications preference state
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyInvoice, setNotifyInvoice] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const logs = await api.get<any[]>('/audit-logs');
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real database, we would post this. In this simulator, we can just save it inside the local storage user object
    const updatedUser = { ...user, name, email, phone };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('System profile updated successfully!');
  };

  const handlePreferencesSave = () => {
    alert('System notifications preferences saved successfully!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading audit registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Control Panel</p>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">System Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile and Preferences Forms */}
        <div className="lg:col-span-6 space-y-6">
          {/* Profile Card */}
          <div className="p-5 bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder rounded-2xl shadow-sm">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <User size={16} className="text-sky-500" /> Account Information
            </h3>
            
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">User Full Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3.5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Registered Email</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3.5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Phone Number</label>
                  <input 
                    type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3.5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Assigned Role Badge</span>
                <span className="inline-block px-3 py-1 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-lg text-[10px] font-extrabold uppercase tracking-widest">
                  {user?.role.replace('_', ' ') || 'TENANT'}
                </span>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/10 transition-colors"
              >
                <Save size={14} /> Update profile details
              </button>
            </form>
          </div>

          {/* Preferences Card */}
          <div className="p-5 bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder rounded-2xl shadow-sm">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <SettingsIcon size={16} className="text-sky-500" /> Interface & Notifications
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              {/* Theme toggle */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">Aesthetics Dark Toggle</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-normal">Switch between high fidelity light and dark systems</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-350 transition-colors"
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Alert Preferences</label>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Email broadcast reports</span>
                  <input 
                    type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">SMS rent notifications</span>
                  <input 
                    type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Auto-issue invoice receipts</span>
                  <input 
                    type="checkbox" checked={notifyInvoice} onChange={(e) => setNotifyInvoice(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button 
                onClick={handlePreferencesSave}
                className="w-full py-2.5 mt-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/10 transition-colors"
              >
                <Save size={14} /> Update settings logs
              </button>
            </div>
          </div>
        </div>

        {/* Audit Trail Logs List */}
        <div className="lg:col-span-6 p-5 bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder rounded-2xl shadow-sm">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <Activity size={16} className="text-sky-500" /> Operational Security Logs
          </h3>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-500 font-semibold text-xs leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/45 dark:border-slate-800 flex items-start gap-3 hover:border-slate-350 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 shrink-0 border border-sky-500/15">
                    <History size={14} />
                  </div>
                  
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span>IP Address: {log.ip_address || '127.0.0.1'}</span>
                      <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-200 leading-normal">
                      {log.action}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold">
                      <span>Actor: <span className="font-bold text-sky-500">{log.user_name}</span></span>
                      <span>•</span>
                      <span className="uppercase text-[8px] px-1 bg-slate-200 dark:bg-slate-800 rounded font-black text-slate-500">{log.user_role}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 font-medium">
                No activity audits recorded.
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-sky-500/5 dark:bg-sky-950/10 border border-sky-500/10 rounded-xl flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
            <Info size={14} className="text-sky-500 shrink-0 mt-0.5" />
            <p>Operations logging captures sensitive actions, database mutations, and login authorizations automatically to guarantee database integrity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
