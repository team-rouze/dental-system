import type {
    Patient,
    Appointment,
    TreatmentPlanItem,
    HygieneRecall,
    PMSProvider,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const randomDate = (start: Date, end: Date): string => {
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return d.toISOString().split("T")[0];
};

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const id = () => Math.random().toString(36).slice(2, 10);

const now = () => new Date().toISOString();

const firstNames = [
    "Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry",
    "Isabel", "James", "Karen", "Liam", "Maria", "Noah", "Olivia", "Peter",
    "Quinn", "Rachel", "Samuel", "Teresa",
];

const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Wilson", "Taylor", "Thomas", "Lee", "Anderson", "Martinez",
    "Robinson", "Clark", "Lewis", "Walker", "Hall", "Allen",
];

const providers = ["Dr. Chen", "Dr. Patel", "Dr. Rivera", "Dr. Kim"];

const appointmentTypes = ["Hygiene Cleaning", "Restorative Exam", "Crown Prep", "X-Ray Review", "Consultation"];

const procedureCodes = [
    { code: "D1110", description: "Adult Prophylaxis", fee: 120 },
    { code: "D0150", description: "Comprehensive Oral Evaluation", fee: 85 },
    { code: "D2740", description: "Porcelain Crown", fee: 1400 },
    { code: "D3330", description: "Molar Root Canal", fee: 1100 },
    { code: "D4341", description: "Periodontal Scaling", fee: 250 },
    { code: "D7210", description: "Surgical Tooth Extraction", fee: 350 },
];

// ─── Raw PMS Record (simulated PMS format before normalization) ───────────────

interface RawPmsPatient {
    pt_id: string;
    f_name: string;
    l_name: string;
    dob: string;
    ph: string;
    em: string;
    last_visit: string | null;
    recall_status: string;
    recall_due: string | null;
    active: number;
    txt_consent: number;   // 1 = yes, 0 = no, -1 = unknown
    em_consent: number;
    has_tx: number;
}

interface RawPmsAppointment {
    appt_id: string;
    pt_id: string;
    appt_date: string;
    appt_time: string;
    prov: string;
    appt_type: string;
    appt_status: string;
    dur: number;
    notes: string;
}

interface RawPmsTreatment {
    tx_id: string;
    pt_id: string;
    proc_code: string;
    desc: string;
    fee: number;
    tx_status: string;
    rec_date: string | null;
    comp_date: string | null;
    prov: string;
}

// ─── Raw Data Generator ───────────────────────────────────────────────────────

const generateRawPatients = (count: number): RawPmsPatient[] => {
    const today = new Date();
    const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    return Array.from({ length: count }, (_, i) => {
        const hasRecentVisit = Math.random() > 0.4;
        const recallStatuses = ["current", "overdue", "none"];
        const txtConsent = Math.random() > 0.15 ? 1 : Math.random() > 0.5 ? 0 : -1;
        const emConsent = Math.random() > 0.1 ? 1 : Math.random() > 0.5 ? 0 : -1;

        return {
            pt_id: `PMS-${String(i + 1).padStart(4, "0")}`,
            f_name: randomElement(firstNames),
            l_name: randomElement(lastNames),
            dob: randomDate(new Date(1950, 0, 1), new Date(2005, 0, 1)),
            ph: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            em: i % 8 === 0 ? "" : `patient${i + 1}@email.com`, // some missing emails
            last_visit: hasRecentVisit ? randomDate(twoYearsAgo, lastMonth) : null,
            recall_status: randomElement(recallStatuses),
            recall_due: Math.random() > 0.3 ? randomDate(lastMonth, new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())) : null,
            active: Math.random() > 0.2 ? 1 : 0,
            txt_consent: txtConsent,
            em_consent: emConsent,
            has_tx: Math.random() > 0.6 ? 1 : 0,
        };
    });
};

const generateRawAppointments = (patientIds: string[]): RawPmsAppointment[] => {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const threeMonthsAhead = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

    return patientIds.flatMap((ptId) => {
        const count = Math.floor(Math.random() * 4);
        return Array.from({ length: count }, () => ({
            appt_id: `APPT-${id()}`,
            pt_id: ptId,
            appt_date: randomDate(oneYearAgo, threeMonthsAhead),
            appt_time: `${Math.floor(Math.random() * 8) + 8}:${Math.random() > 0.5 ? "00" : "30"}`,
            prov: randomElement(providers),
            appt_type: randomElement(appointmentTypes),
            appt_status: randomElement(["scheduled", "completed", "completed", "cancelled", "no_show"]),
            dur: randomElement([30, 45, 60, 90]),
            notes: "",
        }));
    });
};

const generateRawTreatments = (patientIds: string[]): RawPmsTreatment[] => {
    return patientIds
        .filter(() => Math.random() > 0.4)
        .flatMap((ptId) => {
            const proc = randomElement(procedureCodes);
            const statuses = ["recommended", "accepted", "scheduled", "completed", "declined"];
            return [{
                tx_id: `TX-${id()}`,
                pt_id: ptId,
                proc_code: proc.code,
                desc: proc.description,
                fee: proc.fee,
                tx_status: randomElement(statuses),
                rec_date: randomDate(new Date(2024, 0, 1), new Date()),
                comp_date: Math.random() > 0.7 ? randomDate(new Date(2024, 0, 1), new Date()) : null,
                prov: randomElement(providers),
            }];
        });
};

// ─── Normalization Functions ───────────────────────────────────────────────────

const consentMap = (raw: number): "opted_in" | "opted_out" | "unknown" => {
    if (raw === 1) return "opted_in";
    if (raw === 0) return "opted_out";
    return "unknown";
};

const recallStatusMap = (raw: string): "current" | "overdue" | "none" => {
    if (raw === "current") return "current";
    if (raw === "overdue") return "overdue";
    return "none";
};

const appointmentStatusMap = (raw: string): "scheduled" | "completed" | "cancelled" | "no_show" | "rescheduled" => {
    const map: Record<string, "scheduled" | "completed" | "cancelled" | "no_show" | "rescheduled"> = {
        scheduled: "scheduled",
        completed: "completed",
        cancelled: "cancelled",
        no_show: "no_show",
        rescheduled: "rescheduled",
    };
    return map[raw] ?? "scheduled";
};

const treatmentStatusMap = (raw: string): "recommended" | "accepted" | "scheduled" | "completed" | "declined" => {
    const map: Record<string, "recommended" | "accepted" | "scheduled" | "completed" | "declined"> = {
        recommended: "recommended",
        accepted: "accepted",
        scheduled: "scheduled",
        completed: "completed",
        declined: "declined",
    };
    return map[raw] ?? "recommended";
};

export const normalizePmsPatient = (raw: RawPmsPatient): Patient => ({
    id: raw.pt_id,
    firstName: raw.f_name,
    lastName: raw.l_name,
    dateOfBirth: raw.dob,
    phone: raw.ph,
    email: raw.em,
    lastVisitDate: raw.last_visit,
    hygieneRecallStatus: recallStatusMap(raw.recall_status),
    hygieneRecallDueDate: raw.recall_due,
    isActive: raw.active === 1,
    source: "pms",
    consentSms: consentMap(raw.txt_consent),
    consentEmail: consentMap(raw.em_consent),
    hasUnscheduledTreatment: raw.has_tx === 1,
    createdAt: now(),
    updatedAt: now(),
});

export const normalizePmsAppointment = (raw: RawPmsAppointment): Appointment => ({
    id: raw.appt_id,
    patientId: raw.pt_id,
    date: raw.appt_date,
    time: raw.appt_time,
    provider: raw.prov,
    type: raw.appt_type,
    status: appointmentStatusMap(raw.appt_status),
    duration: raw.dur,
    notes: raw.notes,
    createdAt: now(),
    updatedAt: now(),
});

export const normalizePmsTreatment = (raw: RawPmsTreatment): TreatmentPlanItem => ({
    id: raw.tx_id,
    patientId: raw.pt_id,
    procedureCode: raw.proc_code,
    description: raw.desc,
    estimatedFee: raw.fee,
    status: treatmentStatusMap(raw.tx_status),
    recommendedDate: raw.rec_date,
    completedDate: raw.comp_date,
    provider: raw.prov,
    createdAt: now(),
    updatedAt: now(),
});

// ─── Mock PMS API ──────────────────────────────────────────────────────────────

const SIMULATED_LATENCY_MS = 400;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const rawPatients = generateRawPatients(48);
const rawAppointments = generateRawAppointments(rawPatients.map((p) => p.pt_id));
const rawTreatments = generateRawTreatments(rawPatients.map((p) => p.pt_id));
const rawRecalls: HygieneRecall[] = rawPatients.map((p) => ({
    id: `HR-${id()}`,
    patientId: p.pt_id,
    dueDate: p.recall_due ?? new Date().toISOString().split("T")[0],
    lastCompletedDate: p.last_visit,
    intervalMonths: randomElement([3, 6, 12]),
    status: recallStatusMap(p.recall_status) as "current" | "overdue" | "due_soon",
}));

export interface PmsAdapterOptions {
    provider: PMSProvider;
    apiKey: string;
    practiceId: string;
    forceError?: boolean;
}

export const mockPmsAdapter = {
    validateCredentials: async (opts: PmsAdapterOptions): Promise<{ success: boolean; message: string }> => {
        await delay(SIMULATED_LATENCY_MS);
        if (opts.forceError || opts.apiKey === "INVALID" || opts.practiceId === "") {
            return { success: false, message: "Invalid credentials. Please check your API key and Practice ID." };
        }
        return { success: true, message: "Connection established successfully." };
    },

    fetchAllPatients: async (): Promise<Patient[]> => {
        await delay(SIMULATED_LATENCY_MS * 2);
        return rawPatients.map(normalizePmsPatient);
    },

    fetchAllAppointments: async (): Promise<Appointment[]> => {
        await delay(SIMULATED_LATENCY_MS);
        return rawAppointments.map(normalizePmsAppointment);
    },

    fetchAllTreatmentPlans: async (): Promise<TreatmentPlanItem[]> => {
        await delay(SIMULATED_LATENCY_MS);
        return rawTreatments.map(normalizePmsTreatment);
    },

    fetchAllHygieneRecalls: async (): Promise<HygieneRecall[]> => {
        await delay(SIMULATED_LATENCY_MS);
        return rawRecalls;
    },

    // Returns only records updated in last N hours (simulates incremental sync)
    fetchIncrementalUpdates: async (): Promise<{ patients: Patient[]; appointments: Appointment[] }> => {
        await delay(SIMULATED_LATENCY_MS);
        // Simulate 2-5 changed records
        const changedPatients = rawPatients.slice(0, Math.floor(Math.random() * 4) + 2).map(normalizePmsPatient);
        const changedAppointments = rawAppointments.slice(0, Math.floor(Math.random() * 3) + 1).map(normalizePmsAppointment);
        return { patients: changedPatients, appointments: changedAppointments };
    },
};
