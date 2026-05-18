import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Home, 
  Trash2, 
  Edit3, 
  UserPlus, 
  UserMinus, 
  Wrench, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter state
  const [search, setSearch] = useState('');
  const [selectedB, setSelectedB] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  // Room Form state
  const [buildingId, setBuildingId] = useState('');
  const [floorNumber, setFloorNumber] = useState(1);
  const [roomNumber, setRoomNumber] = useState('');
  const [rentAmount, setRentAmount] = useState(0);
  const [roomStatus, setRoomStatus] = useState('vacant');

  // Allocation Form state
  const [tenantId, setTenantId] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [customRent, setCustomRent] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const rList = await api.get<any[]>('/rooms');
      const bList = await api.get<any[]>('/buildings');
      const tList = await api.get<any[]>('/tenants');
      setRooms(rList);
      setBuildings(bList);
      setTenants(tList);
      
      if (bList.length > 0) setBuildingId(bList[0].id.toString());
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms configuration.');
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
      await api.post('/rooms', {
        building_id: Number(buildingId),
        floor_number: Number(floorNumber),
        room_number: roomNumber,
        rent_amount: Number(rentAmount),
        status: roomStatus
      });
      setShowAddModal(false);
      resetRoomForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add room');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;
    try {
      await api.put(`/rooms/${activeRoom.id}`, {
        building_id: Number(buildingId),
        floor_number: Number(floorNumber),
        room_number: roomNumber,
        rent_amount: Number(rentAmount),
        status: roomStatus
      });
      setShowEditModal(false);
      resetRoomForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to edit room');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this flat?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete room');
    }
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;
    try {
      await api.post('/allocations', {
        room_id: activeRoom.id,
        tenant_id: Number(tenantId),
        rent_amount: Number(customRent || activeRoom.rent_amount),
        move_in_date: moveInDate || new Date().toISOString().split('T')[0],
        status: 'active'
      });
      
      // Update tenant status to active
      await api.put(`/tenants/${tenantId}`, { status: 'active' });

      setShowAllocateModal(false);
      setActiveRoom(null);
      setTenantId('');
      setMoveInDate('');
      setCustomRent(0);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to allocate tenant');
    }
  };

  const handleReleaseTenant = async (room: any) => {
    if (!confirm(`Are you sure you want to release the tenant from flat ${room.room_number}? This will vacate the room.`)) return;
    try {
      // Find the active allocation
      const allocations = await api.get<any[]>('/allocations');
      const activeAlloc = allocations.find(a => a.room_id === room.id && a.status === 'active');
      
      if (activeAlloc) {
        await api.put(`/allocations/${activeAlloc.id}`, {
          status: 'completed',
          move_out_date: new Date().toISOString().split('T')[0]
        });

        // Update the tenant's profile to previous
        await api.put(`/tenants/${activeAlloc.tenant_id}`, { status: 'previous' });
      } else {
        // Fallback: manually vacate the room in database
        await api.put(`/rooms/${room.id}`, { current_tenant_id: null, status: 'vacant' });
      }
      
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to release tenant');
    }
  };

  const resetRoomForm = () => {
    setFloorNumber(1);
    setRoomNumber('');
    setRentAmount(0);
    setRoomStatus('vacant');
    setActiveRoom(null);
  };

  const openEdit = (room: any) => {
    setActiveRoom(room);
    setBuildingId(room.building_id.toString());
    setFloorNumber(room.floor_number);
    setRoomNumber(room.room_number);
    setRentAmount(room.rent_amount);
    setRoomStatus(room.status);
    setShowEditModal(true);
  };

  const openAllocate = (room: any) => {
    setActiveRoom(room);
    setCustomRent(room.rent_amount);
    setMoveInDate(new Date().toISOString().split('T')[0]);
    
    // Default select first available tenant
    const available = tenants.filter(t => t.status !== 'active');
    if (available.length > 0) setTenantId(available[0].id.toString());
    
    setShowAllocateModal(true);
  };

  // Perform search and filtering
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(search.toLowerCase());
    const matchesBuilding = selectedB ? room.building_id === Number(selectedB) : true;
    const matchesStatus = selectedStatus ? room.status === selectedStatus : true;
    return matchesSearch && matchesBuilding && matchesStatus;
  });

  const getBuildingName = (bId: number) => {
    return buildings.find(b => b.id === bId)?.name || `Tower ${bId}`;
  };

  const getTenantName = (tId: number | null) => {
    if (!tId) return 'None';
    return tenants.find(t => t.id === tId)?.name || 'Linked Tenant';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Filtering apartments catalog...</span>
      </div>
    );
  }

  // Filter tenants who do not already have an active flat
  const availableTenants = tenants.filter(t => t.status !== 'active');

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Society Structure</p>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Flats & Rooms Directory</h2>
        </div>
        <button 
          onClick={() => { resetRoomForm(); setShowAddModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/10 flex items-center gap-1 transition-colors"
        >
          <Plus size={15} /> Add New Flat
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white dark:bg-darkCard rounded-2xl border border-slate-200/50 dark:border-darkBorder shadow-sm flex flex-col md:flex-row items-center gap-4 text-xs font-semibold">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search room/flat number (e.g. A-101)..."
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-darkBorder focus:border-sky-500 px-3.5 py-2 pl-9 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        {/* Building Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0">Tower:</span>
          <select 
            value={selectedB} onChange={(e) => setSelectedB(e.target.value)}
            className="w-full md:w-44 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-darkBorder px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="">All Towers</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0">Status:</span>
          <select 
            value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-44 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-darkBorder px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
            <option value="maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredRooms.map((room) => {
          const statusBg = 
            room.status === 'occupied' ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/40' :
            room.status === 'vacant' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/40' :
            'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/40';

          return (
            <div 
              key={room.id} 
              className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder shadow-sm flex flex-col justify-between group hover:border-sky-500/40 hover:-translate-y-0.5 transition-all"
            >
              {/* Top Meta */}
              <div>
                <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                      <Home size={16} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">{room.room_number}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">{getBuildingName(room.building_id)}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${statusBg}`}>
                    {room.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Attributes list */}
                <div className="py-4 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Floor Level:</span>
                    <span>Floor {room.floor_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Standard Rent:</span>
                    <span>₹{room.rent_amount.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Allocated Resident:</span>
                    <span className={room.current_tenant_id ? 'text-sky-500' : 'text-slate-400'}>
                      {getTenantName(room.current_tenant_id)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                {/* Allocation Triggers */}
                {room.status === 'vacant' ? (
                  <button 
                    onClick={() => openAllocate(room)}
                    className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[10px] shadow-sm shadow-sky-500/10 hover:shadow-sky-500/20 flex items-center gap-1 transition-all"
                  >
                    <UserPlus size={11} /> Allocate Resident
                  </button>
                ) : room.status === 'occupied' ? (
                  <button 
                    onClick={() => handleReleaseTenant(room)}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 font-bold text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <UserMinus size={11} /> Release Resident
                  </button>
                ) : (
                  <button 
                    onClick={() => openEdit(room)}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <Wrench size={11} /> Complete Repair
                  </button>
                )}

                {/* Edit & Delete */}
                <div className="flex gap-1">
                  <button 
                    onClick={() => openEdit(room)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(room.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Home size={16} className="text-sky-500" /> Create Flat Unit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Tower Block</label>
                <select 
                  value={buildingId} onChange={(e) => setBuildingId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Floor Level</label>
                  <input 
                    type="number" required min="1" max="25" value={floorNumber} onChange={(e) => setFloorNumber(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Flat Number</label>
                  <input 
                    type="text" required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. A-101"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Standard Rent (₹)</label>
                <input 
                  type="number" required value={rentAmount} onChange={(e) => setRentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Initial Status</label>
                <select 
                  value={roomStatus} onChange={(e) => setRoomStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="vacant">Vacant</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Create Flat Unit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><Edit3 size={16} className="text-sky-500" /> Edit Flat Configuration</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Tower Block</label>
                <select 
                  value={buildingId} onChange={(e) => setBuildingId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Floor Level</label>
                  <input 
                    type="number" required min="1" max="25" value={floorNumber} onChange={(e) => setFloorNumber(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Flat Number</label>
                  <input 
                    type="text" required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. A-101"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Standard Rent (₹)</label>
                <input 
                  type="number" required value={rentAmount} onChange={(e) => setRentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Flat Unit Status</label>
                <select 
                  value={roomStatus} onChange={(e) => setRoomStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md">
                Update Flat Layout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Allocation Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-2xl p-6 relative overflow-hidden fade-in text-slate-800 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><UserPlus size={16} className="text-sky-500" /> Allocate Flat Unit</h3>
              <button onClick={() => setShowAllocateModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-xs">✕</button>
            </div>
            
            <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/40 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Unit Details</p>
                <div className="flex justify-between mt-1 text-xs">
                  <span>Unit: <span className="font-extrabold text-slate-700 dark:text-white">{activeRoom?.room_number}</span></span>
                  <span>Default Rent: <span className="font-extrabold text-slate-700 dark:text-white">₹{activeRoom?.rent_amount.toLocaleString('en-IN')}/mo</span></span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Select Resident Profile</label>
                {availableTenants.length > 0 ? (
                  <select 
                    value={tenantId} onChange={(e) => setTenantId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  >
                    {availableTenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Phone: {t.phone})</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-rose-300 dark:border-rose-900/50 bg-rose-50/20 text-rose-500 font-medium">
                    No vacant tenant profiles registered. Please add a tenant first in the Tenants screen!
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Move-In Date</label>
                  <input 
                    type="date" required value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Agreed Rent (₹)</label>
                  <input 
                    type="number" value={customRent} onChange={(e) => setCustomRent(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={availableTenants.length === 0}
                className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
              >
                Approve Allocation Lease
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
