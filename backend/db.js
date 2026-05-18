const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const JSON_DB_PATH = path.join(__dirname, 'database.json');
let mysqlPool = null;
let useFallback = false;
let localData = {};

// Helper to encrypt password
const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

// Sample rich dummy data to seed
const getSeedData = () => {
  const users = [
    { id: 1, name: 'Vikram Singh', email: 'superadmin@smartsociety.com', password: hashPassword('superadmin123'), role: 'super_admin', phone: '9876543210', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date() },
    { id: 2, name: 'Rajesh Mehta', email: 'admin@smartsociety.com', password: hashPassword('admin123'), role: 'society_admin', phone: '9876543211', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date() },
    { id: 3, name: 'Ramesh Kumar', email: 'caretaker@smartsociety.com', password: hashPassword('caretaker123'), role: 'caretaker', phone: '9876543212', avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date() },
    { id: 4, name: 'Ananya Sharma', email: 'tenant@smartsociety.com', password: hashPassword('tenant123'), role: 'tenant', phone: '9876543213', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date() },
    { id: 5, name: 'Amit Patel', email: 'amit@example.com', password: hashPassword('tenant123'), role: 'tenant', phone: '9812345670', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date() },
    { id: 6, name: 'Sneha Reddy', email: 'sneha@example.com', password: hashPassword('tenant123'), role: 'tenant', phone: '9812345671', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80', status: 'active', created_at: new Date() }
  ];

  const buildings = [
    { id: 1, name: 'Tower A (Aspire)', description: 'Premium 2BHK and 3BHK residential tower', floors_count: 6, created_at: new Date() },
    { id: 2, name: 'Tower B (Breeze)', description: 'Luxury 3BHK flats with garden view', floors_count: 7, created_at: new Date() },
    { id: 3, name: 'Tower C (Crown)', description: 'Studio and 1BHK executive flats', floors_count: 6, created_at: new Date() },
    { id: 4, name: 'Tower D (Deluxe)', description: 'Exclusive duplex penthouses & flats', floors_count: 7, created_at: new Date() }
  ];

  const tenants = [
    { id: 1, user_id: 4, name: 'Ananya Sharma', phone: '9876543213', email: 'tenant@smartsociety.com', aadhaar: '1234-5678-9012', emergency_contact: 'Sunil Sharma (Father) - 9876543219', move_in_date: '2025-01-10', rent_amount: 18000, status: 'active', agreement_url: 'agreement_ananya.pdf', id_proof_url: 'id_ananya.pdf', created_at: new Date() },
    { id: 2, user_id: 5, name: 'Amit Patel', phone: '9812345670', email: 'amit@example.com', aadhaar: '2345-6789-0123', emergency_contact: 'Kiran Patel (Spouse) - 9812345679', move_in_date: '2025-02-15', rent_amount: 22000, status: 'active', agreement_url: 'agreement_amit.pdf', id_proof_url: 'id_amit.pdf', created_at: new Date() },
    { id: 3, user_id: 6, name: 'Sneha Reddy', phone: '9812345671', email: 'sneha@example.com', aadhaar: '3456-7890-1234', emergency_contact: 'Venkat Reddy (Brother) - 9812345678', move_in_date: '2025-03-01', rent_amount: 15000, status: 'active', agreement_url: 'agreement_sneha.pdf', id_proof_url: 'id_sneha.pdf', created_at: new Date() },
    { id: 4, user_id: null, name: 'Rahul Verma', phone: '9812345672', email: 'rahul@example.com', aadhaar: '4567-8901-2345', emergency_contact: 'S. K. Verma (Father) - 9812345677', move_in_date: '2024-05-10', rent_amount: 12000, status: 'previous', agreement_url: 'agreement_rahul.pdf', id_proof_url: 'id_rahul.pdf', created_at: new Date() }
  ];

  const rooms = [
    // Tower A
    { id: 1, building_id: 1, floor_number: 1, room_number: 'A-101', status: 'occupied', rent_amount: 18000, current_tenant_id: 1, created_at: new Date() },
    { id: 2, building_id: 1, floor_number: 1, room_number: 'A-102', status: 'vacant', rent_amount: 18000, current_tenant_id: null, created_at: new Date() },
    { id: 3, building_id: 1, floor_number: 2, room_number: 'A-201', status: 'occupied', rent_amount: 18500, current_tenant_id: 2, created_at: new Date() },
    { id: 4, building_id: 1, floor_number: 2, room_number: 'A-202', status: 'maintenance', rent_amount: 18500, current_tenant_id: null, created_at: new Date() },
    // Tower B
    { id: 5, building_id: 2, floor_number: 1, room_number: 'B-101', status: 'occupied', rent_amount: 22000, current_tenant_id: 3, created_at: new Date() },
    { id: 6, building_id: 2, floor_number: 1, room_number: 'B-102', status: 'vacant', rent_amount: 22000, current_tenant_id: null, created_at: new Date() },
    // Tower C
    { id: 7, building_id: 3, floor_number: 1, room_number: 'C-101', status: 'vacant', rent_amount: 12000, current_tenant_id: null, created_at: new Date() },
    { id: 8, building_id: 3, floor_number: 1, room_number: 'C-102', status: 'vacant', rent_amount: 12000, current_tenant_id: null, created_at: new Date() },
    // Tower D
    { id: 9, building_id: 4, floor_number: 1, room_number: 'D-101', status: 'vacant', rent_amount: 25000, current_tenant_id: null, created_at: new Date() }
  ];

  // Room allocation history
  const room_allocations = [
    { id: 1, room_id: 1, tenant_id: 1, rent_amount: 18000, move_in_date: '2025-01-10', move_out_date: null, status: 'active', agreement_url: 'agreement_ananya.pdf', created_at: new Date() },
    { id: 2, room_id: 3, tenant_id: 2, rent_amount: 22000, move_in_date: '2025-02-15', move_out_date: null, status: 'active', agreement_url: 'agreement_amit.pdf', created_at: new Date() },
    { id: 3, room_id: 5, tenant_id: 3, rent_amount: 15000, move_in_date: '2025-03-01', move_out_date: null, status: 'active', agreement_url: 'agreement_sneha.pdf', created_at: new Date() },
    { id: 4, room_id: 7, tenant_id: 4, rent_amount: 12000, move_in_date: '2024-05-10', move_out_date: '2025-02-28', status: 'completed', agreement_url: 'agreement_rahul.pdf', created_at: new Date() }
  ];

  const complaints = [
    { id: 1, tenant_id: 1, category: 'water', title: 'Water leakage in bathroom pipe', description: 'The flush tank pipe is leaking water continuously, creating a mess on the floor. Please resolve this urgently.', priority: 'emergency', status: 'open', proof_url: 'water_leak.jpg', admin_comments: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: 2, tenant_id: 2, category: 'electricity', title: 'Power fluctuation in living room', description: 'Living room lights flicker constantly when the AC is switched on. Could be a socket issue or voltage stabilizer fault.', priority: 'high', status: 'in_progress', proof_url: null, admin_comments: 'Electrician assigned. Will visit tomorrow morning.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: 3, tenant_id: 3, category: 'internet', title: 'Fiber connection downtime', description: 'Society common WiFi and in-room fiber link has been offline since last night. Broadband status light is red.', priority: 'medium', status: 'resolved', proof_url: null, admin_comments: 'Broadband operator repaired cut optic cable on main gate. Resolved.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48), updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12) }
  ];

  const payments = [
    { id: 1, tenant_id: 1, room_id: 1, amount: 18000, billing_period: 'May 2026', status: 'paid', payment_date: new Date(2026, 4, 5, 11, 30), payment_method: 'upi', invoice_number: 'INV-2026-001', receipt_url: 'receipt_001.pdf', created_at: new Date(2026, 4, 1) },
    { id: 2, tenant_id: 2, room_id: 3, amount: 22000, billing_period: 'May 2026', status: 'paid', payment_date: new Date(2026, 4, 3, 15, 45), payment_method: 'net_banking', invoice_number: 'INV-2026-002', receipt_url: 'receipt_002.pdf', created_at: new Date(2026, 4, 1) },
    { id: 3, tenant_id: 3, room_id: 5, amount: 15000, billing_period: 'May 2026', status: 'pending', payment_date: null, payment_method: null, invoice_number: 'INV-2026-003', receipt_url: null, created_at: new Date(2026, 4, 1) },
    { id: 4, tenant_id: 1, room_id: 1, amount: 18000, billing_period: 'April 2026', status: 'paid', payment_date: new Date(2026, 3, 4, 10, 0), payment_method: 'upi', invoice_number: 'INV-2026-004', receipt_url: 'receipt_004.pdf', created_at: new Date(2026, 3, 1) }
  ];

  const visitors = [
    { id: 1, name: 'Mahesh Vyas', phone: '9988776655', purpose: 'Delivery (Amazon)', vehicle_number: 'DL-3C-AS-1234', flat_number: 'A-101', check_in: new Date(Date.now() - 1000 * 60 * 30), check_out: null, gate_pass: 'PASS-78932', created_at: new Date() },
    { id: 2, name: 'Sanjay Dutt', phone: '9988776654', purpose: 'Guest (Friend of Tenant)', vehicle_number: 'MH-12-PQ-9876', flat_number: 'B-101', check_in: new Date(Date.now() - 1000 * 60 * 180), check_out: new Date(Date.now() - 1000 * 60 * 45), gate_pass: 'PASS-55412', created_at: new Date() }
  ];

  const notices = [
    { id: 1, title: 'Annual General Meeting (AGM) Scheduled', content: 'All residents and owners are requested to attend the Annual General Meeting on Sunday, May 24th, 2026 at 10:00 AM in the Clubhouse. Discussion points: security upgradation, painting schedule, and accounts approval.', type: 'announcement', date: '2026-05-24', created_by: 2, created_at: new Date() },
    { id: 2, title: 'URGENT: Water Supply Maintenance Shutdown', content: 'Please note that water supply will be suspended this Wednesday (May 20th, 2026) from 10:00 AM to 2:00 PM for overhead tank cleaning. Residents are requested to store sufficient water in advance.', type: 'emergency', date: '2026-05-20', created_by: 2, created_at: new Date() },
    { id: 3, title: 'Elevator Maintenance Tower A & B', content: 'Elevators of Tower A & B will be under routine servicing on May 19th from 2:00 PM to 5:00 PM. Kindly use the staircases during this brief window.', type: 'maintenance', date: '2026-05-19', created_by: 3, created_at: new Date() }
  ];

  const maintenance_tasks = [
    { id: 1, title: 'Overhead Tank Cleaning', description: 'Biannual deep cleaning and sanitization of water tanks.', staff_name: 'SuperClean Services', cost: 7500, scheduled_date: '2026-05-20', status: 'scheduled', building_id: 1, created_at: new Date() },
    { id: 2, title: 'Fire Extinguisher Refill & Drill', description: 'Inspecting, recharging extinguishers and conducting safety check.', staff_name: 'SafeGuard Fire Corp', cost: 12000, scheduled_date: '2026-05-15', status: 'completed', building_id: null, created_at: new Date() },
    { id: 3, title: 'Garden Trimming & Lawn Maintenance', description: 'Beautifying society lawns and perimeter hedges.', staff_name: 'GreenThumbs Nursery', cost: 3500, scheduled_date: '2026-05-18', status: 'in_progress', building_id: null, created_at: new Date() }
  ];

  const audit_logs = [
    { id: 1, user_id: 2, action: 'User Login', details: 'Society Admin (Rajesh Mehta) logged in successfully', timestamp: new Date() }
  ];

  return { users, buildings, tenants, rooms, room_allocations, complaints, payments, visitors, notices, maintenance_tasks, audit_logs };
};

// Initialize DB Mode
async function initDB() {
  try {
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_society_db',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });
    
    // Quick query test
    await mysqlPool.query('SELECT 1');
    console.log('✅ Connected to MySQL database successfully.');
    useFallback = false;
  } catch (err) {
    console.warn('⚠️ Could not connect to MySQL. Falling back to offline JSON storage.');
    console.warn(`Details: ${err.message}`);
    useFallback = true;
    
    // Check if JSON DB exists, otherwise seed it
    if (!fs.existsSync(JSON_DB_PATH)) {
      console.log('🌱 database.json not found. Creating and seeding with dummy data...');
      localData = getSeedData();
      saveLocalData();
    } else {
      console.log('📂 Loaded existing database.json.');
      try {
        const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
        localData = JSON.parse(raw);
      } catch (parseErr) {
        console.error('❌ database.json corrupted. Resetting data...');
        localData = getSeedData();
        saveLocalData();
      }
    }
  }
}

function saveLocalData() {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(localData, null, 2), 'utf8');
}

// Initialise DB connection
initDB();

// Database Service Adapter API
const db = {
  getMode: () => (useFallback ? 'JSON Fallback' : 'MySQL'),
  
  users: {
    getAll: async () => {
      if (useFallback) return localData.users;
      const [rows] = await mysqlPool.query('SELECT * FROM users ORDER BY id DESC');
      return rows;
    },
    getById: async (id) => {
      if (useFallback) return localData.users.find(u => u.id === Number(id));
      const [rows] = await mysqlPool.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    },
    getByEmail: async (email) => {
      if (useFallback) return localData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      const [rows] = await mysqlPool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    },
    create: async (userData) => {
      if (useFallback) {
        const newUser = {
          id: localData.users.length ? Math.max(...localData.users.map(u => u.id)) + 1 : 1,
          name: userData.name,
          email: userData.email,
          password: hashPassword(userData.password),
          role: userData.role || 'tenant',
          phone: userData.phone || null,
          avatar: userData.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}`,
          status: userData.status || 'active',
          created_at: new Date()
        };
        localData.users.push(newUser);
        saveLocalData();
        return newUser;
      }
      
      const pwdHash = hashPassword(userData.password);
      const avatar = userData.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}`;
      const [result] = await mysqlPool.query(
        'INSERT INTO users (name, email, password, role, phone, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userData.name, userData.email, pwdHash, userData.role || 'tenant', userData.phone || null, avatar, userData.status || 'active']
      );
      return { id: result.insertId, ...userData, password: pwdHash, avatar };
    },
    update: async (id, updateData) => {
      if (useFallback) {
        const index = localData.users.findIndex(u => u.id === Number(id));
        if (index === -1) return null;
        if (updateData.password) {
          updateData.password = hashPassword(updateData.password);
        }
        localData.users[index] = { ...localData.users[index], ...updateData };
        saveLocalData();
        return localData.users[index];
      }
      
      let queryStr = 'UPDATE users SET ';
      const params = [];
      const keys = Object.keys(updateData);
      
      keys.forEach((key, index) => {
        let val = updateData[key];
        if (key === 'password') val = hashPassword(val);
        queryStr += `${key} = ?${index === keys.length - 1 ? '' : ', '}`;
        params.push(val);
      });
      
      queryStr += ' WHERE id = ?';
      params.push(id);
      
      await mysqlPool.query(queryStr, params);
      return { id, ...updateData };
    }
  },

  buildings: {
    getAll: async () => {
      if (useFallback) return localData.buildings;
      const [rows] = await mysqlPool.query('SELECT * FROM buildings ORDER BY id ASC');
      return rows;
    },
    create: async (bData) => {
      if (useFallback) {
        const newB = {
          id: localData.buildings.length ? Math.max(...localData.buildings.map(b => b.id)) + 1 : 1,
          name: bData.name,
          description: bData.description || null,
          floors_count: Number(bData.floors_count) || 1,
          created_at: new Date()
        };
        localData.buildings.push(newB);
        saveLocalData();
        return newB;
      }
      const [result] = await mysqlPool.query(
        'INSERT INTO buildings (name, description, floors_count) VALUES (?, ?, ?)',
        [bData.name, bData.description || null, Number(bData.floors_count) || 1]
      );
      return { id: result.insertId, ...bData };
    },
    update: async (id, bData) => {
      if (useFallback) {
        const idx = localData.buildings.findIndex(b => b.id === Number(id));
        if (idx === -1) return null;
        localData.buildings[idx] = { ...localData.buildings[idx], ...bData };
        saveLocalData();
        return localData.buildings[idx];
      }
      await mysqlPool.query(
        'UPDATE buildings SET name = ?, description = ?, floors_count = ? WHERE id = ?',
        [bData.name, bData.description || null, Number(bData.floors_count) || 1, id]
      );
      return { id, ...bData };
    },
    delete: async (id) => {
      if (useFallback) {
        localData.buildings = localData.buildings.filter(b => b.id !== Number(id));
        // cascade rooms status
        localData.rooms = localData.rooms.filter(r => r.building_id !== Number(id));
        saveLocalData();
        return true;
      }
      await mysqlPool.query('DELETE FROM buildings WHERE id = ?', [id]);
      return true;
    }
  },

  rooms: {
    getAll: async () => {
      if (useFallback) return localData.rooms;
      const [rows] = await mysqlPool.query('SELECT * FROM rooms ORDER BY room_number ASC');
      return rows;
    },
    create: async (rData) => {
      if (useFallback) {
        const newR = {
          id: localData.rooms.length ? Math.max(...localData.rooms.map(r => r.id)) + 1 : 1,
          building_id: Number(rData.building_id),
          floor_number: Number(rData.floor_number),
          room_number: rData.room_number,
          status: rData.status || 'vacant',
          rent_amount: Number(rData.rent_amount) || 0,
          current_tenant_id: rData.current_tenant_id ? Number(rData.current_tenant_id) : null,
          created_at: new Date()
        };
        localData.rooms.push(newR);
        saveLocalData();
        return newR;
      }
      const [result] = await mysqlPool.query(
        'INSERT INTO rooms (building_id, floor_number, room_number, status, rent_amount, current_tenant_id) VALUES (?, ?, ?, ?, ?, ?)',
        [Number(rData.building_id), Number(rData.floor_number), rData.room_number, rData.status || 'vacant', Number(rData.rent_amount) || 0, rData.current_tenant_id || null]
      );
      return { id: result.insertId, ...rData };
    },
    update: async (id, rData) => {
      if (useFallback) {
        const idx = localData.rooms.findIndex(r => r.id === Number(id));
        if (idx === -1) return null;
        localData.rooms[idx] = { 
          ...localData.rooms[idx], 
          ...rData,
          building_id: rData.building_id !== undefined ? Number(rData.building_id) : localData.rooms[idx].building_id,
          floor_number: rData.floor_number !== undefined ? Number(rData.floor_number) : localData.rooms[idx].floor_number,
          rent_amount: rData.rent_amount !== undefined ? Number(rData.rent_amount) : localData.rooms[idx].rent_amount,
          current_tenant_id: rData.current_tenant_id !== undefined ? (rData.current_tenant_id ? Number(rData.current_tenant_id) : null) : localData.rooms[idx].current_tenant_id
        };
        saveLocalData();
        return localData.rooms[idx];
      }
      const fields = [];
      const vals = [];
      Object.keys(rData).forEach(key => {
        fields.push(`${key} = ?`);
        vals.push(rData[key]);
      });
      vals.push(id);
      await mysqlPool.query(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`, vals);
      return { id, ...rData };
    },
    delete: async (id) => {
      if (useFallback) {
        localData.rooms = localData.rooms.filter(r => r.id !== Number(id));
        saveLocalData();
        return true;
      }
      await mysqlPool.query('DELETE FROM rooms WHERE id = ?', [id]);
      return true;
    }
  },

  tenants: {
    getAll: async () => {
      if (useFallback) return localData.tenants;
      const [rows] = await mysqlPool.query('SELECT * FROM tenants ORDER BY id DESC');
      return rows;
    },
    create: async (tData) => {
      if (useFallback) {
        const newT = {
          id: localData.tenants.length ? Math.max(...localData.tenants.map(t => t.id)) + 1 : 1,
          user_id: tData.user_id ? Number(tData.user_id) : null,
          name: tData.name,
          phone: tData.phone,
          email: tData.email || null,
          aadhaar: tData.aadhaar || null,
          emergency_contact: tData.emergency_contact || null,
          move_in_date: tData.move_in_date || new Date().toISOString().split('T')[0],
          rent_amount: Number(tData.rent_amount) || 0,
          status: tData.status || 'active',
          agreement_url: tData.agreement_url || null,
          id_proof_url: tData.id_proof_url || null,
          created_at: new Date()
        };
        localData.tenants.push(newT);
        saveLocalData();
        return newT;
      }
      const [result] = await mysqlPool.query(
        'INSERT INTO tenants (user_id, name, phone, email, aadhaar, emergency_contact, move_in_date, rent_amount, status, agreement_url, id_proof_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [tData.user_id || null, tData.name, tData.phone, tData.email || null, tData.aadhaar || null, tData.emergency_contact || null, tData.move_in_date || null, Number(tData.rent_amount) || 0, tData.status || 'active', tData.agreement_url || null, tData.id_proof_url || null]
      );
      return { id: result.insertId, ...tData };
    },
    update: async (id, tData) => {
      if (useFallback) {
        const idx = localData.tenants.findIndex(t => t.id === Number(id));
        if (idx === -1) return null;
        localData.tenants[idx] = { 
          ...localData.tenants[idx], 
          ...tData,
          rent_amount: tData.rent_amount !== undefined ? Number(tData.rent_amount) : localData.tenants[idx].rent_amount
        };
        saveLocalData();
        return localData.tenants[idx];
      }
      const fields = [];
      const vals = [];
      Object.keys(tData).forEach(key => {
        fields.push(`${key} = ?`);
        vals.push(tData[key]);
      });
      vals.push(id);
      await mysqlPool.query(`UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`, vals);
      return { id, ...tData };
    },
    delete: async (id) => {
      if (useFallback) {
        localData.tenants = localData.tenants.filter(t => t.id !== Number(id));
        // Reset room assignments if any
        localData.rooms = localData.rooms.map(r => r.current_tenant_id === Number(id) ? { ...r, current_tenant_id: null, status: 'vacant' } : r);
        saveLocalData();
        return true;
      }
      await mysqlPool.query('DELETE FROM tenants WHERE id = ?', [id]);
      return true;
    }
  },

  allocations: {
    getAll: async () => {
      if (useFallback) return localData.room_allocations;
      const [rows] = await mysqlPool.query('SELECT * FROM room_allocations ORDER BY id DESC');
      return rows;
    },
    create: async (aData) => {
      if (useFallback) {
        const newA = {
          id: localData.room_allocations.length ? Math.max(...localData.room_allocations.map(a => a.id)) + 1 : 1,
          room_id: Number(aData.room_id),
          tenant_id: Number(aData.tenant_id),
          rent_amount: Number(aData.rent_amount),
          move_in_date: aData.move_in_date || new Date().toISOString().split('T')[0],
          move_out_date: aData.move_out_date || null,
          status: aData.status || 'active',
          agreement_url: aData.agreement_url || null,
          created_at: new Date()
        };
        localData.room_allocations.push(newA);
        
        // Also update the room's current tenant and status
        const roomIdx = localData.rooms.findIndex(r => r.id === Number(aData.room_id));
        if (roomIdx !== -1) {
          localData.rooms[roomIdx].current_tenant_id = Number(aData.tenant_id);
          localData.rooms[roomIdx].status = 'occupied';
        }
        
        saveLocalData();
        return newA;
      }
      
      const conn = await mysqlPool.getConnection();
      try {
        await conn.beginTransaction();
        const [result] = await conn.query(
          'INSERT INTO room_allocations (room_id, tenant_id, rent_amount, move_in_date, status, agreement_url) VALUES (?, ?, ?, ?, ?, ?)',
          [Number(aData.room_id), Number(aData.tenant_id), Number(aData.rent_amount), aData.move_in_date, aData.status || 'active', aData.agreement_url || null]
        );
        await conn.query('UPDATE rooms SET current_tenant_id = ?, status = "occupied" WHERE id = ?', [Number(aData.tenant_id), Number(aData.room_id)]);
        await conn.commit();
        return { id: result.insertId, ...aData };
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    },
    update: async (id, aData) => {
      if (useFallback) {
        const idx = localData.room_allocations.findIndex(a => a.id === Number(id));
        if (idx === -1) return null;
        localData.room_allocations[idx] = { ...localData.room_allocations[idx], ...aData };
        
        if (aData.status === 'completed') {
          const roomIdx = localData.rooms.findIndex(r => r.id === localData.room_allocations[idx].room_id);
          if (roomIdx !== -1) {
            localData.rooms[roomIdx].current_tenant_id = null;
            localData.rooms[roomIdx].status = 'vacant';
          }
        }
        saveLocalData();
        return localData.room_allocations[idx];
      }
      
      if (aData.status === 'completed') {
        const conn = await mysqlPool.getConnection();
        try {
          await conn.beginTransaction();
          await conn.query('UPDATE room_allocations SET status = "completed", move_out_date = ? WHERE id = ?', [aData.move_out_date || new Date().toISOString().split('T')[0], id]);
          
          const [allocs] = await conn.query('SELECT room_id FROM room_allocations WHERE id = ?', [id]);
          if (allocs.length > 0) {
            await conn.query('UPDATE rooms SET current_tenant_id = NULL, status = "vacant" WHERE id = ?', [allocs[0].room_id]);
          }
          await conn.commit();
          return { id, ...aData };
        } catch (err) {
          await conn.rollback();
          throw err;
        } finally {
          conn.release();
        }
      } else {
        const fields = [];
        const vals = [];
        Object.keys(aData).forEach(key => {
          fields.push(`${key} = ?`);
          vals.push(aData[key]);
        });
        vals.push(id);
        await mysqlPool.query(`UPDATE room_allocations SET ${fields.join(', ')} WHERE id = ?`, vals);
        return { id, ...aData };
      }
    }
  },

  complaints: {
    getAll: async () => {
      if (useFallback) return localData.complaints;
      const [rows] = await mysqlPool.query('SELECT * FROM complaints ORDER BY id DESC');
      return rows;
    },
    create: async (cData) => {
      if (useFallback) {
        const newC = {
          id: localData.complaints.length ? Math.max(...localData.complaints.map(c => c.id)) + 1 : 1,
          tenant_id: Number(cData.tenant_id),
          category: cData.category,
          title: cData.title,
          description: cData.description,
          priority: cData.priority || 'medium',
          status: cData.status || 'open',
          proof_url: cData.proof_url || null,
          admin_comments: null,
          created_at: new Date(),
          updated_at: new Date()
        };
        localData.complaints.push(newC);
        saveLocalData();
        return newC;
      }
      const [result] = await mysqlPool.query(
        'INSERT INTO complaints (tenant_id, category, title, description, priority, status, proof_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [Number(cData.tenant_id), cData.category, cData.title, cData.description, cData.priority || 'medium', cData.status || 'open', cData.proof_url || null]
      );
      return { id: result.insertId, ...cData };
    },
    update: async (id, cData) => {
      if (useFallback) {
        const idx = localData.complaints.findIndex(c => c.id === Number(id));
        if (idx === -1) return null;
        localData.complaints[idx] = { 
          ...localData.complaints[idx], 
          ...cData, 
          updated_at: new Date() 
        };
        saveLocalData();
        return localData.complaints[idx];
      }
      const fields = [];
      const vals = [];
      Object.keys(cData).forEach(key => {
        fields.push(`${key} = ?`);
        vals.push(cData[key]);
      });
      vals.push(id);
      await mysqlPool.query(`UPDATE complaints SET ${fields.join(', ')} WHERE id = ?`, vals);
      return { id, ...cData };
    }
  },

  payments: {
    getAll: async () => {
      if (useFallback) return localData.payments;
      const [rows] = await mysqlPool.query('SELECT * FROM payments ORDER BY id DESC');
      return rows;
    },
    create: async (pData) => {
      if (useFallback) {
        const newP = {
          id: localData.payments.length ? Math.max(...localData.payments.map(p => p.id)) + 1 : 1,
          tenant_id: Number(pData.tenant_id),
          room_id: Number(pData.room_id),
          amount: Number(pData.amount),
          billing_period: pData.billing_period,
          status: pData.status || 'pending',
          payment_date: pData.payment_date ? new Date(pData.payment_date) : null,
          payment_method: pData.payment_method || null,
          invoice_number: pData.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          receipt_url: pData.receipt_url || null,
          created_at: new Date()
        };
        localData.payments.push(newP);
        saveLocalData();
        return newP;
      }
      const invNum = pData.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const [result] = await mysqlPool.query(
        'INSERT INTO payments (tenant_id, room_id, amount, billing_period, status, payment_date, payment_method, invoice_number, receipt_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [Number(pData.tenant_id), Number(pData.room_id), Number(pData.amount), pData.billing_period, pData.status || 'pending', pData.payment_date || null, pData.payment_method || null, invNum, pData.receipt_url || null]
      );
      return { id: result.insertId, ...pData, invoice_number: invNum };
    },
    update: async (id, pData) => {
      if (useFallback) {
        const idx = localData.payments.findIndex(p => p.id === Number(id));
        if (idx === -1) return null;
        localData.payments[idx] = { 
          ...localData.payments[idx], 
          ...pData,
          amount: pData.amount !== undefined ? Number(pData.amount) : localData.payments[idx].amount
        };
        saveLocalData();
        return localData.payments[idx];
      }
      const fields = [];
      const vals = [];
      Object.keys(pData).forEach(key => {
        fields.push(`${key} = ?`);
        vals.push(pData[key]);
      });
      vals.push(id);
      await mysqlPool.query(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`, vals);
      return { id, ...pData };
    }
  },

  visitors: {
    getAll: async () => {
      if (useFallback) return localData.visitors;
      const [rows] = await mysqlPool.query('SELECT * FROM visitors ORDER BY id DESC');
      return rows;
    },
    create: async (vData) => {
      if (useFallback) {
        const newV = {
          id: localData.visitors.length ? Math.max(...localData.visitors.map(v => v.id)) + 1 : 1,
          name: vData.name,
          phone: vData.phone,
          purpose: vData.purpose || null,
          vehicle_number: vData.vehicle_number || null,
          flat_number: vData.flat_number,
          check_in: new Date(),
          check_out: null,
          gate_pass: `PASS-${Math.floor(10000 + Math.random() * 90000)}`,
          created_at: new Date()
        };
        localData.visitors.push(newV);
        saveLocalData();
        return newV;
      }
      const pass = `PASS-${Math.floor(10000 + Math.random() * 90000)}`;
      const [result] = await mysqlPool.query(
        'INSERT INTO visitors (name, phone, purpose, vehicle_number, flat_number, gate_pass) VALUES (?, ?, ?, ?, ?, ?)',
        [vData.name, vData.phone, vData.purpose || null, vData.vehicle_number || null, vData.flat_number, pass]
      );
      return { id: result.insertId, ...vData, gate_pass: pass, check_in: new Date() };
    },
    update: async (id, vData) => {
      if (useFallback) {
        const idx = localData.visitors.findIndex(v => v.id === Number(id));
        if (idx === -1) return null;
        localData.visitors[idx] = { ...localData.visitors[idx], ...vData };
        saveLocalData();
        return localData.visitors[idx];
      }
      const fields = [];
      const vals = [];
      Object.keys(vData).forEach(key => {
        fields.push(`${key} = ?`);
        vals.push(vData[key]);
      });
      vals.push(id);
      await mysqlPool.query(`UPDATE visitors SET ${fields.join(', ')} WHERE id = ?`, vals);
      return { id, ...vData };
    }
  },

  notices: {
    getAll: async () => {
      if (useFallback) return localData.notices;
      const [rows] = await mysqlPool.query('SELECT * FROM notices ORDER BY id DESC');
      return rows;
    },
    create: async (nData) => {
      if (useFallback) {
        const newN = {
          id: localData.notices.length ? Math.max(...localData.notices.map(n => n.id)) + 1 : 1,
          title: nData.title,
          content: nData.content,
          type: nData.type || 'announcement',
          date: nData.date || new Date().toISOString().split('T')[0],
          created_by: Number(nData.created_by),
          created_at: new Date()
        };
        localData.notices.push(newN);
        saveLocalData();
        return newN;
      }
      const [result] = await mysqlPool.query(
        'INSERT INTO notices (title, content, type, date, created_by) VALUES (?, ?, ?, ?, ?)',
        [nData.title, nData.content, nData.type || 'announcement', nData.date, Number(nData.created_by)]
      );
      return { id: result.insertId, ...nData };
    },
    delete: async (id) => {
      if (useFallback) {
        localData.notices = localData.notices.filter(n => n.id !== Number(id));
        saveLocalData();
        return true;
      }
      await mysqlPool.query('DELETE FROM notices WHERE id = ?', [id]);
      return true;
    }
  },

  maintenance: {
    getAll: async () => {
      if (useFallback) return localData.maintenance_tasks;
      const [rows] = await mysqlPool.query('SELECT * FROM maintenance_tasks ORDER BY id DESC');
      return rows;
    },
    create: async (mData) => {
      if (useFallback) {
        const newM = {
          id: localData.maintenance_tasks.length ? Math.max(...localData.maintenance_tasks.map(m => m.id)) + 1 : 1,
          title: mData.title,
          description: mData.description || null,
          staff_name: mData.staff_name || null,
          cost: Number(mData.cost) || 0,
          scheduled_date: mData.scheduled_date,
          status: mData.status || 'scheduled',
          building_id: mData.building_id ? Number(mData.building_id) : null,
          created_at: new Date()
        };
        localData.maintenance_tasks.push(newM);
        saveLocalData();
        return newM;
      }
      const [result] = await mysqlPool.query(
        'INSERT INTO maintenance_tasks (title, description, staff_name, cost, scheduled_date, status, building_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [mData.title, mData.description || null, mData.staff_name || null, Number(mData.cost) || 0, mData.scheduled_date, mData.status || 'scheduled', mData.building_id || null]
      );
      return { id: result.insertId, ...mData };
    },
    update: async (id, mData) => {
      if (useFallback) {
        const idx = localData.maintenance_tasks.findIndex(m => m.id === Number(id));
        if (idx === -1) return null;
        localData.maintenance_tasks[idx] = { 
          ...localData.maintenance_tasks[idx], 
          ...mData,
          cost: mData.cost !== undefined ? Number(mData.cost) : localData.maintenance_tasks[idx].cost,
          building_id: mData.building_id !== undefined ? (mData.building_id ? Number(mData.building_id) : null) : localData.maintenance_tasks[idx].building_id
        };
        saveLocalData();
        return localData.maintenance_tasks[idx];
      }
      const fields = [];
      const vals = [];
      Object.keys(mData).forEach(key => {
        fields.push(`${key} = ?`);
        vals.push(mData[key]);
      });
      vals.push(id);
      await mysqlPool.query(`UPDATE maintenance_tasks SET ${fields.join(', ')} WHERE id = ?`, vals);
      return { id, ...mData };
    }
  },

  auditLogs: {
    getAll: async () => {
      if (useFallback) return localData.audit_logs;
      const [rows] = await mysqlPool.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100');
      return rows;
    },
    create: async (logData) => {
      if (useFallback) {
        const newLog = {
          id: localData.audit_logs.length ? Math.max(...localData.audit_logs.map(l => l.id)) + 1 : 1,
          user_id: logData.user_id ? Number(logData.user_id) : null,
          action: logData.action,
          details: logData.details || null,
          timestamp: new Date()
        };
        localData.audit_logs.push(newLog);
        saveLocalData();
        return newLog;
      }
      const [result] = await mysqlPool.query(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [logData.user_id || null, logData.action, logData.details || null]
      );
      return { id: result.insertId, ...logData };
    }
  }
};

module.exports = db;
