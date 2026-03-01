// ─── Auth / Multi-Tenancy ─────────────────────────────────────────────────────

export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  tenantId: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

// ─── Compliance / Consent ────────────────────────────────────────────────────

export type ConsentState =
  | "opted_in"
  | "opted_out"
  | "unknown"
  | "restricted"
  | "do_not_contact";

export type ContactChannel = "sms" | "email";

export interface ConsentRecord {
  patientId: string;
  channel: ContactChannel;
  state: ConsentState;
  updatedAt: string; // ISO timestamp
  updatedBy: string; // actor: "system" | "staff" | "patient_reply"
}

export type AuditEventType =
  | "consent_changed"
  | "message_allowed"
  | "message_blocked"
  | "opt_out_received"
  | "manual_override";

export interface AuditLogEntry {
  id: string;
  patientId: string;
  patientName: string;
  eventType: AuditEventType;
  channel?: ContactChannel;
  oldState?: ConsentState;
  newState?: ConsentState;
  reason?: string;
  actor: string;
  timestamp: string;
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  lastVisitDate: string | null;
  hygieneRecallStatus: "current" | "overdue" | "none";
  hygieneRecallDueDate: string | null;
  isActive: boolean;
  source: "pms"; // data origin
  consentSms: ConsentState;
  consentEmail: ConsentState;
  hasUnscheduledTreatment: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Appointment ─────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  provider: string;
  type: string; // "hygiene" | "restorative" | "exam" etc.
  status: AppointmentStatus;
  // Mod 5.6 Tracking fields
  confirmationStatus?: "unconfirmed" | "confirmed" | "cancelled" | "rescheduled";
  reminderStep?: number; // 0 = none, 1 = 48h, 2 = 24h
  duration: number; // minutes
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Treatment Plan ───────────────────────────────────────────────────────────

export type TreatmentStatus = "recommended" | "accepted" | "scheduled" | "completed" | "declined";

export interface TreatmentPlanItem {
  id: string;
  patientId: string;
  procedureCode: string;
  description: string;
  estimatedFee: number;
  status: TreatmentStatus;
  recommendedDate: string | null;
  completedDate: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Hygiene Recall ───────────────────────────────────────────────────────────

export interface HygieneRecall {
  id: string;
  patientId: string;
  dueDate: string;
  lastCompletedDate: string | null;
  intervalMonths: number;
  status: "current" | "overdue" | "due_soon";
}

// ─── PMS / Sync ───────────────────────────────────────────────────────────────

export type PMSProvider = "Dentrix" | "Eaglesoft" | "Carestream" | "OpenDental" | "Curve";

export type SyncPhase =
  | "idle"
  | "connecting"
  | "importing"
  | "normalizing"
  | "success"
  | "partial_warning"
  | "error";

export interface SyncLog {
  id: string;
  startedAt: string;
  completedAt: string | null;
  phase: SyncPhase;
  patientsImported: number;
  appointmentsImported: number;
  treatmentPlansImported: number;
  errorMessage: string | null;
  retryCount: number;
}

export interface PMSConnection {
  provider: PMSProvider;
  connectedAt: string;
  lastSyncAt: string | null;
  status: SyncPhase;
  credentials: {
    apiKey?: string;
    practiceId?: string;
    username?: string;
  };
}

// ─── Segmentation ─────────────────────────────────────────────────────────────

export type SegmentGroup = "revenue_recovery" | "operational" | "exclusion";

export type SegmentId =
  // Revenue Recovery
  | "overdue_hygiene"
  | "unscheduled_treatment"
  | "inactive_patient"
  | "high_value_treatment"
  // Operational
  | "upcoming_appointment"
  | "recently_cancelled"
  // Exclusion
  | "do_not_contact"
  | "missing_contact"
  | "consent_restricted";

export interface SegmentMeta {
  id: SegmentId;
  label: string;
  group: SegmentGroup;
  icon: string;
  description: string;
  priorityWeight: number; // used to compute priorityScore
  color: string;          // CSS variable name for UI
}

export interface PatientSegment {
  patientId: string;
  segments: SegmentId[];
  primarySegment: SegmentId | null; // highest-weight segment
  priorityScore: number;            // 0–100, higher = more urgent
  revenueOpportunity: number;       // estimated $ value
  isOutreachEligible: boolean;      // false if any exclusion segment applies
  calculatedAt: string;
}

export interface SegmentCount {
  segmentId: SegmentId;
  count: number;
  totalRevenueOpportunity: number;
}

export interface SegmentSummary {
  totalPatients: number;
  segmented: number;
  outreachEligible: number;
  excluded: number;
  totalRevenueOpportunity: number;
  counts: SegmentCount[];
  lastCalculatedAt: string | null;
}

// ─── Revenue Audit ────────────────────────────────────────────────────────────

export type AuditCategory = "hygiene" | "treatment" | "reactivation";
export type ConfidenceScore = "high" | "medium" | "low";

export interface RevenueAuditResult {
  category: AuditCategory;
  patientCount: number;
  estimatedRevenue: number;
  confidenceScore: ConfidenceScore;
}

export interface RevenueAuditSummary {
  totalRecoverableRevenue: number;
  results: RevenueAuditResult[];
  lastCalculatedAt: string | null;
}

// ─── Smart Messaging ─────────────────────────────────────────────────────────

export type MessageStatus = "scheduled" | "sent" | "delivered" | "failed" | "replied" | "paused";
export type MessageDirection = "outbound" | "inbound";

export interface CampaignMessage {
  id: string;
  patientId: string;
  campaignId: string | null;  // null for manual ad-hoc messages
  content: string;
  status: MessageStatus;
  direction: MessageDirection;
  scheduledFor: string;       // ISO date when this should send
  sentAt: string | null;      // ISO date when actually sent
  twilioSid: string | null;   // remote tracking ID
  error: string | null;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  messagingServiceSid: string;
  phoneNumber: string;
  isSandboxMode: boolean; // if true, don't hit Twilio
}

// ─── Practice Settings ────────────────────────────────────────────────────────

export interface PracticeSettings {
  practiceName: string;        // used as {{practice_name}} token in messages
  practicePhone: string;       // optional display in messages
  messageFooter: string;       // appended to all outbound messages
  reminderTouch1Hours: number; // default 48
  reminderTouch2Hours: number; // default 24
  reminderTouch3Hours: number; // default 4
  updatedAt: string;
}

// ─── Automated Reactivation ──────────────────────────────────────────────────

export type CampaignStatus = "active" | "paused" | "completed";
export type EnrollmentStatus = "enrolled" | "in_progress" | "paused_reply" | "paused_manual" | "completed";

export interface CampaignTemplateStep {
  dayOffset: number; // Days after enrollment to send
  content: string; // Message body with {{tokens}}
}

export interface CampaignTemplate {
  id: string;
  name: string;
  targetSegment: SegmentId;
  steps: CampaignTemplateStep[];
  status: CampaignStatus;
}

export interface CampaignEnrollment {
  id: string;
  campaignId: string;
  patientId: string;
  status: EnrollmentStatus;
  currentStep: number;
  enrolledAt: string;         // ISO date
  lastMessageSentAt: string | null;  // ISO date
}


