import type { Invoice, InvoiceLineItem, AuditEntry, Vendor, User, Role, BenchEntry } from "../types";

export const INVOICES: Invoice[] = [
  { id:"INV-1021", vendor:"WBD",         month:"Mar 2026", amount:139203, currency:"USD", items:32, matched:23, flagged:9,  status:"Analyst Review",      risk:"High",   assignee:"Neha",  date:"15 Mar 2026", period:"Jan 2026", region:"US" },
  { id:"INV-778",  vendor:"AOMB",        month:"Mar 2026", amount:56109,  currency:"EUR", items:18, matched:15, flagged:3,  status:"Revalidation Needed", risk:"Medium", assignee:"Amit",  date:"12 Mar 2026", period:"Jan 2026", region:"EU" },
  { id:"INV-445",  vendor:"CCPIT",       month:"Mar 2026", amount:27197,  currency:"USD", items:14, matched:14, flagged:0,  status:"Approved",            risk:"Low",    assignee:"Riya",  date:"10 Mar 2026", period:"Jan 2026", region:"CN" },
  { id:"INV-991",  vendor:"JAH",         month:"Feb 2026", amount:38236,  currency:"USD", items:22, matched:19, flagged:3,  status:"Pending Review",      risk:"Medium", assignee:"Amit",  date:"05 Feb 2026", period:"Dec 2025", region:"US" },
  { id:"INV-337",  vendor:"Allegro",     month:"Feb 2026", amount:3545,   currency:"JPY", items:6,  matched:6,  flagged:0,  status:"Paid",                risk:"Low",    assignee:"Neha",  date:"02 Feb 2026", period:"Dec 2025", region:"JP" },
  { id:"INV-112",  vendor:"Saba",        month:"Jan 2026", amount:4014,   currency:"USD", items:8,  matched:8,  flagged:0,  status:"Approved",            risk:"Low",    assignee:"Riya",  date:"20 Jan 2026", period:"Nov 2025", region:"LB" },
  { id:"INV-654",  vendor:"Quicker",     month:"Jan 2026", amount:7610,   currency:"USD", items:11, matched:9,  flagged:2,  status:"Rate Violation",      risk:"High",   assignee:"Neha",  date:"18 Jan 2026", period:"Nov 2025", region:"US" },
  { id:"INV-289",  vendor:"S Y-CHA",    month:"Jan 2026", amount:7150,   currency:"KRW", items:9,  matched:7,  flagged:2,  status:"Analyst Review",      risk:"Medium", assignee:"Amit",  date:"14 Jan 2026", period:"Nov 2025", region:"KR" },
  { id:"INV-503",  vendor:"EP&C",        month:"Dec 2025", amount:389,    currency:"EUR", items:3,  matched:3,  flagged:0,  status:"Paid",                risk:"Low",    assignee:"Riya",  date:"28 Dec 2025", period:"Oct 2025", region:"EU" },
  { id:"INV-820",  vendor:"Lavery",      month:"Dec 2025", amount:1704,   currency:"CAD", items:5,  matched:4,  flagged:1,  status:"Pending Review",      risk:"Low",    assignee:"Neha",  date:"22 Dec 2025", period:"Oct 2025", region:"CA" },
  { id:"INV-366",  vendor:"Conley Rose", month:"Dec 2025", amount:2097,   currency:"USD", items:7,  matched:7,  flagged:0,  status:"Paid",                risk:"Low",    assignee:"Amit",  date:"15 Dec 2025", period:"Oct 2025", region:"US" },
];

export const INVOICE_LINE_ITEMS: InvoiceLineItem[] = [
  { case:"25CHEM0039",           code:"PATA", activity:"Patent Application Drafting", attorney:"S. Santhanam", amount:15042, matched:false, reason:"No email evidence — zero docket trail" },
  { case:"23CHEM0021-EP-PRI[1]", code:"PATA", activity:"Patent Application Drafting", attorney:"S. Santhanam", amount:6900,  matched:true,  reason:"" },
  { case:"25CHEM0017",           code:"PATA", activity:"Patent Application Drafting", attorney:"S. Santhanam", amount:6545,  matched:false, reason:"No email evidence — zero docket trail" },
  { case:"25CHEM0058",           code:"FFLG", activity:"First Filing / Draft App",    attorney:"K. Perumal",   amount:5000,  matched:true,  reason:"" },
  { case:"25T&I0011",            code:"FFLG", activity:"First Filing / Draft App",    attorney:"K. Perumal",   amount:2687,  matched:false, reason:"Zero emails in docket" },
  { case:"23CHEM0017-US-PCT[1]", code:"NFLG", activity:"National Phase Filing",       attorney:"C. Humphrey",  amount:2560,  matched:true,  reason:"" },
  { case:"18T&I0111-JP-PCT[1]",  code:"PPH",  activity:"Patent Prosecution Highway",  attorney:"C. Humphrey",  amount:2787,  matched:true,  reason:"" },
  { case:"22T&I0016-SG-PCT[1]",  code:"PPH",  activity:"Patent Prosecution Highway",  attorney:"C. Humphrey",  amount:2013,  matched:true,  reason:"" },
  { case:"25CHEM0036",           code:"FFLG", activity:"First Filing / Draft App",    attorney:"K. Perumal",   amount:800,   matched:false, reason:"High risk — zero email evidence" },
  { case:"22T&I0003-SA-PCT[1]",  code:"PLG",  activity:"Paralegal / Docketing",       attorney:"C. Humphrey",  amount:206,   matched:false, reason:"No emails for this case" },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id:"a1", type:"upload",     actor:"System",                      time:"15 Mar 2026, 09:41 AM", message:"Invoice INV-1021 uploaded and queued for extraction", meta:"Uploaded by: system_import · File: WBD_Jan2026_Invoice.pdf · Size: 2.4 MB" },
  { id:"a2", type:"validation", actor:"AI Engine",                   time:"15 Mar 2026, 09:43 AM", message:"AI extraction completed — 32 line items extracted from PDF", meta:"Extraction timestamp: 2026-03-15T09:43:12Z · Model: GPT-4o · Confidence: 94.2%" },
  { id:"a3", type:"validation", actor:"Validation Engine",           time:"15 Mar 2026, 09:44 AM", message:"Validation completed — 9 items flagged, 23 matched", meta:"Rules applied: RATE_CHECK_v2, EMAIL_MATCH_v3, ACTIVITY_CODE_v1" },
  { id:"a4", type:"edit",       actor:"Neha Sharma",                 time:"15 Mar 2026, 11:22 AM", message:"Case 23CHEM0021-EP-PRI[1] — status updated to Matched after manual review", meta:"Field: match_status · From: UNMATCHED → To: MATCHED" },
  { id:"a5", type:"validation", actor:"System",                      time:"15 Mar 2026, 11:25 AM", message:"Revalidation triggered — 8 items still flagged", meta:"Triggered by: Neha Sharma · Result: 1 item cleared" },
  { id:"a6", type:"edit",       actor:"Amit Verma",                  time:"16 Mar 2026, 02:14 PM", message:"Requesting WBD to provide supporting evidence for 4 high-risk cases", meta:"Comment ID: CMT-0042 · Priority: High" },
  { id:"a7", type:"approval",   actor:"Riya Kapoor (Senior Analyst)",time:"18 Mar 2026, 04:30 PM", message:"Partial approval — 23 matched items approved, 9 held", meta:"Approval ID: APR-0089 · Approved: $89,347.28 · Held: $49,855.72" },
  { id:"a8", type:"payment",    actor:"Finance System",              time:"20 Mar 2026, 09:00 AM", message:"Payment initiated — $89,347.28 via wire transfer", meta:"Payment Ref: PAY-20260320-001 · Bank: JPMorgan · Status: In Transit" },
];

export const VENDORS: Vendor[] = [
  { id:"v1", name:"Womble Bond Dickinson", code:"WOMB-US-2026-VEN-001", email:"billing@wbd.com", phone:"+1 202 857 4000", taxId:"EIN-47-3821045", vatGst:"", region:"US", country:"United States", city:"Washington DC", state:"DC", address:"1200 19th St NW", postalCode:"20036", defaultCurrency:"USD", status:"active", primaryBank:{ bankName:"JPMorgan Chase", accountName:"WBD LLP Operating Account", accountNumber:"****7621", swiftIban:"CHASUS33", bankAddress:"383 Madison Ave, New York", bankCountry:"United States", currency:"USD" }, intermediaryBank:{}, contracts:[ { id:"c1", title:"Master Engagement Agreement — WBD 2026", effective:"01 Jan 2026", expiry:"31 Dec 2026", description:"USD · All regions", status:"Active" }, { id:"c2", title:"Attorney Rate Card — 2026", effective:"15 Jan 2026", expiry:"31 Dec 2026", description:"12 attorneys listed", status:"Active" }, { id:"c3", title:"Cost Code Rate Card — 2026", effective:"15 Jan 2026", expiry:"31 Dec 2026", description:"23 activity codes", status:"Active" } ], updatedAt:"09 Apr 2026" },
  { id:"v2", name:"AOMB", code:"AOMB-EU-2026-VEN-001", email:"invoice@aomb.nl", phone:"+31 70 346 9300", taxId:"", vatGst:"VAT-NL8215634", region:"EU", country:"Netherlands", city:"The Hague", state:"", address:"Anna van Saksenlaan 51", postalCode:"2593 HW", defaultCurrency:"EUR", status:"active", primaryBank:{ bankName:"ING Bank", accountName:"AOMB BV", accountNumber:"****4492", swiftIban:"INGBNL2A", bankAddress:"Bijlmerdreef 106, Amsterdam", bankCountry:"Netherlands", currency:"EUR" }, intermediaryBank:{}, contracts:[ { id:"c4", title:"Engagement Letter — AOMB 2026", effective:"01 Jan 2026", expiry:"31 Dec 2026", description:"EUR · Europe region", status:"Active" } ], updatedAt:"02 Apr 2026" },
];

export const USERS: User[] = [
  { id:"u1", name:"SABIC Admin",  email:"admin@sabic.com",        role:"Admin",          status:"Active",   department:"IP Legal",      initials:"SA", avatarColor:"linear-gradient(135deg,#3B2FD9,#A855F7)" },
  { id:"u2", name:"Neha Sharma",  email:"neha.sharma@sabic.com",  role:"Senior Analyst", status:"Active",   department:"IP Docketing",  initials:"NS", avatarColor:"#0284C7" },
  { id:"u3", name:"Amit Verma",   email:"amit.verma@sabic.com",   role:"Analyst",        status:"Active",   department:"IP Finance",    initials:"AV", avatarColor:"#D97706" },
  { id:"u4", name:"Riya Kapoor",  email:"riya.kapoor@sabic.com",  role:"Senior Analyst", status:"Active",   department:"IP Compliance", initials:"RK", avatarColor:"#16A34A" },
  { id:"u5", name:"John Paul",    email:"john.paul@sabic.com",    role:"Viewer",         status:"Inactive", department:"Finance",       initials:"JP", avatarColor:"#6B7280" },
];

export const ROLES: Role[] = [
  { id:"r1", name:"Admin",          description:"Full platform access",                  userCount:2, permissions:{ invoiceUpload:true,  invoiceReview:true,  forcePass:true,  approveInvoice:true,  vendorMgmt:true,  userMgmt:true,  dashboards:true, exportReports:true, aiAssistant:true, onboarding:true,  auditTrail:true, rateCard:true  } },
  { id:"r2", name:"Senior Analyst", description:"Review and approve invoices",           userCount:2, permissions:{ invoiceUpload:true,  invoiceReview:true,  forcePass:true,  approveInvoice:true,  vendorMgmt:false, userMgmt:false, dashboards:true, exportReports:true, aiAssistant:true, onboarding:false, auditTrail:true, rateCard:true  } },
  { id:"r3", name:"Analyst",        description:"Review invoices and flag issues",       userCount:1, permissions:{ invoiceUpload:true,  invoiceReview:true,  forcePass:false, approveInvoice:false, vendorMgmt:false, userMgmt:false, dashboards:true, exportReports:true, aiAssistant:true, onboarding:false, auditTrail:true, rateCard:false } },
  { id:"r4", name:"Viewer",         description:"Read-only access to dashboards",        userCount:1, permissions:{ invoiceUpload:false, invoiceReview:false, forcePass:false, approveInvoice:false, vendorMgmt:false, userMgmt:false, dashboards:true, exportReports:false,aiAssistant:false,onboarding:false, auditTrail:false,rateCard:false } },
];

export const BENCH_DATA: BenchEntry[] = [
  { vendor:"WBD",     filing:2100, prosecution:1500, renewal:800, index:82  },
  { vendor:"AOMB",    filing:2700, prosecution:1900, renewal:950, index:108 },
  { vendor:"CCPIT",   filing:1950, prosecution:1300, renewal:720, index:76  },
  { vendor:"JAH",     filing:2300, prosecution:1650, renewal:870, index:92  },
  { vendor:"Allegro", filing:1800, prosecution:1200, renewal:650, index:70  },
  { vendor:"Quicker", filing:2500, prosecution:1750, renewal:900, index:100 },
];

export const MONTHLY_SPEND = [
  { month:"Oct", amount:180000 }, { month:"Nov", amount:215000 },
  { month:"Dec", amount:195000 }, { month:"Jan", amount:287000 },
  { month:"Feb", amount:245000 }, { month:"Mar", amount:265000 },
];

export const AI_RESPONSES: Record<string, string> = {
  "What is the total amount billed by WBD in January 2026?": "Based on the invoice data, <strong>WBD billed $139,203.91 USD</strong> in January 2026.<br><br>• Service Fees: $135,247.91<br>• Official Fees: $3,956.00<br>• Total line items: 32 (23 matched, 9 flagged)<br>• Flagged amount at risk: $32,822.00",
  "Which cases have no email evidence in the docket?": "I found <strong>4 high-risk cases</strong> with zero email evidence:<br><br>1. <code>25CHEM0039</code> — PATA — $15,042<br>2. <code>25CHEM0017</code> — PATA — $6,545<br>3. <code>25T&I0011</code> — FFLG — $2,687<br>4. <code>25CHEM0036</code> — FFLG — $800<br><br><strong>Total at risk: $25,074</strong>",
  "Show rate violations across all vendors this month": "<strong>Rate Violations — March 2026</strong><br><br>• <strong>Quicker Law LLC</strong> (INV-654): 2 items above agreed FFLG rate<br>Agreed: $500/hr · Billed: $620/hr · Overage: $240<br><br>Total overage: <strong>$240.00 USD</strong>",
  "What are the key terms in the WBD engagement letter?": "Key terms from <strong>WBD Master Engagement Agreement (2026)</strong>:<br><br>• Effective: 01 Jan – 31 Dec 2026<br>• Currency: USD · Net 45 days<br>• Partner: $650/hr · Associate: $380/hr<br>• PATA rate: $500 per application<br>• Dispute window: 30 days",
  "Which law firm has the highest cost index?": "<strong>AOMB</strong> has the highest cost index of <strong>108</strong>.<br><br>Ranking:<br>1. CCPIT — 76 ✅<br>2. WBD — 82 ✅<br>3. JAH — 92<br>4. Quicker — 100<br>5. AOMB — 108 🔴",
};
