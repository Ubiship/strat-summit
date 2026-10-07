-- Drop service rates table
DROP TRIGGER IF EXISTS set_service_rates_updated_at ON service_rates;
DROP TABLE IF EXISTS service_rates;
-- Note: Cannot remove enum values in PostgreSQL, they remain but are unused
