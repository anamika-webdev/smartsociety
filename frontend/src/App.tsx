import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Buildings } from './pages/Buildings';
import { Rooms } from './pages/Rooms';
import { Tenants } from './pages/Tenants';
import { Complaints } from './pages/Complaints';
import { RentBilling } from './pages/RentBilling';
import { Notices } from './pages/Notices';
import { Visitors } from './pages/Visitors';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Login/Register Gateway */}
          <Route path="/" element={<LandingPage />} />

          {/* Secure authenticated Dashboard & Operations Desk */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/buildings" element={<Buildings />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/billing" element={<RentBilling />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/analytics" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Page Fallbacks & Wildcards */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
