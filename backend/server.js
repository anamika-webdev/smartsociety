const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token_for_smart_society';

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration for agreements & complaints proof
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token is invalid or expired' });
    req.user = user;
    next();
  });
};

// Role Authorization Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient privileges' });
    }
    next();
  };
};

// ----------------------------------------------------
// 1. AUTHENTICATION & PROFILE APIs
// ----------------------------------------------------

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await db.users.getByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Your account is inactive or pending approval' });
    }
    
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Log access
    await db.auditLogs.create({
      user_id: user.id,
      action: 'User Login',
      details: `${user.name} (${user.role}) logged in successfully.`
    });
    
    // Check if user is linked to a tenant profile
    let tenantProfile = null;
    if (user.role === 'tenant') {
      const allTenants = await db.tenants.getAll();
      tenantProfile = allTenants.find(t => t.user_id === user.id && t.status === 'active') || null;
    }
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        tenantId: tenantProfile ? tenantProfile.id : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    const existingUser = await db.users.getByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    
    const newUser = await db.users.create({
      name,
      email,
      password,
      role: role || 'tenant',
      phone: phone || null,
      status: 'active'
    });
    
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    await db.auditLogs.create({
      user_id: newUser.id,
      action: 'User Registered',
      details: `New account created: ${newUser.name} as ${newUser.role}.`
    });
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        tenantId: null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const user = await db.users.getByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }
    
    // Simulate sending recovery mail
    res.json({ message: 'Password recovery email sent successfully. Please check your inbox.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Profile Route
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.users.getById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const profile = { ...user };
    delete profile.password;
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile Route
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, password, avatar } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = password;
    if (avatar) updateData.avatar = avatar;
    
    const updated = await db.users.update(req.user.id, updateData);
    delete updated.password;
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. BUILDINGS APIs
// ----------------------------------------------------

app.get('/api/buildings', authenticateToken, async (req, res) => {
  try {
    const list = await db.buildings.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/buildings', authenticateToken, authorizeRoles('super_admin', 'society_admin'), async (req, res) => {
  try {
    const building = await db.buildings.create(req.body);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Create Building',
      details: `Added new building: ${building.name} with ${building.floors_count} floors.`
    });
    
    res.status(201).json(building);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/buildings/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin'), async (req, res) => {
  try {
    const building = await db.buildings.update(req.params.id, req.body);
    if (!building) return res.status(404).json({ error: 'Building not found' });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Update Building',
      details: `Updated building ID ${req.params.id} info.`
    });
    
    res.json(building);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/buildings/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin'), async (req, res) => {
  try {
    await db.buildings.delete(req.params.id);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Delete Building',
      details: `Deleted building ID ${req.params.id} and cleared its rooms.`
    });
    
    res.json({ success: true, message: 'Building deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. ROOMS APIs
// ----------------------------------------------------

app.get('/api/rooms', authenticateToken, async (req, res) => {
  try {
    const list = await db.rooms.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const room = await db.rooms.create(req.body);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Create Room/Flat',
      details: `Added flat ${room.room_number} to building ID ${room.building_id}.`
    });
    
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const room = await db.rooms.update(req.params.id, req.body);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Update Room/Flat',
      details: `Updated flat ID ${req.params.id} attributes.`
    });
    
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    await db.rooms.delete(req.params.id);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Delete Room/Flat',
      details: `Removed flat ID ${req.params.id}.`
    });
    
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. TENANTS APIs
// ----------------------------------------------------

app.get('/api/tenants', authenticateToken, async (req, res) => {
  try {
    const list = await db.tenants.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tenants', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const tenant = await db.tenants.create(req.body);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Create Tenant',
      details: `Registered tenant profile for ${tenant.name}.`
    });
    
    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tenants/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const tenant = await db.tenants.update(req.params.id, req.body);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Update Tenant',
      details: `Updated details for tenant ${tenant.name}.`
    });
    
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tenants/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin'), async (req, res) => {
  try {
    await db.tenants.delete(req.params.id);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Delete Tenant',
      details: `Removed tenant profile ID ${req.params.id}.`
    });
    
    res.json({ success: true, message: 'Tenant deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. ROOM ALLOCATIONS APIs
// ----------------------------------------------------

app.get('/api/allocations', authenticateToken, async (req, res) => {
  try {
    const list = await db.allocations.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/allocations', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const allocation = await db.allocations.create(req.body);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Allocate Room',
      details: `Allocated Room ID ${allocation.room_id} to Tenant ID ${allocation.tenant_id} at ₹${allocation.rent_amount}/mo.`
    });
    
    res.status(201).json(allocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/allocations/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const allocation = await db.allocations.update(req.params.id, req.body);
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Update Allocation',
      details: `Modified room allocation ID ${req.params.id}.`
    });
    
    res.json(allocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. COMPLAINTS APIs
// ----------------------------------------------------

app.get('/api/complaints', authenticateToken, async (req, res) => {
  try {
    const list = await db.complaints.getAll();
    
    // If tenant role, only filter for complaints submitted by that tenant's profile
    if (req.user.role === 'tenant') {
      const allTenants = await db.tenants.getAll();
      const tenant = allTenants.find(t => t.user_id === req.user.id);
      if (tenant) {
        return res.json(list.filter(c => c.tenant_id === tenant.id));
      }
      return res.json([]);
    }
    
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/complaints', authenticateToken, upload.single('proof'), async (req, res) => {
  try {
    const { category, title, description, priority } = req.body;
    
    // Find tenant ID linked to active user
    const allTenants = await db.tenants.getAll();
    const tenant = allTenants.find(t => t.user_id === req.user.id && t.status === 'active');
    
    if (!tenant) {
      return res.status(400).json({ error: 'No active tenant profile associated with this account' });
    }
    
    const complaint = await db.complaints.create({
      tenant_id: tenant.id,
      category,
      title,
      description,
      priority: priority || 'medium',
      proof_url: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'File Complaint',
      details: `Complaint filed by ${tenant.name}: "${title}"`
    });
    
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/complaints/:id', authenticateToken, async (req, res) => {
  try {
    const { status, admin_comments } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (admin_comments !== undefined) updateData.admin_comments = admin_comments;
    
    const complaint = await db.complaints.update(req.params.id, updateData);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Update Complaint Status',
      details: `Updated complaint ID ${req.params.id} to status: ${status}.`
    });
    
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 7. PAYMENTS & RENT APIs
// ----------------------------------------------------

app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const list = await db.payments.getAll();
    
    // If tenant, filter by their profile ID
    if (req.user.role === 'tenant') {
      const allTenants = await db.tenants.getAll();
      const tenant = allTenants.find(t => t.user_id === req.user.id);
      if (tenant) {
        return res.json(list.filter(p => p.tenant_id === tenant.id));
      }
      return res.json([]);
    }
    
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const payment = await db.payments.create(req.body);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Create Payment/Invoice',
      details: `Generated invoice ${payment.invoice_number} for Tenant ID ${payment.tenant_id}.`
    });
    
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/payments/:id', authenticateToken, async (req, res) => {
  try {
    const { status, payment_method } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (payment_method) {
      updateData.payment_method = payment_method;
      updateData.payment_date = new Date();
    }
    
    const payment = await db.payments.update(req.params.id, updateData);
    if (!payment) return res.status(404).json({ error: 'Payment invoice not found' });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Rent Paid',
      details: `Paid Rent Invoice ID ${req.params.id} via ${payment_method || 'direct'}.`
    });
    
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 8. VISITORS APIs
// ----------------------------------------------------

app.get('/api/visitors', authenticateToken, async (req, res) => {
  try {
    const list = await db.visitors.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visitors', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const visitor = await db.visitors.create(req.body);
    res.status(201).json(visitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/visitors/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const visitor = await db.visitors.update(req.params.id, {
      check_out: new Date()
    });
    if (!visitor) return res.status(404).json({ error: 'Visitor check-in not found' });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 9. NOTICE BOARD APIs
// ----------------------------------------------------

app.get('/api/notices', authenticateToken, async (req, res) => {
  try {
    const list = await db.notices.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const notice = await db.notices.create({
      ...req.body,
      created_by: req.user.id
    });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Post Announcement',
      details: `Created notice: "${notice.title}".`
    });
    
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notices/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin'), async (req, res) => {
  try {
    await db.notices.delete(req.params.id);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 10. MAINTENANCE TASKS APIs
// ----------------------------------------------------

app.get('/api/maintenance', authenticateToken, async (req, res) => {
  try {
    const list = await db.maintenance.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/maintenance', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const task = await db.maintenance.create(req.body);
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Schedule Maintenance',
      details: `Scheduled service task: "${task.title}" costing ₹${task.cost}.`
    });
    
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/maintenance/:id', authenticateToken, authorizeRoles('super_admin', 'society_admin', 'caretaker'), async (req, res) => {
  try {
    const task = await db.maintenance.update(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: 'Maintenance task not found' });
    
    await db.auditLogs.create({
      user_id: req.user.id,
      action: 'Update Maintenance',
      details: `Modified maintenance service task ID ${req.params.id}.`
    });
    
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 11. DASHBOARD ANALYTICS API
// ----------------------------------------------------

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const buildings = await db.buildings.getAll();
    const rooms = await db.rooms.getAll();
    const tenants = await db.tenants.getAll();
    const complaints = await db.complaints.getAll();
    const payments = await db.payments.getAll();
    const maintenance = await db.maintenance.getAll();
    
    // Filter structures if tenant
    let filteredRooms = rooms;
    let filteredComplaints = complaints;
    let filteredPayments = payments;
    
    if (req.user.role === 'tenant') {
      const activeTenant = tenants.find(t => t.user_id === req.user.id);
      if (activeTenant) {
        filteredComplaints = complaints.filter(c => c.tenant_id === activeTenant.id);
        filteredPayments = payments.filter(p => p.tenant_id === activeTenant.id);
      } else {
        filteredComplaints = [];
        filteredPayments = [];
      }
    }
    
    // 1. Core counters
    const totalOccupied = rooms.filter(r => r.status === 'occupied').length;
    const totalVacant = rooms.filter(r => r.status === 'vacant').length;
    const totalMaintenance = rooms.filter(r => r.status === 'maintenance').length;
    const pendingComplaints = complaints.filter(c => c.status !== 'resolved').length;
    
    // 2. Revenue Calculations
    // Filter current month billing
    const monthlyRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);
      
    const pendingDues = payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + Number(p.amount), 0);
      
    // 3. Maintenance Expenses
    const totalExpenses = maintenance
      .filter(t => t.status === 'completed' || t.status === 'in_progress')
      .reduce((sum, t) => sum + Number(t.cost), 0);
      
    // 4. Building-wise Statistics
    const buildingStats = buildings.map(b => {
      const bRooms = rooms.filter(r => r.building_id === b.id);
      const bOccupied = bRooms.filter(r => r.status === 'occupied').length;
      const bVacant = bRooms.filter(r => r.status === 'vacant').length;
      const bMaint = bRooms.filter(r => r.status === 'maintenance').length;
      return {
        id: b.id,
        name: b.name,
        total: bRooms.length,
        occupied: bOccupied,
        vacant: bVacant,
        maintenance: bMaint
      };
    });
    
    // 5. Monthly Revenue Chart Data
    // Aggregate payments by billing period (e.g. 'April 2026', 'May 2026')
    const revenuePeriods = {};
    payments.forEach(p => {
      if (!revenuePeriods[p.billing_period]) {
        revenuePeriods[p.billing_period] = { period: p.billing_period, paid: 0, pending: 0 };
      }
      if (p.status === 'paid') {
        revenuePeriods[p.billing_period].paid += Number(p.amount);
      } else {
        revenuePeriods[p.billing_period].pending += Number(p.amount);
      }
    });
    
    const revenueChart = Object.values(revenuePeriods).slice(-6); // Last 6 billing periods

    res.json({
      summary: {
        occupiedRooms: totalOccupied,
        vacantRooms: totalVacant,
        maintenanceRooms: totalMaintenance,
        pendingComplaints: pendingComplaints,
        monthlyRevenue: monthlyRevenue,
        pendingDues: pendingDues,
        maintenanceExpenses: totalExpenses,
        totalBuildings: buildings.length,
        totalTenants: tenants.filter(t => t.status === 'active').length
      },
      buildingStats,
      revenueChart,
      complaintCategoryStats: {
        water: complaints.filter(c => c.category === 'water').length,
        electricity: complaints.filter(c => c.category === 'electricity').length,
        cleaning: complaints.filter(c => c.category === 'cleaning').length,
        security: complaints.filter(c => c.category === 'security').length,
        maintenance: complaints.filter(c => c.category === 'maintenance').length,
        internet: complaints.filter(c => c.category === 'internet').length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Audit Logs Endpoint
app.get('/api/audit-logs', authenticateToken, authorizeRoles('super_admin', 'society_admin'), async (req, res) => {
  try {
    const list = await db.auditLogs.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// SERVER START
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Smart Society Backend listening on http://localhost:${PORT}`);
  console.log(`📡 Database mode in use: ${db.getMode()}`);
});
