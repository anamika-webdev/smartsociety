import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on wide screens when resized down (prevent stuck-open state)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/buildings': return 'Buildings Visualizer';
      case '/rooms': return 'Rooms & Flats Manager';
      case '/tenants': return 'Tenant Directory';
      case '/complaints': return 'Complaints Portal';
      case '/billing': return 'Rent & Payments Ledger';
      case '/notices': return 'Notice Board';
      case '/visitors': return 'Visitor Security Entry Log';
      case '/analytics': return 'Society Analytics & Reports';
      case '/settings': return 'System Settings';
      default: return 'Smart Society Management';
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg transition-colors duration-300 flex">

      {/* ── Mobile backdrop overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (off-screen on mobile, visible on lg+) ── */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* ── Main content pane ── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          lg:${collapsed ? 'pl-20' : 'pl-64'}`}
      >
        {/* Top Navbar — passes hamburger handler */}
        <Navbar
          title={getPageTitle(location.pathname)}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Route Render Outlet */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] w-full mx-auto fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
