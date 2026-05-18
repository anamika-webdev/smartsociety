import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Receipt, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Send, 
  QrCode,
  TrendingUp,
  FileSpreadsheet,
  Plus
} from 'lucide-react';

export const RentBilling: React.FC = () => {
  const user = api.auth.getCurrentUser();
  const role = user?.role || 'tenant';
  
  const [payments, setPayments] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [activePayment, setActivePayment] = useState<any>(null);

  // Pay Form fields
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'net_banking'>('upi');
  const [simulatedPaying, setSimulatedPaying] = useState(false);

  // New Invoice fields
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('May 2026');
  const [invoiceAmount, setInvoiceAmount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const pList = await api.get<any[]>('/payments');
      const tList = await api.get<any[]>('/tenants');
      const rList = await api.get<any[]>('/rooms');
      setPayments(pList);
      setTenants(tList);
      setRooms(rList);

      if (tList.length > 0) {
        setSelectedTenantId(tList[0].id.toString());
        setInvoiceAmount(tList[0].rent_amount);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch billing ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePayment) return;
    setSimulatedPaying(true);
    
    // Simulate minor processing lag
    setTimeout(async () => {
      try {
        await api.put(`/payments/${activePayment.id}`, {
          status: 'paid',
          payment_method: paymentMethod
        });
        setShowPayModal(false);
        setActivePayment(null);
        setSimulatedPaying(false);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Payment simulation failed');
        setSimulatedPaying(false);
      }
    }, 1500);
  };

  const handleAddInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedT = tenants.find(t => t.id === Number(selectedTenantId));
      const activeRoom = rooms.find(r => r.current_tenant_id === Number(selectedTenantId));
      
      if (!activeRoom) {
        alert('This tenant is not allocated to any active flat unit yet.');
        return;
      }

      await api.post('/payments', {
        tenant_id: Number(selectedTenantId),
        room_id: activeRoom.id,
        amount: Number(invoiceAmount || selectedT.rent_amount),
        billing_period: billingPeriod,
        status: 'pending'
      });

      setShowAddInvoiceModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoice');
    }
  };

  const triggerPaymentReminder = (payment: any) => {
    const t = tenants.find(ten => ten.id === payment.tenant_id);
    alert(`Reminder notification dispatched to ${t?.name} via email & WhatsApp successfully!`);
  };

  const getTenantName = (tId: number) => {
    return tenants.find(t => t.id === tId)?.name || 'Resident';
  };

  const getFlatNumber = (rId: number) => {
    return rooms.find(r => r.id === rId)?.room_number || 'N/A';
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Opening rent ledger...</span>
      </div>
    );
  }

  // Calculate stats
  const totalInvoices = payments.length;
  const collectedRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingDues = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Accounting Ledger</p>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Rent & Billings Ledger</h2>
        </div>
        {role !== 'tenant' && (
          <button 
            onClick={() => setShowAddInvoiceModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/10 flex items-center gap-1 transition-colors"
          >
            <Plus size={15} /> Generate Month Invoice
          </button>
        )}
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Receipt size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider leading-none mb-1">Total Bills</span>
            <p className="text-base font-black text-slate-800 dark:text-white">{totalInvoices}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider leading-none mb-1">Revenue Collected</span>
            <p className="text-base font-black text-slate-800 dark:text-white">₹{collectedRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider leading-none mb-1">Outstanding Dues</span>
            <p className="text-base font-black text-slate-800 dark:text-white">₹{pendingDues.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-200/60 dark:border-darkBorder overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Active Society Invoices</h3>
          <button 
            onClick={() => alert('Simulating Spreadsheet export: Downloading ledger.xlsx')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold text-[10px] flex items-center gap-1 transition-colors"
          >
            <FileSpreadsheet size={13} /> Export Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-extrabold text-slate-400 border-b border-slate-100 dark:border-slate-800 tracking-wider uppercase">
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Resident</th>
                <th className="px-6 py-3.5">Flat Number</th>
                <th className="px-6 py-3.5">Month</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Paid Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{p.invoice_number}</td>
                  <td className="px-6 py-4">{getTenantName(p.tenant_id)}</td>
                  <td className="px-6 py-4">{getFlatNumber(p.room_id)}</td>
                  <td className="px-6 py-4">{p.billing_period}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5 shrink-0">
                    {p.status !== 'paid' && role === 'tenant' && (
                      <button 
                        onClick={() => { setActivePayment(p); setShowPayModal(true); }}
                        className="py-1 px-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] shadow shadow-sky-500/10 hover:shadow-sky-500/20 transition-all flex items-center gap-1 inline-flex"
                      >
                        <CreditCard size={11} /> Pay Bill
                      </button>
                    )}

                    {p.status !== 'paid' && role !== 'tenant' && (
                      <>
                        <button 
                          onClick={() => {
                            if (confirm('Verify cash payment collection?')) {
                              api.put(`/payments/${p.id}`, { status: 'paid', payment_method: 'cash' }).then(fetchData);
                            }
                          }}
                          className="py-1 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] transition-colors inline-flex"
                        >
                          Mark Paid
                        </button>
                        <button 
                          onClick={() => triggerPaymentReminder(p)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-sky-500 transition-colors inline-flex"
                        >
                          <Send size={11} />
                        </button>
                      </>
                    )}

                    {p.status === 'paid' && (
                      <button 
                        onClick={() => { setActivePayment(p); setShowReceiptModal(true); }}
                        className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-sky-500 font-bold text-[10px] inline-flex items-center gap-0.5"
                      >
                        <Download size={11} /> Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">No invoices registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPI QR Payment Simulator Modal */}
      {showPayModal && activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><CreditCard size={16} className="text-sky-500" /> UPI Payment Gateway</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4 text-xs font-semibold text-center flex flex-col items-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoice Details</p>
              <div className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/40 dark:border-slate-800">
                <p className="text-slate-400">Total Bill Amount</p>
                <p className="text-xl font-black text-slate-800 dark:text-white mt-1">₹{Number(activePayment.amount).toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-sky-500 font-bold block mt-1">Period: {activePayment.billing_period}</span>
              </div>

              {/* Simulated QR Code Scan */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 my-2">
                <QrCode size={120} className="text-slate-800" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scan using any UPI App</span>
              </div>

              <div className="w-full text-left">
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Or Choose Payment Method</label>
                <select 
                  value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="upi">BHIM UPI QR Scanner</option>
                  <option value="card">Credit / Debit Card Payments</option>
                  <option value="net_banking">Net Banking Transfer</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={simulatedPaying}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-400 hover:to-indigo-550 text-white font-bold text-xs shadow-md transition-colors"
              >
                {simulatedPaying ? 'Simulating Secure Authorization...' : 'Simulate Successful UPI Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {showReceiptModal && activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Receipt size={16} className="text-sky-500" /> Digital Payment Receipt</h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>

            <div className="space-y-4 text-xs font-semibold p-4 rounded-2xl border border-slate-200/50 dark:border-darkBorder bg-slate-50 dark:bg-slate-900/30">
              <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-[18px] font-extrabold bg-gradient-to-r from-sky-500 to-indigo-650 bg-clip-text text-transparent">SMART SOCIETY ERP</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Transaction Invoice Receipt</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Invoice Number:</span>
                  <span className="font-extrabold">{activePayment.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated Resident:</span>
                  <span className="font-bold">{getTenantName(activePayment.tenant_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flat Number:</span>
                  <span className="font-bold">{getFlatNumber(activePayment.room_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billing Period:</span>
                  <span className="font-bold">{activePayment.billing_period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settlement Method:</span>
                  <span className="font-bold uppercase text-sky-500">{activePayment.payment_method || 'direct'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settlement Date:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">
                    {activePayment.payment_date ? new Date(activePayment.payment_date).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
                  <span className="text-slate-400 font-extrabold">Amount Settled:</span>
                  <span className="font-black text-emerald-500">₹{Number(activePayment.amount).toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              {/* Stamp */}
              <div className="flex items-center gap-1.5 justify-center py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-[10px] font-bold uppercase">
                <CheckCircle size={13} /> Verified Digital Settlement Complete
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => alert('Receipt downloaded as PDF successfully.')}
                  className="flex-1 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-md"
                >
                  <Download size={13} /> Export PDF
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-[10px] flex items-center justify-center gap-1"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Receipt size={16} className="text-sky-500" /> Create Monthly Rent Invoice</h3>
              <button onClick={() => setShowAddInvoiceModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleAddInvoiceSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Select Resident Profile</label>
                <select 
                  value={selectedTenantId} onChange={(e) => {
                    setSelectedTenantId(e.target.value);
                    const selectedT = tenants.find(t => t.id === Number(e.target.value));
                    if (selectedT) setInvoiceAmount(selectedT.rent_amount);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  {tenants.filter(t => t.status === 'active').map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Phone: {t.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Billing Month</label>
                  <input 
                    type="text" required value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} placeholder="e.g. May 2026"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Invoice Amount (₹)</label>
                  <input 
                    type="number" required value={invoiceAmount} onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Generate Invoices
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
