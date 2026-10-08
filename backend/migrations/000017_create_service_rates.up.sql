-- Create service rates table
CREATE TABLE service_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    rate NUMERIC(10,2) NOT NULL,
    rate_unit TEXT NOT NULL CHECK (rate_unit IN ('hour', 'flat', 'lb', 'turnover', 'month')),
    min_charge NUMERIC(10,2),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_service_rates_updated_at
    BEFORE UPDATE ON service_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed with Strathcona rates
INSERT INTO service_rates (service_type, description, rate, rate_unit, min_charge) VALUES
-- Cleaning
('cleaning_assessment', 'Initial/Assessment Cleaning', 55.00, 'hour', NULL),
('cleaning_deep', 'Custom Deep Clean', 65.00, 'hour', NULL),
-- Laundry
('laundry_offsite', 'Off-site Laundry Service', 2.75, 'lb', 30.00),
('laundry_delivery_winter', 'Winter Laundry Delivery Surcharge', 25.00, 'flat', NULL),
-- Hot Tub
('hot_tub_monthly', 'Hot Tub Care Program - Monthly', 150.00, 'month', NULL),
('hot_tub_turnover', 'Hot Tub Post-Guest Service', 40.00, 'turnover', NULL),
('hot_tub_drain_refill', 'Additional Drain & Refill', 199.00, 'flat', NULL),
-- Maintenance
('maintenance_callout', 'Maintenance Call-out (includes 1hr)', 75.00, 'flat', NULL),
('maintenance_hourly', 'Additional Maintenance Labor', 75.00, 'hour', NULL),
('maintenance_emergency', 'Emergency Maintenance', 150.00, 'hour', NULL),
('maintenance_overnight', 'Overnight Emergency (10pm-7am)', 225.00, 'hour', NULL),
('maintenance_parts_run', 'Off-mountain Parts Run', 75.00, 'hour', NULL),
-- Stock-Up
('stockup_scheduled', 'Scheduled Stock-Up (4x/year)', 250.00, 'flat', NULL),
('stockup_unscheduled', 'Unscheduled Stock-Up Run', 75.00, 'hour', 112.50),
('stockup_emergency', 'Emergency Supply Run', 350.00, 'flat', NULL),
-- Winter Labor
('winter_labor', 'Additional Winter Labor (beyond 15min)', 75.00, 'hour', NULL);

-- Extend service_line_type enum
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'hot_tub_monthly';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'hot_tub_turnover';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'hot_tub_drain';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'stockup';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'stockup_emergency';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'deep_clean';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'winter_labor';
