// User & Auth
export type UserRole =
  | 'admin'
  | 'cleaner'
  | 'cleaning_client'
  | 'pm_owner'
  | 'renovation_client'
  | 'subtrade'
  | 'bookkeeper';

// Property Management
export type ServiceTier = '1' | '2' | '3';

export type BookingSource =
  | 'airbnb'
  | 'vrbo'
  | 'direct'
  | 'owner_use'
  | 'platform';

export type TaxTreatment = 'airbnb_managed' | 'direct' | 'none';

export type JobStatus = 'assigned' | 'in_progress' | 'complete' | 'flagged';

export type CompModel = 'hourly' | 'per_job';

export type StatementStatus = 'draft' | 'sent' | 'paid';

// Renovations
export type ProjectStatus =
  | 'estimate'
  | 'booked'
  | 'in_progress'
  | 'complete'
  | 'cancelled';

export type BillingModel = 'fixed' | 'cost_plus' | 't_and_m';

// Shared
export type PhotoVisibility = 'internal' | 'owner' | 'public';

export type ServiceLineType =
  | 'cleaning'
  | 'laundry'
  | 'shoveling'
  | 'maintenance'
  | 'purchase'
  | 'restock';

export type TaxType = 'gst_only' | 'gst_pst' | 'gst_pst_mrdt' | 'none';

export type AgreementType =
  | 'cleaning'
  | 'pm'
  | 'renovation_fixed'
  | 'renovation_cost_plus'
  | 'renovation_t_and_m';

export type ChangeOrderStatus = 'pending' | 'approved' | 'rejected';
