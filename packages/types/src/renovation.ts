import type { Contact } from './auth';
import type { BillingModel, ChangeOrderStatus, ProjectStatus } from './enums';

export interface Project {
  id: string;
  contact_id: string;
  name: string;
  address?: string;
  status: ProjectStatus;
  billing_model: BillingModel;
  description?: string;
  start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  deposit_pct?: number;
  deposit_amount?: number;
  deposit_paid_at?: string;
  total_estimate?: number;
  total_invoiced?: number;
  total_paid?: number;
  margin_target_pct?: number;
  notes?: string;
  chatwoot_conversation_id?: number;
  created_at: string;
  updated_at: string;
  client?: Contact;
}

export interface Subtrade {
  id: string;
  contact_id: string;
  trade_type: string;
  insurance_provider?: string;
  insurance_policy_num?: string;
  insurance_expiry?: string;
  default_rate?: number;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export interface Estimate {
  id: string;
  project_id: string;
  version: number;
  status: string;
  valid_until?: string;
  subtotal_materials?: number;
  subtotal_labour?: number;
  margin_amount?: number;
  gst?: number;
  total?: number;
  notes?: string;
  internal_notes?: string;
  dropbox_sign_id?: string;
  signed_at?: string;
  qbo_estimate_id?: string;
  created_at: string;
  updated_at: string;
  line_items?: EstimateLineItem[];
}

export interface EstimateLineItem {
  id: string;
  estimate_id: string;
  type: string;
  description: string;
  quantity: number;
  unit?: string;
  unit_cost: number;
  margin_pct: number;
  subtotal: number;
  supplier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  description: string;
  amount: number;
  status: ChangeOrderStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}
