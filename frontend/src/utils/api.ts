const API_BASE_URL = import.meta.env.VITE_API_URL || 
  `${window.location.protocol}//${window.location.hostname}:5000/api`;

const LOCAL_STORAGE_DB_KEY = 'smart_society_offline_db';

// Helper to initialize and retrieve client-side LocalStorage DB
const getInitialLocalDb = () => {
  return {
    users: [
      { id: 1, name: 'Vikram Singh', email: 'superadmin@smartsociety.com', password: 'superadmin123', role: 'super_admin', phone: '9876543210', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date().toISOString() },
      { id: 2, name: 'Rajesh Mehta', email: 'admin@smartsociety.com', password: 'admin123', role: 'society_admin', phone: '9876543211', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date().toISOString() },
      { id: 3, name: 'Ramesh Kumar', email: 'caretaker@smartsociety.com', password: 'caretaker123', role: 'caretaker', phone: '9876543212', avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date().toISOString() },
      { id: 4, name: 'Ananya Sharma', email: 'tenant@smartsociety.com', password: 'tenant123', role: 'tenant', phone: '9876543213', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date().toISOString() },
      { id: 5, name: 'Amit Patel', email: 'amit@example.com', password: 'tenant123', role: 'tenant', phone: '9812345670', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date().toISOString() },
      { id: 6, name: 'Sneha Reddy', email: 'sneha@example.com', password: 'tenant123', role: 'tenant', phone: '9812345671', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date().toISOString() }
    ],
    buildings: [
      { id: 1, name: 'Tower A (Aspire)', description: 'Premium 2BHK and 3BHK residential tower', floors_count: 6, created_at: new Date().toISOString() },
      { id: 2, name: 'Tower B (Breeze)', description: 'Luxury 3BHK flats with garden view', floors_count: 7, created_at: new Date().toISOString() },
      { id: 3, name: 'Tower C (Crown)', description: 'Studio and 1BHK executive flats', floors_count: 6, created_at: new Date().toISOString() },
      { id: 4, name: 'Tower D (Deluxe)', description: 'Exclusive duplex penthouses & flats', floors_count: 7, created_at: new Date().toISOString() }
    ],
    tenants: [
      { id: 1, user_id: 4, name: 'Ananya Sharma', phone: '9876543213', email: 'tenant@smartsociety.com', aadhaar: '1234-5678-9012', emergency_contact: 'Sunil Sharma (Father) - 9876543219', move_in_date: '2025-01-10', rent_amount: 18000, status: 'active', agreement_url: 'agreement_ananya.pdf', id_proof_url: 'id_ananya.pdf', created_at: new Date().toISOString() },
      { id: 2, user_id: 5, name: 'Amit Patel', phone: '9812345670', email: 'amit@example.com', aadhaar: '2345-6789-0123', emergency_contact: 'Kiran Patel (Spouse) - 9812345679', move_in_date: '2025-02-15', rent_amount: 22000, status: 'active', agreement_url: 'agreement_amit.pdf', id_proof_url: 'id_amit.pdf', created_at: new Date().toISOString() },
      { id: 3, user_id: 6, name: 'Sneha Reddy', phone: '9812345671', email: 'sneha@example.com', aadhaar: '3456-7890-1234', emergency_contact: 'Venkat Reddy (Brother) - 9812345678', move_in_date: '2025-03-01', rent_amount: 15000, status: 'active', agreement_url: 'agreement_sneha.pdf', id_proof_url: 'id_sneha.pdf', created_at: new Date().toISOString() },
      { id: 4, user_id: null, name: 'Rahul Verma', phone: '9812345672', email: 'rahul@example.com', aadhaar: '4567-8901-2345', emergency_contact: 'S. K. Verma (Father) - 9812345677', move_in_date: '2024-05-10', rent_amount: 12000, status: 'previous', agreement_url: 'agreement_rahul.pdf', id_proof_url: 'id_rahul.pdf', created_at: new Date().toISOString() }
    ],
    rooms: [
      { id: 1, building_id: 1, floor_number: 1, room_number: 'A-101', status: 'occupied', rent_amount: 18000, current_tenant_id: 1, created_at: new Date().toISOString() },
      { id: 2, building_id: 1, floor_number: 1, room_number: 'A-102', status: 'vacant', rent_amount: 18000, current_tenant_id: null, created_at: new Date().toISOString() },
      { id: 3, building_id: 1, floor_number: 2, room_number: 'A-201', status: 'occupied', rent_amount: 18500, current_tenant_id: 2, created_at: new Date().toISOString() },
      { id: 4, building_id: 1, floor_number: 2, room_number: 'A-202', status: 'maintenance', rent_amount: 18500, current_tenant_id: null, created_at: new Date().toISOString() },
      { id: 5, building_id: 2, floor_number: 1, room_number: 'B-101', status: 'occupied', rent_amount: 22000, current_tenant_id: 3, created_at: new Date().toISOString() },
      { id: 6, building_id: 2, floor_number: 1, room_number: 'B-102', status: 'vacant', rent_amount: 22000, current_tenant_id: null, created_at: new Date().toISOString() },
      { id: 7, building_id: 3, floor_number: 1, room_number: 'C-101', status: 'vacant', rent_amount: 12000, current_tenant_id: null, created_at: new Date().toISOString() },
      { id: 8, building_id: 3, floor_number: 1, room_number: 'C-102', status: 'vacant', rent_amount: 12000, current_tenant_id: null, created_at: new Date().toISOString() },
      { id: 9, building_id: 4, floor_number: 1, room_number: 'D-101', status: 'vacant', rent_amount: 25000, current_tenant_id: null, created_at: new Date().toISOString() }
    ],
    allocations: [
      { id: 1, room_id: 1, tenant_id: 1, rent_amount: 18000, move_in_date: '2025-01-10', move_out_date: null, status: 'active', agreement_url: 'agreement_ananya.pdf', created_at: new Date().toISOString() },
      { id: 2, room_id: 3, tenant_id: 2, rent_amount: 22000, move_in_date: '2025-02-15', move_out_date: null, status: 'active', agreement_url: 'agreement_amit.pdf', created_at: new Date().toISOString() },
      { id: 3, room_id: 5, tenant_id: 3, rent_amount: 15000, move_in_date: '2025-03-01', move_out_date: null, status: 'active', agreement_url: 'agreement_sneha.pdf', created_at: new Date().toISOString() },
      { id: 4, room_id: 7, tenant_id: 4, rent_amount: 12000, move_in_date: '2024-05-10', move_out_date: '2025-02-28', status: 'completed', agreement_url: 'agreement_rahul.pdf', created_at: new Date().toISOString() }
    ],
    complaints: [
      { id: 1, tenant_id: 1, category: 'water', title: 'Water leakage in bathroom pipe', description: 'The flush tank pipe is leaking water continuously, creating a mess on the floor. Please resolve this urgently.', priority: 'emergency', status: 'open', proof_url: '/uploads/water_leak.jpg', admin_comments: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 2, tenant_id: 2, category: 'electricity', title: 'Power fluctuation in living room', description: 'Living room lights flicker constantly when the AC is switched on. Could be a socket issue or voltage stabilizer fault.', priority: 'high', status: 'in_progress', proof_url: null, admin_comments: 'Electrician assigned. Will visit tomorrow morning.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
      { id: 3, tenant_id: 3, category: 'internet', title: 'Fiber connection downtime', description: 'Society common WiFi and in-room fiber link has been offline since last night. Broadband status light is red.', priority: 'medium', status: 'resolved', proof_url: null, admin_comments: 'Broadband operator repaired cut optic cable on main gate. Resolved.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() }
    ],
    payments: [
      { id: 1, tenant_id: 1, room_id: 1, amount: 18000, billing_period: 'May 2026', status: 'paid', payment_date: new Date(2026, 4, 5, 11, 30).toISOString(), payment_method: 'upi', invoice_number: 'INV-2026-001', receipt_url: 'receipt_001.pdf', created_at: new Date(2026, 4, 1).toISOString() },
      { id: 2, tenant_id: 2, room_id: 3, amount: 22000, billing_period: 'May 2026', status: 'paid', payment_date: new Date(2026, 4, 3, 15, 45).toISOString(), payment_method: 'net_banking', invoice_number: 'INV-2026-002', receipt_url: 'receipt_002.pdf', created_at: new Date(2026, 4, 1).toISOString() },
      { id: 3, tenant_id: 3, room_id: 5, amount: 15000, billing_period: 'May 2026', status: 'pending', payment_date: null, payment_method: null, invoice_number: 'INV-2026-003', receipt_url: null, created_at: new Date(2026, 4, 1).toISOString() },
      { id: 4, tenant_id: 1, room_id: 1, amount: 18000, billing_period: 'April 2026', status: 'paid', payment_date: new Date(2026, 3, 4, 10, 0).toISOString(), payment_method: 'upi', invoice_number: 'INV-2026-004', receipt_url: 'receipt_004.pdf', created_at: new Date(2026, 3, 1).toISOString() }
    ],
    visitors: [
      { id: 1, name: 'Mahesh Vyas', phone: '9988776655', purpose: 'Delivery (Amazon)', vehicle_number: 'DL-3C-AS-1234', flat_number: 'A-101', check_in: new Date(Date.now() - 1000 * 60 * 30).toISOString(), check_out: null, gate_pass: 'PASS-78932', created_at: new Date().toISOString() },
      { id: 2, name: 'Sanjay Dutt', phone: '9988776654', purpose: 'Guest (Friend of Tenant)', vehicle_number: 'MH-12-PQ-9876', flat_number: 'B-101', check_in: new Date(Date.now() - 1000 * 60 * 180).toISOString(), check_out: new Date(Date.now() - 1000 * 60 * 45).toISOString(), gate_pass: 'PASS-55412', created_at: new Date().toISOString() }
    ],
    notices: [
      { id: 1, title: 'Annual General Meeting (AGM) Scheduled', content: 'All residents and owners are requested to attend the Annual General Meeting on Sunday, May 24th, 2026 at 10:00 AM in the Clubhouse. Discussion points: security upgradation, painting schedule, and accounts approval.', type: 'announcement', date: '2026-05-24', created_by: 2, created_at: new Date().toISOString() },
      { id: 2, title: 'URGENT: Water Supply Maintenance Shutdown', content: 'Please note that water supply will be suspended this Wednesday (May 20th, 2026) from 10:00 AM to 2:00 PM for overhead tank cleaning. Residents are requested to store sufficient water in advance.', type: 'emergency', date: '2026-05-20', created_by: 2, created_at: new Date().toISOString() },
      { id: 3, title: 'Elevator Maintenance Tower A & B', content: 'Elevators of Tower A & B will be under routine servicing on May 19th from 2:00 PM to 5:00 PM. Kindly use the staircases during this brief window.', type: 'maintenance', date: '2026-05-19', created_by: 3, created_at: new Date().toISOString() }
    ],
    maintenance_tasks: [
      { id: 1, title: 'Overhead Tank Cleaning', description: 'Biannual deep cleaning and sanitization of water tanks.', staff_name: 'SuperClean Services', cost: 7500, scheduled_date: '2026-05-20', status: 'scheduled', building_id: 1, created_at: new Date().toISOString() },
      { id: 2, title: 'Fire Extinguisher Refill & Drill', description: 'Inspecting, recharging extinguishers and conducting safety check.', staff_name: 'SafeGuard Fire Corp', cost: 12000, scheduled_date: '2026-05-15', status: 'completed', building_id: null, created_at: new Date().toISOString() },
      { id: 3, title: 'Garden Trimming & Lawn Maintenance', description: 'Beautifying society lawns and perimeter hedges.', staff_name: 'GreenThumbs Nursery', cost: 3500, scheduled_date: '2026-05-18', status: 'in_progress', building_id: null, created_at: new Date().toISOString() }
    ],
    auditLogs: [
      { id: 1, user_id: 2, action: 'User Login', details: 'Society Admin (Rajesh Mehta) logged in successfully', timestamp: new Date().toISOString() }
    ]
  };
};

const getLocalDb = (): any => {
  const data = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
  if (!data) {
    const fresh = getInitialLocalDb();
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(data);
  } catch {
    const fresh = getInitialLocalDb();
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
};

const saveLocalDb = (data: any) => {
  localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(data));
};

// ----------------------------------------------------
// FULL-STACK SERVERLESS LOCALSTORAGE HANDLER ENGINE
// ----------------------------------------------------
const handleLocalStorageFallback = async (method: string, endpoint: string, data: any): Promise<any> => {
  console.log(`📡 Offline Sandbox active. Intercepting: [${method}] ${endpoint}`, data);
  const db = getLocalDb();

  // Helper to fetch current logged in user
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  // 1. AUTHENTICATION
  if (endpoint === '/auth/login' && method === 'POST') {
    const user = db.users.find((u: any) => u.email === data.email);
    if (!user) throw new Error('Invalid email or password');
    if (data.password !== user.password) throw new Error('Invalid email or password');
    
    // Simulate linking active tenant
    let tenantProfile = null;
    if (user.role === 'tenant') {
      tenantProfile = db.tenants.find((t: any) => t.user_id === user.id && t.status === 'active') || null;
    }
    
    const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(7);
    db.auditLogs.unshift({
      id: db.auditLogs.length + 1,
      user_id: user.id,
      action: 'User Login',
      details: `${user.name} offline login successful.`,
      timestamp: new Date().toISOString()
    });
    saveLocalDb(db);

    return {
      token: mockToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        tenantId: tenantProfile ? tenantProfile.id : null
      }
    };
  }

  if (endpoint === '/auth/register' && method === 'POST') {
    const exists = db.users.some((u: any) => u.email === data.email);
    if (exists) throw new Error('A user with this email already exists');
    
    const newUser = {
      id: db.users.length + 1,
      name: data.name,
      email: data.email,
      password: data.password || 'tenant123',
      role: data.role || 'tenant',
      phone: data.phone || '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      status: 'active',
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    
    db.auditLogs.unshift({
      id: db.auditLogs.length + 1,
      user_id: newUser.id,
      action: 'User Registered',
      details: `Created offline account: ${newUser.name} as ${newUser.role}.`,
      timestamp: new Date().toISOString()
    });
    saveLocalDb(db);

    return {
      token: 'mock_jwt_token_' + Math.random().toString(36).substring(7),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        tenantId: null
      }
    };
  }

  if (endpoint === '/auth/profile') {
    const active = getCurrentUser();
    if (!active) throw new Error('Unauthenticated');
    if (method === 'GET') {
      const match = db.users.find((u: any) => u.id === active.id);
      if (!match) throw new Error('Profile not found');
      return match;
    }
    if (method === 'PUT') {
      const idx = db.users.findIndex((u: any) => u.id === active.id);
      if (idx === -1) throw new Error('Profile not found');
      db.users[idx] = { ...db.users[idx], ...data };
      saveLocalDb(db);
      return db.users[idx];
    }
  }

  // 2. BUILDINGS
  if (endpoint === '/buildings') {
    if (method === 'GET') return db.buildings;
    if (method === 'POST') {
      const newItem = { id: db.buildings.length + 1, ...data, created_at: new Date().toISOString() };
      db.buildings.push(newItem);
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/buildings/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'PUT') {
      const idx = db.buildings.findIndex((b: any) => b.id === id);
      if (idx === -1) throw new Error('Building not found');
      db.buildings[idx] = { ...db.buildings[idx], ...data };
      saveLocalDb(db);
      return db.buildings[idx];
    }
    if (method === 'DELETE') {
      db.buildings = db.buildings.filter((b: any) => b.id !== id);
      db.rooms = db.rooms.filter((r: any) => r.building_id !== id);
      saveLocalDb(db);
      return { success: true };
    }
  }

  // 3. ROOMS
  if (endpoint === '/rooms') {
    if (method === 'GET') return db.rooms;
    if (method === 'POST') {
      const newItem = { id: db.rooms.length + 1, ...data, current_tenant_id: null, created_at: new Date().toISOString() };
      db.rooms.push(newItem);
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/rooms/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'PUT') {
      const idx = db.rooms.findIndex((r: any) => r.id === id);
      if (idx === -1) throw new Error('Flat not found');
      db.rooms[idx] = { ...db.rooms[idx], ...data };
      saveLocalDb(db);
      return db.rooms[idx];
    }
    if (method === 'DELETE') {
      db.rooms = db.rooms.filter((r: any) => r.id !== id);
      saveLocalDb(db);
      return { success: true };
    }
  }

  // 4. TENANTS
  if (endpoint === '/tenants') {
    if (method === 'GET') return db.tenants;
    if (method === 'POST') {
      const newItem = { id: db.tenants.length + 1, ...data, created_at: new Date().toISOString() };
      db.tenants.push(newItem);
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/tenants/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'PUT') {
      const idx = db.tenants.findIndex((t: any) => t.id === id);
      if (idx === -1) throw new Error('Resident profile not found');
      db.tenants[idx] = { ...db.tenants[idx], ...data };
      saveLocalDb(db);
      return db.tenants[idx];
    }
    if (method === 'DELETE') {
      db.tenants = db.tenants.filter((t: any) => t.id !== id);
      saveLocalDb(db);
      return { success: true };
    }
  }

  // 5. ALLOCATIONS
  if (endpoint === '/allocations') {
    if (method === 'GET') return db.allocations;
    if (method === 'POST') {
      const newItem = { id: db.allocations.length + 1, ...data, created_at: new Date().toISOString() };
      db.allocations.push(newItem);
      
      // Update room to occupied
      const rIdx = db.rooms.findIndex((r: any) => r.id === Number(data.room_id));
      if (rIdx !== -1) {
        db.rooms[rIdx].status = 'occupied';
        db.rooms[rIdx].current_tenant_id = Number(data.tenant_id);
      }
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/allocations/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'PUT') {
      const idx = db.allocations.findIndex((a: any) => a.id === id);
      if (idx === -1) throw new Error('Allocation not found');
      db.allocations[idx] = { ...db.allocations[idx], ...data };
      
      if (data.status === 'completed') {
        const rIdx = db.rooms.findIndex((r: any) => r.id === db.allocations[idx].room_id);
        if (rIdx !== -1) {
          db.rooms[rIdx].status = 'vacant';
          db.rooms[rIdx].current_tenant_id = null;
        }
      }
      saveLocalDb(db);
      return db.allocations[idx];
    }
  }

  // 6. COMPLAINTS
  if (endpoint === '/complaints') {
    if (method === 'GET') {
      const active = getCurrentUser();
      if (active && active.role === 'tenant') {
        const profile = db.tenants.find((t: any) => t.user_id === active.id);
        if (profile) return db.complaints.filter((c: any) => c.tenant_id === profile.id);
      }
      return db.complaints;
    }
    if (method === 'POST') {
      const active = getCurrentUser();
      const profile = db.tenants.find((t: any) => t.user_id === active.id && t.status === 'active');
      if (!profile) throw new Error('No active resident profile associated with this account');
      
      const newItem = {
        id: db.complaints.length + 1,
        tenant_id: profile.id,
        category: data instanceof FormData ? data.get('category') : data.category,
        title: data instanceof FormData ? data.get('title') : data.title,
        description: data instanceof FormData ? data.get('description') : data.description,
        priority: (data instanceof FormData ? data.get('priority') : data.priority) || 'medium',
        proof_url: null,
        admin_comments: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.complaints.unshift(newItem);
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/complaints/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'PUT') {
      const idx = db.complaints.findIndex((c: any) => c.id === id);
      if (idx === -1) throw new Error('Ticket not found');
      db.complaints[idx] = { ...db.complaints[idx], ...data, updated_at: new Date().toISOString() };
      saveLocalDb(db);
      return db.complaints[idx];
    }
  }

  // 7. PAYMENTS
  if (endpoint === '/payments') {
    if (method === 'GET') {
      const active = getCurrentUser();
      if (active && active.role === 'tenant') {
        const profile = db.tenants.find((t: any) => t.user_id === active.id);
        if (profile) return db.payments.filter((p: any) => p.tenant_id === profile.id);
      }
      return db.payments;
    }
    if (method === 'POST') {
      const newItem = { id: db.payments.length + 1, ...data, created_at: new Date().toISOString() };
      db.payments.push(newItem);
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/payments/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'PUT') {
      const idx = db.payments.findIndex((p: any) => p.id === id);
      if (idx === -1) throw new Error('Invoice not found');
      db.payments[idx] = { 
        ...db.payments[idx], 
        ...data, 
        payment_date: data.payment_method ? new Date().toISOString() : null 
      };
      saveLocalDb(db);
      return db.payments[idx];
    }
  }

  // 8. VISITORS
  if (endpoint === '/visitors') {
    if (method === 'GET') return db.visitors;
    if (method === 'POST') {
      const newItem = { id: db.visitors.length + 1, ...data, created_at: new Date().toISOString() };
      db.visitors.unshift(newItem);
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/visitors/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'PUT') {
      const idx = db.visitors.findIndex((v: any) => v.id === id);
      if (idx === -1) throw new Error('Guest record not found');
      db.visitors[idx] = { ...db.visitors[idx], check_out: new Date().toISOString() };
      saveLocalDb(db);
      return db.visitors[idx];
    }
  }

  // 9. NOTICES
  if (endpoint === '/notices') {
    if (method === 'GET') return db.notices;
    if (method === 'POST') {
      const active = getCurrentUser();
      const newItem = { 
        id: db.notices.length + 1, 
        ...data, 
        created_by: active ? active.id : 2, 
        created_at: new Date().toISOString() 
      };
      db.notices.unshift(newItem);
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/notices/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'DELETE') {
      db.notices = db.notices.filter((n: any) => n.id !== id);
      saveLocalDb(db);
      return { success: true };
    }
  }

  // 10. MAINTENANCE
  if (endpoint === '/maintenance') {
    if (method === 'GET') return db.maintenance_tasks;
    if (method === 'POST') {
      const newItem = { id: db.maintenance_tasks.length + 1, ...data, created_at: new Date().toISOString() };
      db.maintenance_tasks.push(newItem);
      saveLocalDb(db);
      return newItem;
    }
  }
  if (endpoint.startsWith('/maintenance/')) {
    const id = Number(endpoint.split('/').pop());
    if (method === 'PUT') {
      const idx = db.maintenance_tasks.findIndex((m: any) => m.id === id);
      if (idx === -1) throw new Error('Task not found');
      db.maintenance_tasks[idx] = { ...db.maintenance_tasks[idx], ...data };
      saveLocalDb(db);
      return db.maintenance_tasks[idx];
    }
  }

  // 11. AUDIT LOGS
  if (endpoint === '/audit-logs') {
    return db.auditLogs;
  }

  // 12. DASHBOARD ANALYTICS STATS
  if (endpoint === '/dashboard/stats') {
    const active = getCurrentUser();
    
    // Filter parameters
    let filteredRooms = db.rooms;
    let filteredComplaints = db.complaints;
    let filteredPayments = db.payments;

    if (active && active.role === 'tenant') {
      const activeTenant = db.tenants.find((t: any) => t.user_id === active.id);
      if (activeTenant) {
        filteredComplaints = db.complaints.filter((c: any) => c.tenant_id === activeTenant.id);
        filteredPayments = db.payments.filter((p: any) => p.tenant_id === activeTenant.id);
      } else {
        filteredComplaints = [];
        filteredPayments = [];
      }
    }

    const totalOccupied = db.rooms.filter((r: any) => r.status === 'occupied').length;
    const totalVacant = db.rooms.filter((r: any) => r.status === 'vacant').length;
    const totalMaint = db.rooms.filter((r: any) => r.status === 'maintenance').length;
    const pendingComplaints = db.complaints.filter((c: any) => c.status !== 'resolved').length;

    const monthlyRevenue = db.payments
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const pendingDues = db.payments
      .filter((p: any) => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const totalExpenses = db.maintenance_tasks
      .filter((t: any) => t.status === 'completed' || t.status === 'in_progress')
      .reduce((sum: number, t: any) => sum + Number(t.cost), 0);

    const buildingStats = db.buildings.map((b: any) => {
      const bRooms = db.rooms.filter((r: any) => r.building_id === b.id);
      const bOccupied = bRooms.filter((r: any) => r.status === 'occupied').length;
      const bVacant = bRooms.filter((r: any) => r.status === 'vacant').length;
      const bMaint = bRooms.filter((r: any) => r.status === 'maintenance').length;
      return {
        id: b.id,
        name: b.name,
        total: bRooms.length,
        occupied: bOccupied,
        vacant: bVacant,
        maintenance: bMaint
      };
    });

    const revenuePeriods: Record<string, any> = {};
    db.payments.forEach((p: any) => {
      if (!revenuePeriods[p.billing_period]) {
        revenuePeriods[p.billing_period] = { period: p.billing_period, paid: 0, pending: 0 };
      }
      if (p.status === 'paid') {
        revenuePeriods[p.billing_period].paid += Number(p.amount);
      } else {
        revenuePeriods[p.billing_period].pending += Number(p.amount);
      }
    });

    const revenueChart = Object.values(revenuePeriods).slice(-6);

    return {
      summary: {
        occupiedRooms: totalOccupied,
        vacantRooms: totalVacant,
        maintenanceRooms: totalMaint,
        pendingComplaints: pendingComplaints,
        monthlyRevenue: monthlyRevenue,
        pendingDues: pendingDues,
        maintenanceExpenses: totalExpenses,
        totalBuildings: db.buildings.length,
        totalTenants: db.tenants.filter((t: any) => t.status === 'active').length
      },
      buildingStats,
      revenueChart,
      complaintCategoryStats: {
        water: db.complaints.filter((c: any) => c.category === 'water').length,
        electricity: db.complaints.filter((c: any) => c.category === 'electricity').length,
        cleaning: db.complaints.filter((c: any) => c.category === 'cleaning').length,
        security: db.complaints.filter((c: any) => c.category === 'security').length,
        maintenance: db.complaints.filter((c: any) => c.category === 'maintenance').length,
        internet: db.complaints.filter((c: any) => c.category === 'internet').length
      }
    };
  }

  throw new Error(`Endpoint mock [${method}] ${endpoint} not implemented`);
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Generic fetch methods
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP error! status: ${res.status}`);
      }
      return res.json() as Promise<T>;
    } catch (networkErr: any) {
      // Automatic LocalStorage Fallback sandbox mode
      return handleLocalStorageFallback('GET', endpoint, null) as Promise<T>;
    }
  },

  post: async <T>(endpoint: string, data: any, isMultipart = false): Promise<T> => {
    try {
      let headers: HeadersInit = {};
      let body: any;

      if (isMultipart) {
        const token = localStorage.getItem('token');
        if (token) {
          headers = { 'Authorization': `Bearer ${token}` };
        }
        body = data;
      } else {
        headers = getHeaders();
        body = JSON.stringify(data);
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body,
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP error! status: ${res.status}`);
      }
      return res.json() as Promise<T>;
    } catch (networkErr: any) {
      // Automatic LocalStorage Fallback sandbox mode
      return handleLocalStorageFallback('POST', endpoint, data) as Promise<T>;
    }
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP error! status: ${res.status}`);
      }
      return res.json() as Promise<T>;
    } catch (networkErr: any) {
      // Automatic LocalStorage Fallback sandbox mode
      return handleLocalStorageFallback('PUT', endpoint, data) as Promise<T>;
    }
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP error! status: ${res.status}`);
      }
      return res.json() as Promise<T>;
    } catch (networkErr: any) {
      // Automatic LocalStorage Fallback sandbox mode
      return handleLocalStorageFallback('DELETE', endpoint, null) as Promise<T>;
    }
  },

  // Auth specific methods
  auth: {
    login: async (credentials: any) => {
      const data = await api.post<any>('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },
    register: async (userData: any) => {
      const data = await api.post<any>('/auth/register', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    },
    getCurrentUser: () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },
    updateProfile: async (profileData: any) => {
      const data = await api.put<any>('/auth/profile', profileData);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    }
  }
};
