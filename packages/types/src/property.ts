import type { Contact } from './auth';
import type {
  BookingSource,
  CompModel,
  JobStatus,
  ServiceTier,
  StatementStatus,
  TaxTreatment,
} from './enums';

export interface Property {
  id: string;
  name: string;
  address: string;
  tier: ServiceTier;
  commission_rate: number;
  cleaning_fee: number;
  cleaning_fee_commissionable: boolean;
  airbnb_ical_url?: string;
  vrbo_ical_url?: string;
  wifi_password?: string;
  access_codes?: Record<string, unknown>;
  hot_tub: boolean;
  hot_tub_temp_f?: number;
  notes?: string;
  supply_list?: Record<string, unknown>;
  checklist_template_id?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  owners?: PropertyOwner[];
}

export interface PropertyOwner {
  id: string;
  property_id: string;
  contact_id: string;
  equity_share: number;
  portal_access: boolean;
  statement_email?: string;
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export interface Booking {
  id: string;
  property_id: string;
  source: BookingSource;
  tax_treatment: TaxTreatment;
  external_uid?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  nights: number;
  nightly_rate?: number;
  nightly_rate_weekend?: number;
  nightly_rate_holiday?: number;
  revenue_incl_cleaning_fee?: number;
  revenue_excl_cleaning_fee?: number;
  cleaning_fee_charged?: number;
  gst: number;
  pst: number;
  mrdt: number;
  notes?: string;
  cleaning_job_id?: string;
  statement_id?: string;
  chatwoot_conversation_id?: number;
  created_at: string;
  updated_at: string;
  property?: Property;
  cleaning_job?: CleaningJob;
}

export interface CleaningJob {
  id: string;
  property_id: string;
  booking_id?: string;
  scheduled_date: string;
  scheduled_time?: string;
  status: JobStatus;
  comp_model: CompModel;
  job_rate?: number;
  duration_hours?: number;
  arrived_at?: string;
  completed_at?: string;
  checklist_data?: Record<string, unknown>;
  checklist_completion_pct: number;
  hot_tub_photo_required: boolean;
  hot_tub_status?: string;
  damage_notes?: string;
  restock_notes?: string;
  internal_notes?: string;
  dispatched_at?: string;
  reminder_sent_at?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  booking?: Booking;
  staff?: CleaningJobStaff[];
}

export interface CleaningJobStaff {
  id: string;
  job_id: string;
  contact_id: string;
  hours_logged?: number;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export interface OwnerStatement {
  id: string;
  property_id: string;
  property_owner_id: string;
  period_start: string;
  period_end: string;
  total_revenue_incl_fee?: number;
  total_revenue_excl_fee?: number;
  commission_rate?: number;
  commission_total?: number;
  gst_collected?: number;
  pst_collected?: number;
  mrdt_collected?: number;
  expenses_cleaning?: number;
  expenses_laundry?: number;
  expenses_shoveling?: number;
  expenses_maintenance?: number;
  expenses_purchases?: number;
  expenses_total?: number;
  owner_payout_net?: number;
  status: StatementStatus;
  pdf_key?: string;
  sent_at?: string;
  qbo_invoice_id?: string;
  created_at: string;
  updated_at: string;
}
