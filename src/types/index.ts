export type RiskLevel     = "High" | "Medium" | "Low";
export type InvoiceStatus = "Analyst Review" | "Revalidation Needed" | "Approved" | "Pending Review" | "Paid" | "Rate Violation";
export type AuditLogType  = "upload" | "validation" | "edit" | "approval" | "payment";
export type UserRole      = "Admin" | "Senior Analyst" | "Analyst" | "Viewer";
export type UserStatus    = "Active" | "Inactive";
export type OrgType       = "Corporate" | "Law Firm" | "SME";
export type Currency      = "USD" | "EUR" | "JPY" | "CAD" | "KRW" | "SAR" | "GBP";
export type PillColor     = "green" | "red" | "amber" | "blue" | "gray" | "violet";

export type PageId =
  | "home" | "upload" | "inv-list" | "inv-review" | "inv-detail"
  | "vendors" | "vendor-create" | "roles" | "exec" | "activity"
  | "bench" | "onboard" | "add-user" | "add-role" | "vendor-rate-card";

export interface Invoice {
  id:        string;
  vendor:    string;
  month:     string;
  amount:    number;
  currency:  Currency;
  items:     number;
  matched:   number;
  flagged:   number;
  status:    InvoiceStatus;
  risk:      RiskLevel;
  assignee:  string;
  date:      string;
  period:    string;
  region:    string;
}

export interface InvoiceLineItem {
  case:     string;
  code:     string;
  activity: string;
  attorney: string;
  amount:   number;
  matched:  boolean;
  reason:   string;
}

export interface AuditEntry {
  id:      string;
  type:    AuditLogType;
  actor:   string;
  time:    string;
  message: string;
  meta:    string;
}

export interface VendorContract {
  id:          string;
  title:       string;
  effective:   string;
  expiry:      string;
  description: string;
  status:      "Active" | "Expired" | "Draft";
}

export interface BankInfo {
  bankName:      string;
  accountName:   string;
  accountNumber: string;
  swiftIban:     string;
  bankAddress:   string;
  bankCountry:   string;
  currency:      Currency;
}

export interface IntermediaryBank {
  bankName:          string;
  swiftBic:          string;
  abaRouting:        string;
  correspondentAcct: string;
}

export interface Vendor {
  id:               string;
  name:             string;
  code:             string;
  email:            string;
  phone:            string;
  taxId:            string;
  vatGst:           string;
  region:           string;
  country:          string;
  city:             string;
  state:            string;
  address:          string;
  postalCode:       string;
  defaultCurrency:  Currency;
  status:           "active" | "inactive";
  primaryBank:      Partial<BankInfo>;
  intermediaryBank: Partial<IntermediaryBank>;
  contracts:        VendorContract[];
  updatedAt:        string;
}

export interface Role {
  id:          string;
  name:        UserRole;
  description: string;
  userCount:   number;
  permissions: Record<string, boolean>;
}

export interface User {
  id:          string;
  name:        string;
  email:       string;
  role:        UserRole;
  status:      UserStatus;
  department:  string;
  initials:    string;
  avatarColor: string;
}

export interface BenchEntry {
  vendor:      string;
  filing:      number;
  prosecution: number;
  renewal:     number;
  index:       number;
}

export interface ChatMessage {
  id:   string;
  role: "user" | "ai";
  html: string;
}

export interface PageProps {
  onNavigate: (page: PageId, data?: unknown) => void;
}
