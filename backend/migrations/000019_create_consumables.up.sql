-- Create consumables catalog table
CREATE TABLE consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_standard BOOLEAN NOT NULL DEFAULT false,
    unit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property consumables preferences table
CREATE TABLE property_consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    par_level INT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(property_id, consumable_id)
);

CREATE TRIGGER set_property_consumables_updated_at
    BEFORE UPDATE ON property_consumables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create job consumables tracking table
CREATE TABLE job_consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
    quantity_used INT NOT NULL DEFAULT 0,
    quantity_remaining INT,
    needs_restock BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed standard consumables (always tracked)
INSERT INTO consumables (name, category, is_standard, unit) VALUES
('Garbage Bags (Large)', 'cleaning', true, 'bag'),
('Garbage Bags (Small)', 'cleaning', true, 'bag'),
('Dish Soap', 'kitchen', true, 'bottle'),
('Dishwasher Pods', 'kitchen', true, 'pod'),
('Toilet Paper', 'bathroom', true, 'roll'),
('Hand Soap', 'bathroom', true, 'bottle'),
('Laundry Detergent', 'laundry', true, 'load'),
('Dryer Sheets', 'laundry', true, 'sheet'),
('All-Purpose Cleaner', 'cleaning', true, 'bottle'),
('Glass Cleaner', 'cleaning', true, 'bottle'),
('Disinfectant Wipes', 'cleaning', true, 'container');

-- Seed optional consumables
INSERT INTO consumables (name, category, is_standard, unit) VALUES
('Coffee (Ground)', 'kitchen_amenity', false, 'bag'),
('Coffee Pods', 'kitchen_amenity', false, 'pod'),
('Tea Bags', 'kitchen_amenity', false, 'bag'),
('Sugar', 'kitchen_amenity', false, 'container'),
('Creamer', 'kitchen_amenity', false, 'container'),
('Salt & Pepper', 'kitchen_amenity', false, 'set'),
('Cooking Oil', 'kitchen_amenity', false, 'bottle'),
('Shampoo', 'bathroom_amenity', false, 'bottle'),
('Conditioner', 'bathroom_amenity', false, 'bottle'),
('Body Wash', 'bathroom_amenity', false, 'bottle'),
('Lotion', 'bathroom_amenity', false, 'bottle'),
('BBQ Propane', 'bbq', false, 'tank'),
('BBQ Brush', 'bbq', false, 'each'),
('Fire Starters', 'fireplace', false, 'box'),
('Firewood (bundle)', 'fireplace', false, 'bundle'),
('Pet Waste Bags', 'pet', false, 'roll'),
('Bug Spray', 'seasonal', false, 'can'),
('Sunscreen', 'seasonal', false, 'bottle'),
('Ice Melt', 'seasonal', false, 'bag');

-- Create indexes
CREATE INDEX idx_property_consumables_property_id ON property_consumables(property_id);
CREATE INDEX idx_job_consumables_job_id ON job_consumables(job_id);
