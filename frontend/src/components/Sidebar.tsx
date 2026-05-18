import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { 
  Building2, 
  DoorOpen, 
  Users, 
  ShieldAlert, 
  Receipt, 
  Megaphone, 
  FileKey, 
  BarChart3, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, mobileOpen, onMobileClose }) => {
  const { theme, toggleTheme } = useTheme();
  const user = api.auth.getCurrentUser();
  const role = user?.role || 'tenant';

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'society_admin', 'caretaker', 'tenant'] },
    { to: '/buildings', label: 'Buildings', icon: Building2, roles: ['super_admin', 'society_admin', 'caretaker'] },
    { to: '/rooms', label: 'Rooms & Floors', icon: DoorOpen, roles: ['super_admin', 'society_admin', 'caretaker'] },
    { to: '/tenants', label: 'Tenants', icon: Users, roles: ['super_admin', 'society_admin', 'caretaker'] },
    { to: '/complaints', label: 'Complaints', icon: ShieldAlert, roles: ['super_admin', 'society_admin', 'caretaker', 'tenant'] },
    { to: '/billing', label: 'Rent & Billing', icon: Receipt, roles: ['super_admin', 'society_admin', 'caretaker', 'tenant'] },
    { to: '/notices', label: 'Notice Board', icon: Megaphone, roles: ['super_admin', 'society_admin', 'caretaker', 'tenant'] },
    { to: '/visitors', label: 'Visitor Logs', icon: FileKey, roles: ['super_admin', 'society_admin', 'caretaker'] },
    { to: '/analytics', label: 'Reports', icon: BarChart3, roles: ['super_admin', 'society_admin'] },
    { to: '/settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'society_admin', 'caretaker', 'tenant'] }
  ].filter(link => link.roles.includes(role));

  const formatRole = (r: string) => r.replace('_', ' ').toUpperCase();

  const getRoleColor = (r: string) => {
    switch (r) {
      case 'super_admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'society_admin': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'caretaker': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
    }
  };

  // On desktop: collapsed=true → 80px, collapsed=false → 256px
  // On mobile: always full-width (256px) drawer, slide in/out
  const desktopWidth = collapsed ? 'lg:w-20' : 'lg:w-64';

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen
        transition-transform duration-300 ease-in-out
        bg-white dark:bg-darkCard
        border-r border-slate-200 dark:border-darkBorder
        flex flex-col justify-between
        w-72 lg:w-auto
        ${desktopWidth}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-darkBorder">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/35 shrink-0">
              <Shield size={18} />
            </div>
            {/* Always show label on mobile drawer; respect collapsed on desktop */}
            <div className={`${collapsed ? 'lg:hidden' : ''}`}>
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">SMART SOCIETY</span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Rental & Admin SaaS</p>
            </div>
          </div>

          {/* Mobile: X close button | Desktop: collapse toggle */}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                onMobileClose();
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {/* Show X on mobile drawer, chevron on desktop */}
            <span className="lg:hidden"><X size={18} /></span>
            <span className="hidden lg:block">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => { if (window.innerWidth < 1024) onMobileClose(); }}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />
                {/* Always show label on mobile; respect collapsed on desktop */}
                <span className={`${collapsed ? 'lg:hidden' : ''} whitespace-nowrap`}>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Block */}
      <div className="p-3 border-t border-slate-200 dark:border-darkBorder space-y-3">
        {/* User Card — always show on mobile */}
        {user && (
          <div className={`${collapsed ? 'lg:hidden' : ''}`}>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{user.name}</p>
                <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRoleColor(role)}`}>
                  {formatRole(role)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed desktop: just avatar */}
        {collapsed && user && (
          <div className="hidden lg:flex justify-center">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
            />
          </div>
        )}

        {/* Theme and Logout Controls */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={20} className="shrink-0 text-amber-500" />
                <span className={`text-sm font-medium ${collapsed ? 'lg:hidden' : ''}`}>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={20} className="shrink-0 text-slate-700" />
                <span className={`text-sm font-medium ${collapsed ? 'lg:hidden' : ''}`}>Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={api.auth.logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`text-sm font-medium ${collapsed ? 'lg:hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
