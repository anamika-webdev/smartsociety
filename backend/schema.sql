-- Smart Society Management System MySQL Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS smart_society_db;
USE smart_society_db;

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'society_admin', 'caretaker', 'tenant') NOT NULL DEFAULT 'tenant',
    phone VARCHAR(20) DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Buildings Management
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    floors_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tenants Management
CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL, -- Can link to a registered user account
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    aadhaar VARCHAR(50) DEFAULT NULL,
    emergency_contact VARCHAR(255) DEFAULT NULL,
    move_in_date DATE DEFAULT NULL,
    rent_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'previous') NOT NULL DEFAULT 'active',
    agreement_url VARCHAR(255) DEFAULT NULL,
    id_proof_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Rooms / Flats Management
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    floor_number INT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    status ENUM('occupied', 'vacant', 'maintenance') NOT NULL DEFAULT 'vacant',
    rent_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    current_tenant_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (current_tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    UNIQUE KEY uq_building_room (building_id, room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Room Allocation History
CREATE TABLE IF NOT EXISTS room_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    tenant_id INT NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    move_in_date DATE NOT NULL,
    move_out_date DATE DEFAULT NULL,
    status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
    agreement_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Complaint Management System
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    category ENUM('water', 'electricity', 'cleaning', 'security', 'maintenance', 'internet') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'emergency') NOT NULL DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open',
    proof_url VARCHAR(255) DEFAULT NULL,
    admin_comments TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Rent & Payment Management
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    room_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    billing_period VARCHAR(50) NOT NULL, -- e.g., 'May 2026'
    status ENUM('paid', 'pending', 'overdue') NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP NULL DEFAULT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'net_banking') DEFAULT NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    receipt_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Visitor & Entry Management
CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    purpose TEXT DEFAULT NULL,
    vehicle_number VARCHAR(50) DEFAULT NULL,
    flat_number VARCHAR(50) NOT NULL,
    check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP NULL DEFAULT NULL,
    gate_pass VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Notice Board & Communication
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('announcement', 'emergency', 'maintenance', 'event') NOT NULL DEFAULT 'announcement',
    date DATE NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Maintenance & Service Tracking (Staff/Expenses)
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    staff_name VARCHAR(255) DEFAULT NULL,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    scheduled_date DATE NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    building_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Audit Logs / Activity Tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT DEFAULT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
