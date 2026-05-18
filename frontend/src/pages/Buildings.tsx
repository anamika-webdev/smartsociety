import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Building2, Layers, Grid, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

export const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeB, setActiveB] = useState<any>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [floorsCount, setFloorsCount] = useState(6);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bList = await api.get<any[]>('/buildings');
      const rList = await api.get<any[]>('/rooms');
      setBuildings(bList);
      setRooms(rList);
    } catch (err: any) {
      setError(err.message || 'Failed to load buildings data.');
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
      await api.post('/buildings', {
        name,
        description,
        floors_count: Number(floorsCount)
      });
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add building');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeB) return;
    try {
      await api.put(`/buildings/${activeB.id}`, {
        name,
        description,
        floors_count: Number(floorsCount)
      });
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update building');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this building? This will delete all rooms/flats under it.')) return;
    try {
      await api.delete(`/buildings/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete building');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setFloorsCount(6);
    setActiveB(null);
  };

  const openEdit = (b: any) => {
    setActiveB(b);
    setName(b.name);
    setDescription(b.description || '');
    setFloorsCount(b.floors_count);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading building layout...</span>
      </div>
    );
  }

  // Calculate high-level aggregates
  const totalBuildings = buildings.length;
  const totalFloors = buildings.reduce((sum, b) => sum + Number(b.floors_count), 0);
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const overallOccupancy = totalRooms ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Society Structure</p>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Tower Management Portal</h2>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/10 flex items-center gap-1 transition-colors"
        >
          <Plus size={15} /> Add New Tower
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Towers</span>
            <p className="text-lg font-black text-slate-800 dark:text-white">{totalBuildings}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Floors</span>
            <p className="text-lg font-black text-slate-800 dark:text-white">{totalFloors}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Grid size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Flats</span>
            <p className="text-lg font-black text-slate-800 dark:text-white">{totalRooms}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-darkCard rounded-xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Occupancy Rate</span>
            <p className="text-lg font-black text-slate-800 dark:text-white">{overallOccupancy}%</p>
          </div>
        </div>
      </div>

      {/* Buildings Cards with Interactive Structure Wireframe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buildings.map((b) => {
          const bRooms = rooms.filter(r => r.building_id === b.id);
          const occupiedCount = bRooms.filter(r => r.status === 'occupied').length;
          const vacantCount = bRooms.filter(r => r.status === 'vacant').length;
          const maintCount = bRooms.filter(r => r.status === 'maintenance').length;
          const occRate = bRooms.length ? Math.round((occupiedCount / bRooms.length) * 100) : 0;

          // Generate floor matrix for vertical wireframe mapping (from top floor down to 1st floor)
          const floorNumbers = Array.from({ length: b.floors_count }, (_, i) => b.floors_count - i);

          return (
            <div 
              key={b.id} 
              className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Header Details */}
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-1.5">
                      <Building2 className="text-sky-500" size={18} /> {b.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{b.description || 'No description provided.'}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Substats */}
                <div className="grid grid-cols-4 gap-2 text-center py-4 my-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Flats</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">{bRooms.length}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Occupied</span>
                    <span className="text-xs font-black text-sky-500">{occupiedCount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Vacant</span>
                    <span className="text-xs font-black text-emerald-500">{vacantCount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Repairs</span>
                    <span className="text-xs font-black text-rose-500">{maintCount}</span>
                  </div>
                </div>

                {/* Interactive Tower Cross-Section Wireframe Visualizer */}
                <div className="border border-slate-200/50 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-950/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 text-center">Interactive Flat Layout</span>
                  
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {floorNumbers.map((floorNum) => {
                      const floorRooms = bRooms.filter(r => r.floor_number === floorNum);
                      return (
                        <div key={floorNum} className="flex items-center gap-3">
                          {/* Floor label */}
                          <span className="w-10 text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 text-right">Floor {floorNum}</span>
                          
                          {/* Rooms dots */}
                          <div className="flex-1 flex gap-2 items-center bg-white dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                            {floorRooms.length > 0 ? (
                              floorRooms.map((room) => {
                                const dotColor = 
                                  room.status === 'occupied' ? 'bg-sky-500 shadow-sky-500/30' :
                                  room.status === 'vacant' ? 'bg-emerald-500 shadow-emerald-500/30' :
                                  'bg-rose-500 shadow-rose-500/30';
                                return (
                                  <div 
                                    key={room.id}
                                    title={`Room ${room.room_number}: ${room.status.toUpperCase()}`}
                                    className={`h-5 px-2 rounded flex items-center justify-center text-[9px] font-extrabold text-white shadow-sm shrink-0 cursor-pointer hover:scale-105 transition-transform ${dotColor}`}
                                  >
                                    {room.room_number.split('-')[1] || room.room_number}
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-600 italic">No flats mapped on this floor</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Occupancy Indicator Bar */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Occupancy Efficiency</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-250">{occRate}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Tower Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Building2 size={16} className="text-sky-500" /> Add New Complex Tower</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Tower Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tower E (Emerald)"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Floors Count</label>
                <input 
                  type="number" required min="1" max="25" value={floorsCount} onChange={(e) => setFloorsCount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Description</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide building layout overview..." rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition-colors"
              >
                Create Tower Structure
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tower Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Building2 size={16} className="text-sky-500" /> Edit Tower Layout</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Tower Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tower E (Emerald)"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Floors Count</label>
                <input 
                  type="number" required min="1" max="25" value={floorsCount} onChange={(e) => setFloorsCount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Description</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide building layout overview..." rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition-colors"
              >
                Update Tower Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
