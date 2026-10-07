-- Add property category and seasonal pricing columns
ALTER TABLE properties ADD COLUMN category TEXT NOT NULL DEFAULT 'condo'
  CHECK (category IN ('condo', 'chalet', 'alpine_village'));

-- Assessment tracking
ALTER TABLE properties ADD COLUMN assessment_complete BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN assessment_turnover_count INT NOT NULL DEFAULT 0;

-- Turnover rates (flat rate after assessment)
ALTER TABLE properties ADD COLUMN turnover_rate_annual NUMERIC(10,2);
ALTER TABLE properties ADD COLUMN turnover_rate_summer NUMERIC(10,2);
ALTER TABLE properties ADD COLUMN turnover_rate_winter NUMERIC(10,2);

-- Winter operations
ALTER TABLE properties ADD COLUMN winter_access_allowance_min INT NOT NULL DEFAULT 0;

-- Hot tub program
ALTER TABLE properties ADD COLUMN hot_tub_program_enrolled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN hot_tub_last_drain_date DATE;
ALTER TABLE properties ADD COLUMN hot_tub_next_drain_date DATE;

-- Migrate existing data: set assessment_complete=true and copy cleaning_fee to turnover_rate_annual
UPDATE properties SET assessment_complete = true, turnover_rate_annual = cleaning_fee WHERE cleaning_fee > 0;
