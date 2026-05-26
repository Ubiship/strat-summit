-- Drop all updated_at triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;', t, t);
    END LOOP;
END;
$$;

DROP FUNCTION IF EXISTS update_updated_at_column();
