import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  History, 
  CheckCircle,
  FileCheck,
  Download
} from 'lucide-react';

export const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'active' | 'previous'>('active');

  // Search
  const [search, setSearch] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [activeT, setActiveT] = useState<any>(null);
  const [docType, setDocType] = useState<'agreement' | 'id'>('agreement');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [rentAmount, setRentAmount] = useState(0);
  const [userId, setUserId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const tList = await api.get<any[]>('/tenants');
      const uList = await api.get<any[]>('/auth/profile').catch(() => []); // Fallback or fetch all users
      // To get all users for linking, we can retrieve them or default to local data
      const allUsers = await api.get<any[]>('/audit-logs').then(() => {
        // Just standard fetch fallback or let's default users array
        return [];
      }).catch(() => []);
      
      setTenants(tList);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant list.');
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
      await api.post('/tenants', {
        name,
        phone,
        email: email || null,
        aadhaar: aadhaar || null,
        emergency_contact: emergencyContact || null,
        move_in_date: moveInDate || new Date().toISOString().split('T')[0],
        rent_amount: Number(rentAmount),
        user_id: userId ? Number(userId) : null,
        status: activeTab
      });
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add tenant');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeT) return;
    try {
      await api.put(`/tenants/${activeT.id}`, {
        name,
        phone,
        email: email || null,
        aadhaar: aadhaar || null,
        emergency_contact: emergencyContact || null,
        move_in_date: moveInDate || null,
        rent_amount: Number(rentAmount),
        user_id: userId ? Number(userId) : null
      });
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to edit tenant');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resident profile?')) return;
    try {
      await api.delete(`/tenants/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete tenant');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAadhaar('');
    setEmergencyContact('');
    setMoveInDate('');
    setRentAmount(0);
    setUserId('');
    setActiveT(null);
  };

  const openEdit = (t: any) => {
    setActiveT(t);
    setName(t.name);
    setPhone(t.phone);
    setEmail(t.email || '');
    setAadhaar(t.aadhaar || '');
    setEmergencyContact(t.emergency_contact || '');
    setMoveInDate(t.move_in_date ? t.move_in_date.split('T')[0] : '');
    setRentAmount(t.rent_amount);
    setUserId(t.user_id ? t.user_id.toString() : '');
    setShowEditModal(true);
  };

  const openDoc = (t: any, type: 'agreement' | 'id') => {
    setActiveT(t);
    setDocType(type);
    setShowDocModal(true);
  };

  // Filter lists based on tab and search query
  const filteredTenants = tenants.filter(t => {
    const matchesTab = t.status === activeTab;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.phone.includes(search) || 
                          (t.email && t.email.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Opening resident registers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Property Directory</p>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Resident Registry</h2>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/10 flex items-center gap-1 transition-colors"
        >
          <Plus size={15} /> Add Resident Profile
        </button>
      </div>

      {/* Tabs and Search Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Toggle tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 shrink-0 text-xs font-bold w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5
              ${activeTab === 'active' 
                ? 'bg-white dark:bg-darkCard text-sky-500 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
          >
            <CheckCircle size={14} /> Active Residents ({tenants.filter(t => t.status === 'active').length})
          </button>
          <button 
            onClick={() => setActiveTab('previous')}
            className={`flex-1 md:flex-initial px-5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5
              ${activeTab === 'previous' 
                ? 'bg-white dark:bg-darkCard text-sky-500 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
          >
            <History size={14} /> Historical Directory ({tenants.filter(t => t.status === 'previous').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 text-xs font-semibold">
          <input 
            type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, email..."
            className="w-full bg-white dark:bg-darkCard border border-slate-200/50 dark:border-darkBorder focus:border-sky-500 px-3.5 py-2.5 pl-9 rounded-xl text-slate-700 dark:text-slate-200 outline-none shadow-sm"
          />
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Tenants Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTenants.map((t) => (
          <div 
            key={t.id} 
            className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm flex flex-col justify-between group hover:border-sky-500/40 hover:-translate-y-0.5 transition-all"
          >
            <div>
              {/* Header profile */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-sm shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">{t.name}</h3>
                    <p className="text-[10px] text-sky-500 mt-0.5 font-bold uppercase tracking-wider">Resident ID: #00{t.id}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button 
                    onClick={() => openEdit(t)}
                    className="p-1 rounded text-slate-400 hover:text-sky-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Resident Contact parameters */}
              <div className="py-4 space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-350">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{t.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{t.email || 'No email registered'}</span>
                </div>
                
                {/* Collapsible emergency contact / ID detail tags */}
                <div className="pt-2.5 border-t border-dashed border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Aadhaar / ID:</span>
                    <span className="font-bold">{t.aadhaar || 'Unverified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Emergency:</span>
                    <span className="truncate font-bold text-slate-700 dark:text-slate-300" title={t.emergency_contact}>
                      {t.emergency_contact || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Lease Start:</span>
                    <span>{t.move_in_date ? new Date(t.move_in_date).toLocaleDateString() : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Documents Vault */}
            <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button 
                onClick={() => openDoc(t, 'agreement')}
                className="flex-1 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-sky-500 border border-slate-200/40 dark:border-slate-800 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                <FileText size={12} /> Lease Contract
              </button>
              <button 
                onClick={() => openDoc(t, 'id')}
                className="flex-1 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-sky-500 border border-slate-200/40 dark:border-slate-800 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                <FileCheck size={12} /> Aadhaar Vault
              </button>
            </div>
          </div>
        ))}

        {filteredTenants.length === 0 && (
          <div className="col-span-full text-center py-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-medium">
            No resident records match your filters.
          </div>
        )}
      </div>

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><User size={16} className="text-sky-500" /> Create Resident Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Amit Kumar"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Phone Number</label>
                  <input 
                    type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Email Address</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amit@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Aadhaar / ID Card</label>
                  <input 
                    type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} placeholder="1234-5678-9012"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Emergency Contact</label>
                  <input 
                    type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Spouse / Father - 9812..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Lease Move-In</label>
                  <input 
                    type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Custom Rent (₹)</label>
                  <input 
                    type="number" value={rentAmount} onChange={(e) => setRentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Create Resident Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Edit3 size={16} className="text-sky-500" /> Edit Resident Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Amit Kumar"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Phone Number</label>
                  <input 
                    type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Email Address</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amit@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Aadhaar / ID Card</label>
                  <input 
                    type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} placeholder="1234-5678-9012"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Emergency Contact</label>
                  <input 
                    type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Spouse / Father - 9812..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Lease Move-In</label>
                  <input 
                    type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Custom Rent (₹)</label>
                  <input 
                    type="number" value={rentAmount} onChange={(e) => setRentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Update Resident Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mock Document Storage Preview Modal */}
      {showDocModal && activeT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText size={16} className="text-sky-500" />
                {docType === 'agreement' ? 'Lease Lease Agreement' : 'Resident Aadhaar Verification'}
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/40 dark:border-slate-800 flex items-center gap-3">
                <FileText size={32} className="text-sky-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold truncate text-slate-700 dark:text-slate-200">
                    {docType === 'agreement' ? `${activeT.agreement_url || `lease_agreement_${activeT.name.toLowerCase().replace(' ', '_')}.pdf`}` : `${activeT.id_proof_url || `aadhaar_verification_${activeT.name.toLowerCase().replace(' ', '_')}.jpg`}`}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Size: 1.4 MB • Format: PDF Document</span>
                </div>
              </div>

              {/* Verification Stamp */}
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/40 dark:border-emerald-800/40">
                <CheckCircle size={15} />
                <span>Verified digital document storage vault</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => alert('Simulating PDF download: Document exported to device downloads.')}
                  className="flex-1 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-colors"
                >
                  <Download size={14} /> Download File
                </button>
                <button 
                  onClick={() => alert('Simulating PDF preview: Opening print preview window.')}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  ✕ Close Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
