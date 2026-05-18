import React, { useState, useEffect } from 'react';
import { Bell, Search, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const user = api.auth.getCurrentUser();
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Emergency water maintenance notice posted', time: '10 mins ago', read: false },
    { id: 2, text: 'Mahesh Vyas checked-in as delivery guest', time: '30 mins ago', read: false },
    { id: 3, text: 'Water leakage complaint resolved by Caretaker', time: '2 hours ago', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeStr(date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' • ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md border-b border-slate-200 dark:border-darkBorder flex items-center justify-between px-6">
      {/* Title block */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">{title}</h1>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
          <Calendar size={14} className="text-sky-500" />
          <span>{timeStr}</span>
        </div>

        {/* Notifications Center */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-darkCard" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden z-50">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">Live Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] text-sky-500 font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/60
                      ${!notif.read ? 'bg-sky-50/20 dark:bg-sky-950/10' : ''}`}
                  >
                    <div className="mt-0.5">
                      {notif.read ? (
                        <CheckCircle2 size={15} className="text-slate-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-normal">{notif.text}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-6">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
            />
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{user.name}</span>
              <span className="text-[10px] text-slate-400 capitalize block leading-tight">{user.role.replace('_', ' ')}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
