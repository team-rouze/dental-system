import type { SyncLog, SyncPhase, PMSProvider } from "@/types";
import { mockPmsAdapter, type PmsAdapterOptions } from "@/lib/pms/mockPmsAdapter";
import {
    patientStore,
    appointmentStore,
    treatmentPlanStore,
    hygieneRecallStore,
    syncLogStore,
    connectionStore,
} from "@/lib/db/store";
import { initializeConsentForPatients } from "@/lib/compliance/consentEngine";
import { runSegmentation } from "@/lib/segmentation/segmentationEngine";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const generateId = () => Math.random().toString(36).slice(2, 10);

// ─── Sync State Emitter ────────────────────────────────────────────────────────
// We use a simple callback pattern so UI components can react to phase changes.

type SyncPhaseCallback = (phase: SyncPhase) => void;
let syncPhaseCallbacks: SyncPhaseCallback[] = [];

export const onSyncPhaseChange = (cb: SyncPhaseCallback): (() => void) => {
    syncPhaseCallbacks.push(cb);
    return () => { syncPhaseCallbacks = syncPhaseCallbacks.filter((c) => c !== cb); };
};

const emitPhase = (phase: SyncPhase) => {
    syncPhaseCallbacks.forEach((cb) => cb(phase));
};

// ─── Initial Full Import ───────────────────────────────────────────────────────

export const runInitialImport = async (options: PmsAdapterOptions): Promise<SyncLog> => {
    const logEntry: SyncLog = {
        id: generateId(),
        startedAt: new Date().toISOString(),
        completedAt: null,
        phase: "connecting",
        patientsImported: 0,
        appointmentsImported: 0,
        treatmentPlansImported: 0,
        errorMessage: null,
        retryCount: 0,
    };
    syncLogStore.add(logEntry);

    // Phase 1: Validate credentials
    emitPhase("connecting");
    const validation = await mockPmsAdapter.validateCredentials(options);
    if (!validation.success) {
        syncLogStore.updateLatest({ phase: "error", completedAt: new Date().toISOString(), errorMessage: validation.message });
        emitPhase("error");
        connectionStore.update({ status: "error" });
        return syncLogStore.getLast()!;
    }

    // Phase 2: Import data
    emitPhase("importing");
    syncLogStore.updateLatest({ phase: "importing" });

    let retries = 0;
    let imported = false;

    while (retries <= MAX_RETRIES && !imported) {
        try {
            const [patients, appointments, treatmentPlans, hygieneRecalls] = await Promise.all([
                mockPmsAdapter.fetchAllPatients(),
                mockPmsAdapter.fetchAllAppointments(),
                mockPmsAdapter.fetchAllTreatmentPlans(),
                mockPmsAdapter.fetchAllHygieneRecalls(),
            ]);

            // Phase 3: Normalize and store
            emitPhase("normalizing");
            syncLogStore.updateLatest({ phase: "normalizing" });

            patientStore.upsert(patients);
            appointmentStore.upsert(appointments);
            treatmentPlanStore.upsert(treatmentPlans);
            hygieneRecallStore.upsert(hygieneRecalls);

            // Initialize consent records from patient data
            initializeConsentForPatients(patients);

            // Run patient segmentation engine
            runSegmentation();

            syncLogStore.updateLatest({
                phase: "success",
                completedAt: new Date().toISOString(),
                patientsImported: patients.length,
                appointmentsImported: appointments.length,
                treatmentPlansImported: treatmentPlans.length,
            });

            connectionStore.update({
                status: "success",
                lastSyncAt: new Date().toISOString(),
            });

            emitPhase("success");
            imported = true;
        } catch (err) {
            retries++;
            syncLogStore.updateLatest({ retryCount: retries });
            if (retries > MAX_RETRIES) {
                const message = err instanceof Error ? err.message : "Unknown sync error";
                syncLogStore.updateLatest({ phase: "error", completedAt: new Date().toISOString(), errorMessage: message });
                emitPhase("error");
                connectionStore.update({ status: "error" });
            } else {
                await delay(RETRY_DELAY_MS * retries);
            }
        }
    }

    return syncLogStore.getLast()!;
};

// ─── Incremental Sync ──────────────────────────────────────────────────────────

export const runIncrementalSync = async (): Promise<SyncLog> => {
    const conn = connectionStore.get();
    if (!conn) {
        throw new Error("No PMS connection established. Run initial import first.");
    }

    const logEntry: SyncLog = {
        id: generateId(),
        startedAt: new Date().toISOString(),
        completedAt: null,
        phase: "importing",
        patientsImported: 0,
        appointmentsImported: 0,
        treatmentPlansImported: 0,
        errorMessage: null,
        retryCount: 0,
    };
    syncLogStore.add(logEntry);
    emitPhase("normalizing");

    let retries = 0;
    while (retries <= MAX_RETRIES) {
        try {
            const { patients, appointments } = await mockPmsAdapter.fetchIncrementalUpdates();

            patientStore.upsert(patients);
            appointmentStore.upsert(appointments);
            initializeConsentForPatients(patients);
            runSegmentation();

            syncLogStore.updateLatest({
                phase: "success",
                completedAt: new Date().toISOString(),
                patientsImported: patients.length,
                appointmentsImported: appointments.length,
            });

            connectionStore.update({ lastSyncAt: new Date().toISOString(), status: "success" });
            emitPhase("success");
            break;
        } catch (err) {
            retries++;
            syncLogStore.updateLatest({ retryCount: retries });
            if (retries > MAX_RETRIES) {
                const message = err instanceof Error ? err.message : "Incremental sync failed";
                syncLogStore.updateLatest({ phase: "error", completedAt: new Date().toISOString(), errorMessage: message });
                emitPhase("error");
            } else {
                await delay(RETRY_DELAY_MS * retries);
            }
        }
    }

    return syncLogStore.getLast()!;
};

// ─── Connection Setup ─────────────────────────────────────────────────────────

export const setupConnection = (provider: PMSProvider, apiKey: string, practiceId: string) => {
    connectionStore.set({
        provider,
        connectedAt: new Date().toISOString(),
        lastSyncAt: null,
        status: "connecting",
        credentials: { apiKey, practiceId },
    });
};
