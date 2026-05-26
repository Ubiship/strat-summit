-- Strathcona Summit Solutions - Enums
-- All enumerated types used across the platform

CREATE TYPE service_tier       AS ENUM ('1','2','3');
CREATE TYPE booking_source     AS ENUM ('airbnb','vrbo','direct','owner_use','platform');
CREATE TYPE tax_treatment      AS ENUM ('airbnb_managed','direct','none');
CREATE TYPE service_line_type  AS ENUM ('cleaning','laundry','shoveling','maintenance','purchase','restock');
CREATE TYPE tax_type           AS ENUM ('gst_only','gst_pst','gst_pst_mrdt','none');
CREATE TYPE statement_status   AS ENUM ('draft','sent','paid');
CREATE TYPE job_status         AS ENUM ('assigned','in_progress','complete','flagged');
CREATE TYPE comp_model         AS ENUM ('hourly','per_job');
CREATE TYPE project_status     AS ENUM ('estimate','booked','in_progress','complete','cancelled');
CREATE TYPE billing_model      AS ENUM ('fixed','cost_plus','t_and_m');
CREATE TYPE change_order_status AS ENUM ('pending','approved','rejected');
CREATE TYPE user_role          AS ENUM ('admin','cleaner','cleaning_client','pm_owner','renovation_client','subtrade','bookkeeper');
CREATE TYPE photo_visibility   AS ENUM ('internal','owner','public');
CREATE TYPE agreement_type     AS ENUM ('cleaning','pm','renovation_fixed','renovation_cost_plus','renovation_t_and_m');
