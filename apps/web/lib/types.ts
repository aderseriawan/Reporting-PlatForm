export type Client = {
  id: string;
  name: string;
  username: string;
  status: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  client_id: string;
  client_name: string;
  pic_client_name: string;
  pic_client_contact: string;
  status: string;
  lead_pentester: string;
  lead_pentester_contact: string;
  assets: string;
  method: string;
  created_at: string;
};

export type CaseItem = {
  id: string;
  project_id: string;
  name: string;
  status: string;
  asset: string;
  type: string;
  reporter: string;
  found_date: string;
  cwe: string;
  cvss_score: number;
  cvss_severity: string;
  cvss_vector: string;
  description: string;
  threat_risk: string;
  recommendation: string;
  reference: string;
  steps_to_reproduce: string;
  retest_result: string;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  read: boolean;
  created_at: string;
};

export type RefineResponse = {
  refined_content_html: string;
  changes_summary: string[];
  risk_flags: string[];
  model_info: Record<string, string>;
};
