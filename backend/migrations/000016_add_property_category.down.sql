-- Remove property category and seasonal pricing columns
ALTER TABLE properties DROP COLUMN hot_tub_next_drain_date;
ALTER TABLE properties DROP COLUMN hot_tub_last_drain_date;
ALTER TABLE properties DROP COLUMN hot_tub_program_enrolled;
ALTER TABLE properties DROP COLUMN winter_access_allowance_min;
ALTER TABLE properties DROP COLUMN turnover_rate_winter;
ALTER TABLE properties DROP COLUMN turnover_rate_summer;
ALTER TABLE properties DROP COLUMN turnover_rate_annual;
ALTER TABLE properties DROP COLUMN assessment_turnover_count;
ALTER TABLE properties DROP COLUMN assessment_complete;
ALTER TABLE properties DROP COLUMN category;
