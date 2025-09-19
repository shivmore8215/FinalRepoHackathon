-- Train Plan Wise Database Schema and Seed Data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trainsets table
CREATE TABLE IF NOT EXISTS trainsets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ready', 'standby', 'maintenance', 'critical')),
    bay_position INTEGER NOT NULL,
    mileage INTEGER NOT NULL DEFAULT 0,
    last_cleaning TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    branding_priority INTEGER NOT NULL DEFAULT 5 CHECK (branding_priority >= 1 AND branding_priority <= 10),
    availability_percentage INTEGER NOT NULL DEFAULT 100 CHECK (availability_percentage >= 0 AND availability_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample trainsets
INSERT INTO trainsets (number, status, bay_position, mileage, last_cleaning, branding_priority, availability_percentage) VALUES
('KMRL-001', 'ready', 1, 45000, '2024-01-15 08:00:00+00', 8, 95),
('KMRL-002', 'ready', 2, 42000, '2024-01-14 09:30:00+00', 7, 98),
('KMRL-003', 'maintenance', 3, 48000, '2024-01-10 14:00:00+00', 6, 85),
('KMRL-004', 'standby', 4, 39000, '2024-01-16 07:00:00+00', 9, 92),
('KMRL-005', 'ready', 5, 41000, '2024-01-15 10:15:00+00', 8, 96);