import { Firestore } from "@google-cloud/firestore";

class FirestoreStore {
  constructor() {
    this.useFirestore = false;
    this.inMemoryMap = new Map();

    const projectId = process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    if (projectId) {
      try {
        this.db = new Firestore({ projectId });
        this.collection = this.db.collection("sessions");
        this.useFirestore = true;
        console.log(`Firestore initialized with project ID: ${projectId}`);
      } catch (err) {
        console.warn("Failed to initialize Firestore, falling back to in-memory store:", err.message);
      }
    }
  }

  async get(id) {
    if (this.useFirestore) {
      try {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return undefined;
        return doc.data();
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
        // Serialize clean JSON to prevent Firestore metadata issues with custom properties/classes
        await this.collection.doc(id).set(JSON.parse(JSON.stringify(val)));
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
        return snapshot.docs.map((doc) => doc.data());
      } catch (err) {
        console.error("Firestore values error:", err.message);
        throw err;
      }
    }
    return Array.from(this.inMemoryMap.values()).map((val) => JSON.parse(JSON.stringify(val)));
  }
}

export const sessions = new FirestoreStore();
