import { Firestore } from "@google-cloud/firestore";

export function getFirestoreConfig(env = process.env) {
  const projectId = String(
    env.FIRESTORE_PROJECT_ID ||
    (env.ENABLE_FIRESTORE === "true" ? env.GOOGLE_CLOUD_PROJECT : "")
  ).trim();
  const databaseId = String(env.FIRESTORE_DATABASE_ID || "").trim();

  if (!projectId) return null;
  return databaseId ? { projectId, databaseId } : { projectId };
}

export function sanitizeSessionForFirestore(session) {
  const value = session && typeof session === "object" ? session : {};
  return JSON.parse(JSON.stringify({
    schemaVersion: 1,
    id: String(value.id || ""),
    sessionCapabilityHash: String(value.sessionCapabilityHash || ""),
    scenarioId: String(value.scenarioId || ""),
    difficulty: String(value.difficulty || "easy"),
    consentAt: value.consentAt || null,
    status: String(value.status || "created"),
    turnCount: Number.isInteger(value.turnCount) ? value.turnCount : 0,
    createdAt: value.createdAt || null,
    startedAt: value.startedAt || null,
    completedAt: value.completedAt || null,
    updatedAt: value.updatedAt || null,
    score: sanitizeScore(value.score),
    redFlagEvents: Array.isArray(value.redFlagEvents)
      ? value.redFlagEvents.map((event) => ({
        redFlagKey: String(event.redFlagKey || ""),
        status: String(event.status || "triggered"),
        createdAt: event.createdAt || null,
      }))
      : [],
  }));
}

function sanitizeScore(score) {
  if (!score || typeof score !== "object") return null;
  return {
    immunityScore: Number.isFinite(score.immunityScore) ? score.immunityScore : 0,
    recognizedCount: Number.isInteger(score.recognizedCount) ? score.recognizedCount : 0,
    totalCount: Number.isInteger(score.totalCount) ? score.totalCount : 0,
    triggeredKeys: Array.isArray(score.triggeredKeys)
      ? score.triggeredKeys.map((key) => String(key)).filter(Boolean)
      : [],
    createdAt: score.createdAt || null,
  };
}

function hydrateFirestoreSession(document) {
  const session = sanitizeSessionForFirestore(document);
  return {
    ...session,
    userName: "Bạn",
    messages: [],
    isProcessing: false,
  };
}

class FirestoreStore {
  constructor(env = process.env) {
    this.useFirestore = false;
    this.inMemoryMap = new Map();

    const firestoreConfig = getFirestoreConfig(env);
    if (firestoreConfig) {
      try {
        this.db = new Firestore(firestoreConfig);
        this.collection = this.db.collection("sessions");
        this.useFirestore = true;
        console.log(
          `Firestore initialized with project ID: ${firestoreConfig.projectId}, ` +
          `database: ${firestoreConfig.databaseId || "(default)"}`
        );
      } catch (err) {
        console.warn("Failed to initialize Firestore, falling back to in-memory store:", err.message);
      }
    }
  }

  async get(id) {
    if (this.useFirestore) {
      try {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
          const memorySession = this.inMemoryMap.get(id);
          return memorySession ? JSON.parse(JSON.stringify(memorySession)) : undefined;
        }
        const memorySession = this.inMemoryMap.get(id);
        const hydrated = hydrateFirestoreSession(doc.data());
        return {
          ...hydrated,
          userName: memorySession?.userName || hydrated.userName,
          messages: memorySession?.messages || hydrated.messages,
          isProcessing: Boolean(memorySession?.isProcessing),
        };
      } catch (err) {
        console.error("Firestore get error:", err.message);
        throw err;
      }
    }
    const val = this.inMemoryMap.get(id);
    return val ? JSON.parse(JSON.stringify(val)) : undefined;
  }

  async set(id, val) {
    if (this.useFirestore) {
      try {
        await this.collection.doc(id).set(sanitizeSessionForFirestore(val));
      } catch (err) {
        console.error("Firestore set error:", err.message);
        throw err;
      }
    }
    this.inMemoryMap.set(id, JSON.parse(JSON.stringify(val)));
  }

  async delete(id) {
    if (this.useFirestore) {
      try {
        await this.collection.doc(id).delete();
      } catch (err) {
        console.error("Firestore delete error:", err.message);
        throw err;
      }
    }
    this.inMemoryMap.delete(id);
  }

  async size() {
    if (this.useFirestore) {
      try {
        const snapshot = await this.collection.count().get();
        return snapshot.data().count;
      } catch (err) {
        console.error("Firestore count error:", err.message);
        throw err;
      }
    }
    return this.inMemoryMap.size;
  }

  async clear() {
    if (this.useFirestore) {
      try {
        const snapshot = await this.collection.get();
        const batch = this.db.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      } catch (err) {
        console.error("Firestore clear error:", err.message);
        throw err;
      }
    }
    this.inMemoryMap.clear();
  }

  async values() {
    if (this.useFirestore) {
      try {
        const snapshot = await this.collection.get();
        return snapshot.docs.map((doc) => hydrateFirestoreSession(doc.data()));
      } catch (err) {
        console.error("Firestore values error:", err.message);
        throw err;
      }
    }
    return Array.from(this.inMemoryMap.values()).map((val) => JSON.parse(JSON.stringify(val)));
  }
}

export const sessions = new FirestoreStore();
