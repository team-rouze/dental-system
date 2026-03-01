import type {
    Patient,
    Appointment,
    TreatmentPlanItem,
    HygieneRecall,
    SyncLog,
    PMSConnection,
    AuditLogEntry,
    ConsentRecord,
    PatientSegment,
    SegmentId,
    CampaignMessage,
    TwilioConfig,
    CampaignTemplate,
    CampaignEnrollment,
    PracticeSettings,
    User,
    Tenant,
} from "@/types";
import bcrypt from "bcryptjs";


// ─── In-Memory Store ──────────────────────────────────────────────────────────

let patients: Patient[] = [];
let appointments: Appointment[] = [];
let treatmentPlans: TreatmentPlanItem[] = [];
let hygieneRecalls: HygieneRecall[] = [];
let syncLogs: SyncLog[] = [];
let pmsConnection: PMSConnection | null = null;
let auditLog: AuditLogEntry[] = [];
let consentRecords: ConsentRecord[] = [];

// ─── Patient Store ────────────────────────────────────────────────────────────

export const patientStore = {
    getAll: (): Patient[] => patients,
    getById: (id: string): Patient | undefined => patients.find((p) => p.id === id),
    upsert: (incoming: Patient[]): void => {
        incoming.forEach((incomingPatient) => {
            const idx = patients.findIndex((p) => p.id === incomingPatient.id);
            if (idx >= 0) {
                patients[idx] = incomingPatient;
            } else {
                patients.push(incomingPatient);
            }
        });
    },
    clear: (): void => { patients = []; },
    count: (): number => patients.length,
};

// ─── Appointment Store ────────────────────────────────────────────────────────

export const appointmentStore = {
    getAll: (): Appointment[] => appointments,
    getByPatientId: (patientId: string): Appointment[] =>
        appointments.filter((a) => a.patientId === patientId),
    upsert: (incoming: Appointment[]): void => {
        incoming.forEach((apt) => {
            const idx = appointments.findIndex((a) => a.id === apt.id);
            if (idx >= 0) {
                appointments[idx] = apt;
            } else {
                appointments.push(apt);
            }
        });
    },
    clear: (): void => { appointments = []; },
    count: (): number => appointments.length,
};

// ─── Treatment Plan Store ─────────────────────────────────────────────────────

export const treatmentPlanStore = {
    getAll: (): TreatmentPlanItem[] => treatmentPlans,
    getByPatientId: (patientId: string): TreatmentPlanItem[] =>
        treatmentPlans.filter((t) => t.patientId === patientId),
    upsert: (incoming: TreatmentPlanItem[]): void => {
        incoming.forEach((plan) => {
            const idx = treatmentPlans.findIndex((t) => t.id === plan.id);
            if (idx >= 0) {
                treatmentPlans[idx] = plan;
            } else {
                treatmentPlans.push(plan);
            }
        });
    },
    clear: (): void => { treatmentPlans = []; },
    count: (): number => treatmentPlans.length,
};

// ─── Hygiene Recall Store ─────────────────────────────────────────────────────

export const hygieneRecallStore = {
    getAll: (): HygieneRecall[] => hygieneRecalls,
    upsert: (incoming: HygieneRecall[]): void => {
        incoming.forEach((r) => {
            const idx = hygieneRecalls.findIndex((h) => h.id === r.id);
            if (idx >= 0) {
                hygieneRecalls[idx] = r;
            } else {
                hygieneRecalls.push(r);
            }
        });
    },
    clear: (): void => { hygieneRecalls = []; },
};

// ─── Sync Log Store ───────────────────────────────────────────────────────────

export const syncLogStore = {
    getAll: (): SyncLog[] => [...syncLogs].reverse(), // latest first
    add: (log: SyncLog): void => { syncLogs.push(log); },
    updateLatest: (updates: Partial<SyncLog>): void => {
        if (syncLogs.length === 0) return;
        const last = syncLogs[syncLogs.length - 1];
        syncLogs[syncLogs.length - 1] = { ...last, ...updates };
    },
    getLast: (): SyncLog | null => syncLogs[syncLogs.length - 1] ?? null,
};

// ─── PMS Connection Store ─────────────────────────────────────────────────────

export const connectionStore = {
    get: (): PMSConnection | null => pmsConnection,
    set: (conn: PMSConnection): void => { pmsConnection = conn; },
    update: (updates: Partial<PMSConnection>): void => {
        if (pmsConnection) pmsConnection = { ...pmsConnection, ...updates };
    },
    clear: (): void => { pmsConnection = null; },
};

// ─── Audit Log Store ──────────────────────────────────────────────────────────

export const auditLogStore = {
    getAll: (): AuditLogEntry[] => [...auditLog].reverse(),
    getByPatient: (patientId: string): AuditLogEntry[] =>
        auditLog.filter((e) => e.patientId === patientId).reverse(),
    add: (entry: AuditLogEntry): void => { auditLog.push(entry); },
    count: (): number => auditLog.length,
};

// ─── Consent Record Store ─────────────────────────────────────────────────────

export const consentRecordStore = {
    getAll: (): ConsentRecord[] => consentRecords,
    get: (patientId: string, channel: "sms" | "email"): ConsentRecord | undefined =>
        consentRecords.find((r) => r.patientId === patientId && r.channel === channel),
    upsert: (record: ConsentRecord): void => {
        const idx = consentRecords.findIndex(
            (r) => r.patientId === record.patientId && r.channel === record.channel
        );
        if (idx >= 0) {
            consentRecords[idx] = record;
        } else {
            consentRecords.push(record);
        }
    },
    countByState: (state: string): number =>
        consentRecords.filter((r) => r.state === state).length,
};

// ─── Patient Segment Store ────────────────────────────────────────────────────

let patientSegments: PatientSegment[] = [];

export const segmentStore = {
    getAll: (): PatientSegment[] => patientSegments,
    getByPatientId: (patientId: string): PatientSegment | undefined =>
        patientSegments.find((s) => s.patientId === patientId),
    upsert: (record: PatientSegment): void => {
        const idx = patientSegments.findIndex((s) => s.patientId === record.patientId);
        if (idx >= 0) {
            patientSegments[idx] = record;
        } else {
            patientSegments.push(record);
        }
    },
    clear: (): void => { patientSegments = []; },
    count: (): number => patientSegments.length,
};

// ─── Messaging Stores ────────────────────────────────────────────────────────

let messages: CampaignMessage[] = [];

export const messageStore = {
    getAll: (): CampaignMessage[] => messages,
    getByPatient: (patientId: string): CampaignMessage[] =>
        messages.filter(m => m.patientId === patientId),
    getByTwilioSid: (sid: string): CampaignMessage | undefined =>
        messages.find(m => m.twilioSid === sid),
    getPending: (): CampaignMessage[] =>
        messages.filter(m => m.status === "scheduled" && new Date(m.scheduledFor) <= new Date()),
    upsert: (msg: CampaignMessage): void => {
        const idx = messages.findIndex(m => m.id === msg.id);
        if (idx >= 0) {
            messages[idx] = msg;
        } else {
            messages.push(msg);
        }
    },
    add: (msg: CampaignMessage): void => { messages.push(msg); },
    clear: (): void => { messages = []; },
    count: (): number => messages.length,
};

let twilioConfig: TwilioConfig = {
    accountSid: "",
    authToken: "",
    messagingServiceSid: "",
    phoneNumber: "",
    isSandboxMode: true, // Default to true so dev usage is safe out of the box
};

export const configStore = {
    getTwilioConfig: (): TwilioConfig => twilioConfig,
    updateTwilioConfig: (config: Partial<TwilioConfig>): void => {
        twilioConfig = { ...twilioConfig, ...config };
    }
};

// ─── Automations Stores ──────────────────────────────────────────────────────

let campaigns: CampaignTemplate[] = [];
let enrollments: CampaignEnrollment[] = [];

export const campaignStore = {
    getAll: (): CampaignTemplate[] => campaigns,
    getById: (id: string): CampaignTemplate | undefined => campaigns.find(c => c.id === id),
    upsert: (record: CampaignTemplate): void => {
        const idx = campaigns.findIndex(c => c.id === record.id);
        if (idx >= 0) {
            campaigns[idx] = record;
        } else {
            campaigns.push(record);
        }
    },
    clear: (): void => { campaigns = []; },
    count: (): number => campaigns.length,
};

export const enrollmentStore = {
    getAll: (): CampaignEnrollment[] => enrollments,
    getByPatient: (patientId: string): CampaignEnrollment[] => enrollments.filter(e => e.patientId === patientId),
    getByCampaign: (campaignId: string): CampaignEnrollment[] => enrollments.filter(e => e.campaignId === campaignId),
    getInProgress: (): CampaignEnrollment[] => enrollments.filter(e => e.status === "in_progress" || e.status === "enrolled"),
    upsert: (record: CampaignEnrollment): void => {
        const idx = enrollments.findIndex(e => e.id === record.id);
        if (idx >= 0) {
            enrollments[idx] = record;
        } else {
            enrollments.push(record);
        }
    },
    clear: (): void => { enrollments = []; },
    count: (): number => enrollments.length,
};

// ─── Practice Settings Store ──────────────────────────────────────────────────

let practiceSettings: PracticeSettings = {
    practiceName: "Our Dental Clinic",
    practicePhone: "",
    messageFooter: "",
    reminderTouch1Hours: 48,
    reminderTouch2Hours: 24,
    reminderTouch3Hours: 4,
    updatedAt: new Date().toISOString(),
};

export const practiceStore = {
    get: (): PracticeSettings => practiceSettings,
    update: (updates: Partial<Omit<PracticeSettings, "updatedAt">>): void => {
        practiceSettings = { ...practiceSettings, ...updates, updatedAt: new Date().toISOString() };
    },
};

// ─── Tenant Store ─────────────────────────────────────────────────────────────

const DEMO_TENANT: Tenant = {
    id: "tenant_demo_001",
    name: "Demo Dental Practice",
    createdAt: new Date().toISOString(),
};

let tenants: Tenant[] = [DEMO_TENANT];

export const tenantStore = {
    getAll: (): Tenant[] => tenants,
    getById: (id: string): Tenant | undefined => tenants.find(t => t.id === id),
    upsert: (tenant: Tenant): void => {
        const idx = tenants.findIndex(t => t.id === tenant.id);
        if (idx >= 0) tenants[idx] = tenant;
        else tenants.push(tenant);
    },
};

// ─── User Store ───────────────────────────────────────────────────────────────

// Pre-hashed passwords for seeded demo users (bcrypt, cost 10)
// admin123 → hash, staff123 → hash — computed at module load
const ADMIN_HASH = bcrypt.hashSync("admin123", 10);
const STAFF_HASH = bcrypt.hashSync("staff123", 10);

let users: User[] = [
    {
        id: "user_admin_001",
        email: "admin@demo.com",
        passwordHash: ADMIN_HASH,
        name: "Admin User",
        role: "admin",
        tenantId: "tenant_demo_001",
        createdAt: new Date().toISOString(),
    },
    {
        id: "user_staff_001",
        email: "staff@demo.com",
        passwordHash: STAFF_HASH,
        name: "Staff User",
        role: "staff",
        tenantId: "tenant_demo_001",
        createdAt: new Date().toISOString(),
    },
];

export const userStore = {
    getAll: (): User[] => users,
    getById: (id: string): User | undefined => users.find(u => u.id === id),
    getByEmail: (email: string): User | undefined =>
        users.find(u => u.email.toLowerCase() === email.toLowerCase()),
    upsert: (user: User): void => {
        const idx = users.findIndex(u => u.id === user.id);
        if (idx >= 0) users[idx] = user;
        else users.push(user);
    },
    count: (): number => users.length,
};
