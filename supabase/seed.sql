-- KMRL Database Seed Data
-- Run this after your initial migration to populate the database with sample data

-- Clear existing data
TRUNCATE TABLE fitness_certificates, job_cards, daily_schedules, maintenance_activities, ai_training_data, kpi_metrics CASCADE;

-- Insert sample trainsets (if not already inserted from migration)
INSERT INTO trainsets (number, status, bay_position, mileage, branding_priority, availability_percentage, last_cleaning) VALUES
('KMRL-001', 'ready', 1, 15430, 8, 98, NOW() - INTERVAL '2 days'),
('KMRL-002', 'standby', 2, 12890, 5, 95, NOW() - INTERVAL '1 day'),
('KMRL-003', 'maintenance', 3, 18750, 3, 85, NOW() - INTERVAL '4 days'),
('KMRL-004', 'ready', 4, 14200, 9, 97, NOW() - INTERVAL '1 day'),
('KMRL-005', 'critical', 5, 22100, 2, 70, NOW() - INTERVAL '6 days'),
('KMRL-006', 'ready', 6, 13680, 7, 99, NOW() - INTERVAL '1 day'),
('KMRL-007', 'standby', 7, 16420, 4, 92, NOW() - INTERVAL '3 days'),
('KMRL-008', 'ready', 8, 11950, 10, 96, NOW() - INTERVAL '2 days'),
('KMRL-009', 'maintenance', 9, 19800, 1, 88, NOW() - INTERVAL '5 days'),
('KMRL-010', 'ready', 10, 14750, 6, 94, NOW() - INTERVAL '1 day'),
('KMRL-011', 'standby', 11, 13290, 8, 91, NOW() - INTERVAL '2 days'),
('KMRL-012', 'ready', 12, 15670, 3, 98, NOW() - INTERVAL '1 day'),
('KMRL-013', 'maintenance', 13, 20340, 5, 82, NOW() - INTERVAL '4 days'),
('KMRL-014', 'ready', 14, 12110, 9, 97, NOW() - INTERVAL '2 days'),
('KMRL-015', 'standby', 15, 17890, 2, 93, NOW() - INTERVAL '3 days'),
('KMRL-016', 'ready', 16, 14580, 7, 95, NOW() - INTERVAL '1 day'),
('KMRL-017', 'critical', 17, 23450, 1, 65, NOW() - INTERVAL '7 days'),
('KMRL-018', 'ready', 18, 13940, 4, 96, NOW() - INTERVAL '2 days'),
('KMRL-019', 'standby', 19, 16270, 6, 89, NOW() - INTERVAL '3 days'),
('KMRL-020', 'ready', 20, 15320, 8, 98, NOW() - INTERVAL '1 day'),
('KMRL-021', 'maintenance', 21, 18960, 3, 87, NOW() - INTERVAL '4 days'),
('KMRL-022', 'ready', 22, 12760, 10, 94, NOW() - INTERVAL '2 days'),
('KMRL-023', 'standby', 23, 14890, 5, 92, NOW() - INTERVAL '3 days'),
('KMRL-024', 'ready', 24, 13480, 7, 97, NOW() - INTERVAL '1 day'),
('KMRL-025', 'ready', 25, 16100, 4, 95, NOW() - INTERVAL '2 days')
ON CONFLICT (number) DO NOTHING;

-- Insert fitness certificates for all trainsets
INSERT INTO fitness_certificates (trainset_id, certificate_type, issue_date, expiry_date, certificate_number, issued_by)
SELECT 
    t.id,
    cert_type.type,
    NOW() - INTERVAL '6 months',
    NOW() + INTERVAL '6 months' + (RANDOM() * INTERVAL '1 year'),
    'CERT-' || t.number || '-' || cert_type.type || '-' || EXTRACT(YEAR FROM NOW()),
    CASE 
        WHEN cert_type.type = 'rolling_stock' THEN 'Rolling Stock Department'
        WHEN cert_type.type = 'signalling' THEN 'Signalling Department' 
        WHEN cert_type.type = 'telecom' THEN 'Telecom Department'
    END
FROM trainsets t
CROSS JOIN (VALUES 
    ('rolling_stock'::fitness_certificate_type),
    ('signalling'::fitness_certificate_type),
    ('telecom'::fitness_certificate_type)
) AS cert_type(type);

-- Insert some job cards for maintenance and critical trainsets
INSERT INTO job_cards (trainset_id, maximo_work_order, status, description, priority, estimated_hours)
SELECT 
    t.id,
    'WO-2024-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    'open',
    job_desc.description,
    job_desc.priority,
    job_desc.hours
FROM trainsets t
CROSS JOIN LATERAL (VALUES 
    ('Brake pad replacement', 4, 8),
    ('HVAC system repair', 5, 12),
    ('Door mechanism service', 3, 6),
    ('Traction motor inspection', 4, 10),
    ('Emergency brake system failure', 5, 16),
    ('Interior lighting replacement', 2, 4),
    ('Battery replacement', 3, 6),
    ('Wheel bearing inspection', 4, 8),
    ('Air conditioning filter change', 2, 2),
    ('Pantograph maintenance', 4, 10)
) AS job_desc(description, priority, hours)
WHERE t.status IN ('maintenance', 'critical')
AND RANDOM() > 0.3; -- Only create job cards for some trainsets

-- Insert historical KPI data for the last 30 days
INSERT INTO kpi_metrics (metric_date, punctuality_percentage, fleet_availability, maintenance_cost, energy_consumption, passenger_satisfaction)
SELECT 
    date_series.date,
    98.5 + RANDOM() * 2, -- Punctuality between 98.5% and 100.5%
    88 + RANDOM() * 12,   -- Fleet availability between 88% and 100%
    50000 + RANDOM() * 30000, -- Maintenance cost variation
    8500 + RANDOM() * 2000,    -- Energy consumption variation
    4.2 + RANDOM() * 0.8       -- Passenger satisfaction between 4.2 and 5.0
FROM generate_series(NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day', INTERVAL '1 day') AS date_series(date);

-- Insert some sample daily schedules for recent dates
INSERT INTO daily_schedules (schedule_date, trainset_id, planned_status, ai_confidence_score, reasoning)
SELECT 
    (NOW() - INTERVAL '1 day')::date,
    t.id,
    CASE 
        WHEN t.status = 'critical' THEN 'maintenance'
        WHEN t.status = 'maintenance' THEN 'maintenance'
        WHEN RANDOM() > 0.7 THEN 'standby'
        ELSE 'ready'
    END::train_status,
    0.75 + RANDOM() * 0.25, -- AI confidence between 75% and 100%
    jsonb_build_object(
        'factors', ARRAY['Fitness certificate valid', 'No critical job cards', 'Availability within range'],
        'risk_factors', CASE WHEN t.status = 'critical' THEN ARRAY['Critical maintenance required'] ELSE ARRAY[]::text[] END,
        'priority_score', t.branding_priority
    )
FROM trainsets t;

-- Set up some sample system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('ai_model_settings', '{"model": "deepseek-chat", "temperature": 0.2, "max_tokens": 4000}', 'AI model configuration for scheduling'),
('fleet_constraints', '{"max_service_hours": 18, "min_maintenance_interval": 7, "target_punctuality": 99.5}', 'Fleet operational constraints'),
('branding_weights', '{"priority_multiplier": 1.5, "exposure_target_hours": 12}', 'Branding priority calculation weights'),
('planning_window', '{"start_hour": 21, "end_hour": 23, "timezone": "Asia/Kolkata"}', 'Daily planning window settings')
ON CONFLICT (config_key) DO UPDATE SET 
    config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- Sample maintenance activities
INSERT INTO maintenance_activities (trainset_id, activity_type, scheduled_date, completed_date, duration_hours, cost, technician_notes)
SELECT 
    t.id,
    activity.type,
    NOW() - INTERVAL '7 days' + (RANDOM() * INTERVAL '6 days'),
    NOW() - INTERVAL '5 days' + (RANDOM() * INTERVAL '4 days'),
    activity.hours,
    activity.cost,
    'Routine maintenance completed successfully'
FROM trainsets t
CROSS JOIN LATERAL (VALUES 
    ('Monthly inspection', 4, 2500),
    ('Brake system check', 2, 1200),
    ('Interior cleaning', 1, 500),
    ('HVAC maintenance', 3, 1800),
    ('Safety system test', 2, 1000)
) AS activity(type, hours, cost)
WHERE RANDOM() > 0.7; -- Only for some trainsets