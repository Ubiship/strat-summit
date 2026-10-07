-- Drop linen tables and enums in reverse order
DROP INDEX IF EXISTS idx_linen_rotation_log_job_id;
DROP INDEX IF EXISTS idx_linen_rotation_log_property_linen_id;
DROP INDEX IF EXISTS idx_property_linens_linen_type;
DROP INDEX IF EXISTS idx_property_linens_property_id;
DROP TRIGGER IF EXISTS set_property_linens_updated_at ON property_linens;
DROP TABLE IF EXISTS linen_rotation_log;
DROP TABLE IF EXISTS property_linens;
DROP TYPE IF EXISTS bed_size;
DROP TYPE IF EXISTS linen_type;
