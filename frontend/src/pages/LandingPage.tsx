import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Building2, CreditCard, ShieldAlert, FileKey, BarChart3, Mail, ArrowRight, UserPlus, LogIn, Lock } from 'lucide-react';
import { api } from '../utils/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('tenant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.register({ name, email, password, role, phone });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Super Admin', email: 'superadmin@smartsociety.com', pass: 'superadmin123' },
    { label: 'Admin', email: 'admin@smartsociety.com', pass: 'admin123' },
    { label: 'Caretaker', email: 'caretaker@smartsociety.com', pass: 'caretaker123' },
    { label: 'Tenant', email: 'tenant@smartsociety.com', pass: 'tenant123' }
  ];

  const fillDemo = (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword(demo.pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden relative selection:bg-sky-500 selection:text-white">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-600/10 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-slow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">SMART SOCIETY</span>
            <p className="text-[10px] text-slate-400 font-medium">Rental & Admin SaaS</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsRegister(false); setShowAuthModal(true); }}
            className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => { setIsRegister(true); setShowAuthModal(true); }}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 transition-all flex items-center gap-1.5"
          >
            Get Started <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center lg:text-left lg:grid lg:grid-cols-12 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-sky-400 text-xs font-semibold">
            <Sparkles size={12} /> Next-Gen Residential ERP
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-sans leading-tight tracking-tight">
            Seamless Society & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-300 bg-clip-text text-transparent">
              Rental Operations
            </span> <br />
            in One Single Place.
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Manage multi-tower complexes, coordinate rent payments, authorize guests, and automate maintenance tickets through a clean, modern dashboard built for the future.
          </p>

          <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
            <button 
              onClick={() => { setIsRegister(false); setShowAuthModal(true); }}
              className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 hover:scale-[1.02] shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center gap-2 text-sm sm:text-base"
            >
              Enter Dashboard Portal <ArrowRight size={18} />
            </button>
            
            <a 
              href="#features" 
              className="px-6 py-3.5 rounded-xl font-semibold border border-slate-700 hover:bg-slate-800/50 transition-colors text-sm sm:text-base flex items-center"
            >
              Explore Features
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center lg:text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">4</p>
              <p className="text-xs text-slate-500 font-semibold">Residential Towers</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100+</p>
              <p className="text-xs text-slate-500 font-semibold">Allocated Flats</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">99.8%</p>
              <p className="text-xs text-slate-500 font-semibold">On-time Payments</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">0%</p>
              <p className="text-xs text-slate-500 font-semibold">Manual Excel Files</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="lg:col-span-5 mt-16 lg:mt-0 relative flex justify-center">
          <div className="w-full max-w-[450px] aspect-[4/5] rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-2xl relative overflow-hidden flex flex-col p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center pb-4 border-b border-slate-700/40">
              <span className="text-xs font-bold text-slate-400">DEMO LOGINS (CLICKS TO INJECT)</span>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-3">
              <p className="text-xs font-medium text-slate-400 text-center">To quickly explore the dashboard with preloaded realistic mock data under different system roles, click a demo button:</p>
              {demoAccounts.map(demo => (
                <button
                  key={demo.label}
                  onClick={() => {
                    fillDemo(demo);
                    setIsRegister(false);
                    setShowAuthModal(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-sky-500/10 border border-slate-700 hover:border-sky-500 text-slate-300 hover:text-sky-400 transition-all font-semibold text-xs flex justify-between items-center group"
                >
                  <span>{demo.label} Portal</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-500 group-hover:text-sky-400">
                    Quick Access <LogIn size={12} />
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-700/40 text-center text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              SMART SOCIETY RENTAL ERP v1.0.0
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Everything You Need</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold">Complete Control Over Your Properties</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our platform provides role-based workspaces for Super Admins, Society Managers, Gate Caretakers, and Tenants alike.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Building2 size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Towers & Multi-Room Layout</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dynamically visualizes floor-by-floor apartment plans. Track which flats are currently occupied, vacant, or set for maintenance cleanly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Automated Rent & Billing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track invoices monthly, review payments, generate and export downloadable digital receipts, and calculate aggregate monthly revenue charts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Complaint Desk Portal</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tenants file maintenance complaints with photos. Admins monitor priority alerts, assign workers, and comment live for complete transparency.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileKey size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Visitor Check-In Log</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Digital guardhouse log showing visitors, courier companies, entry vehicle plates, and time check-outs with security passcodes.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Audit Logs & Activity Reports</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every sensitive action is tracked. Access historical logs, filter transactions, and audit which admin approved a tenant profile instantly.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-sky-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Verification & Storage</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Clean upload vaults for Aadhaar/ID, lease documentation, and agreements. Access PDFs anytime securely with fully cloud-ready links.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-slate-850 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-650 flex items-center justify-center text-white text-[11px] font-bold">
            S
          </div>
          <span className="font-extrabold tracking-tight text-slate-300">SMART SOCIETY</span>
        </div>
        <p>© 2026 Smart Society Management System. Built for next-generation rental housing. All rights reserved.</p>
      </footer>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative overflow-hidden fade-in text-white">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-sky-500/10 blur-xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield size={18} className="text-sky-500" />
                {isRegister ? 'Create Resident Portal Account' : 'Portal Log In'}
              </h3>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            {/* Forms */}
            <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Singh" 
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 px-3.5 py-2 rounded-lg text-sm text-slate-200 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210" 
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 px-3.5 py-2 rounded-lg text-sm text-slate-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1.5">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 px-3 py-2 rounded-lg text-sm text-slate-200 outline-none transition-all"
                    >
                      <option value="tenant">Tenant / Resident</option>
                      <option value="caretaker">Caretaker / Building Manager</option>
                      <option value="society_admin">Society Admin</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartsociety.com" 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 px-3.5 py-2 rounded-lg text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1.5 flex justify-between items-center">
                  Password
                  {!isRegister && (
                    <button 
                      type="button"
                      onClick={() => alert('Demo reminder: You can login using password "admin123" for admin@smartsociety.com or "tenant123" for tenant@smartsociety.com.')}
                      className="text-[10px] text-slate-500 hover:text-sky-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 px-3.5 py-2 rounded-lg text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-400 hover:to-indigo-550 text-white font-bold text-sm shadow-lg shadow-sky-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
                    {isRegister ? 'Register & Enter' : 'Log In & Enter Portal'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              {isRegister ? (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => { setIsRegister(false); setError(''); }} className="text-sky-500 hover:underline font-semibold">
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Requesting resident profile?{' '}
                  <button onClick={() => { setIsRegister(true); setError(''); }} className="text-sky-500 hover:underline font-semibold">
                    Register Here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
