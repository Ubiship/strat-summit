-- Drop consumables tables in reverse order
DROP INDEX IF EXISTS idx_job_consumables_job_id;
DROP INDEX IF EXISTS idx_property_consumables_property_id;
DROP TRIGGER IF EXISTS set_property_consumables_updated_at ON property_consumables;
DROP TABLE IF EXISTS job_consumables;
DROP TABLE IF EXISTS property_consumables;
DROP TABLE IF EXISTS consumables;
