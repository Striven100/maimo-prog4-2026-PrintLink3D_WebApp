import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { requireFirebase } from "@/lib/firebase";
import type {
  ChatMessage,
  Conversation,
  Offer,
  PortfolioItem,
  PrintJob,
  UserProfile,
} from "@/types";

function clean<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

function iso(value: unknown) {
  const anyValue = value as { toDate?: () => Date } | undefined;
  return anyValue?.toDate ? anyValue.toDate().toISOString() : new Date().toISOString();
}

function mapDocs<T>(snapshot: QuerySnapshot<DocumentData>, mapper: (data: DocumentData, id: string) => T): T[] {
  return snapshot.docs.map((snap) => mapper(snap.data(), snap.id));
}

const mapJob = (data: DocumentData, id: string): PrintJob => ({
  id,
  clientId: data.clientId,
  clientName: data.clientName,
  title: data.title,
  description: data.description,
  material: data.material,
  quantity: data.quantity,
  color: data.color,
  deliveryMethod: data.deliveryMethod,
  location: data.location,
  budgetMin: Number(data.budgetMin || 0),
  budgetMax: Number(data.budgetMax || 0),
  modelId: data.modelId || undefined,
  modelImageUrl: data.modelImageUrl || undefined,
  status: data.status,
  acceptedOfferId: data.acceptedOfferId || undefined,
  workerId: data.workerId || undefined,
  workerName: data.workerName || undefined,
  createdAt: iso(data.createdAt),
  updatedAt: iso(data.updatedAt),
});

const mapOffer = (data: DocumentData, id: string): Offer => ({
  id,
  jobId: data.jobId,
  workerId: data.workerId,
  workerName: data.workerName,
  workerStudioName: data.workerStudioName || undefined,
  price: Number(data.price || 0),
  material: data.material,
  deliveryDays: Number(data.deliveryDays || 0),
  deliveryMethod: data.deliveryMethod,
  notes: data.notes,
  status: data.status,
  createdAt: iso(data.createdAt),
});

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { db } = requireFirebase();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    name: data.name,
    email: data.email,
    role: data.role,
    studioName: data.studioName || undefined,
    bio: data.bio || undefined,
    location: data.location || undefined,
    materials: data.materials || [],
    baseGramPrice: data.baseGramPrice ?? undefined,
    baseHourPrice: data.baseHourPrice ?? undefined,
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
  };
}

export function subscribeWorkers(callback: (items: UserProfile[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  const q = query(collection(db, "users"), where("role", "==", "worker"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((snap) => {
      const data = snap.data();
      return {
        uid: snap.id,
        name: data.name,
        email: data.email,
        role: data.role,
        studioName: data.studioName || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        materials: data.materials || [],
        baseGramPrice: data.baseGramPrice ?? undefined,
        baseHourPrice: data.baseHourPrice ?? undefined,
        createdAt: iso(data.createdAt),
        updatedAt: iso(data.updatedAt),
      } as UserProfile;
    });
    callback(items);
  });
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  const { db } = requireFirebase();
  const safePatch = { ...patch } as Record<string, unknown>;
  delete safePatch.uid;
  delete safePatch.email;
  delete safePatch.role;
  await updateDoc(doc(db, "users", uid), clean({ ...safePatch, updatedAt: serverTimestamp() }));
}

export async function createJob(input: Omit<PrintJob, "id" | "createdAt" | "status">) {
  const { db } = requireFirebase();
  const ref = await addDoc(collection(db, "jobs"), clean({
    ...input,
    status: "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return ref.id;
}

export function subscribeOpenJobs(callback: (jobs: PrintJob[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  return onSnapshot(collection(db, "jobs"), (snapshot) => {
    const jobs = mapDocs(snapshot, mapJob)
      .filter((job) => ["published", "with_offers"].includes(job.status))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(jobs);
  });
}

export function subscribeMyJobs(uid: string, callback: (jobs: PrintJob[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  const q = query(collection(db, "jobs"), where("clientId", "==", uid));
  return onSnapshot(q, (snapshot) => {
    callback(mapDocs(snapshot, mapJob).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  });
}

export function subscribeAssignedJobs(uid: string, callback: (jobs: PrintJob[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  const q = query(collection(db, "jobs"), where("workerId", "==", uid));
  return onSnapshot(q, (snapshot) => {
    callback(mapDocs(snapshot, mapJob).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  });
}

export function subscribeJob(jobId: string, callback: (job: PrintJob | null) => void): Unsubscribe {
  const { db } = requireFirebase();
  return onSnapshot(doc(db, "jobs", jobId), (snapshot) => {
    callback(snapshot.exists() ? mapJob(snapshot.data(), snapshot.id) : null);
  });
}

export async function getJob(jobId: string): Promise<PrintJob | null> {
  const { db } = requireFirebase();
  const snap = await getDoc(doc(db, "jobs", jobId));
  return snap.exists() ? mapJob(snap.data(), snap.id) : null;
}

export async function updateJobStatus(jobId: string, status: PrintJob["status"]) {
  const { db } = requireFirebase();
  await updateDoc(doc(db, "jobs", jobId), { status, updatedAt: serverTimestamp() });
}

export async function saveJob(workerId: string, jobId: string) {
  const { db } = requireFirebase();
  await setDoc(doc(db, "savedJobs", `${workerId}_${jobId}`), {
    workerId,
    jobId,
    createdAt: serverTimestamp(),
  });
}

export async function unsaveJob(workerId: string, jobId: string) {
  const { db } = requireFirebase();
  await deleteDoc(doc(db, "savedJobs", `${workerId}_${jobId}`));
}

export function subscribeSavedJobIds(workerId: string, callback: (ids: string[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  const q = query(collection(db, "savedJobs"), where("workerId", "==", workerId));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((snap) => snap.data().jobId)));
}

export async function createOffer(input: Omit<Offer, "id" | "createdAt" | "status">) {
  const { db } = requireFirebase();
  const ref = await addDoc(collection(db, "offers"), clean({
    ...input,
    status: "sent",
    createdAt: serverTimestamp(),
  }));
  try {
    const jobSnapshot = await getDoc(doc(db, "jobs", input.jobId));
    if (jobSnapshot.exists() && jobSnapshot.data().status === "published") {
      await updateDoc(doc(db, "jobs", input.jobId), {
        status: "with_offers",
        updatedAt: serverTimestamp(),
      });
    }
  } catch {
    // La propuesta ya quedó creada. Otro taller puede haber cambiado el estado en paralelo.
  }
  return ref.id;
}

export function subscribeOffersForJob(jobId: string, callback: (offers: Offer[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  const q = query(collection(db, "offers"), where("jobId", "==", jobId));
  return onSnapshot(q, (snapshot) => callback(mapDocs(snapshot, mapOffer).sort((a, b) => a.price - b.price)));
}

export function subscribeMyOffers(workerId: string, callback: (offers: Offer[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  const q = query(collection(db, "offers"), where("workerId", "==", workerId));
  return onSnapshot(q, (snapshot) => callback(mapDocs(snapshot, mapOffer).sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
}

export async function acceptOffer(job: PrintJob, offer: Offer) {
  const { db } = requireFirebase();
  const offerQuery = query(collection(db, "offers"), where("jobId", "==", job.id));
  const offerSnapshot = await getDocs(offerQuery);
  const batch = writeBatch(db);
  offerSnapshot.docs.forEach((snap) => {
    batch.update(snap.ref, { status: snap.id === offer.id ? "accepted" : "rejected" });
  });
  batch.update(doc(db, "jobs", job.id), {
    status: "accepted",
    acceptedOfferId: offer.id,
    workerId: offer.workerId,
    workerName: offer.workerStudioName || offer.workerName,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  await setDoc(doc(db, "conversations", job.id), {
    jobId: job.id,
    jobTitle: job.title,
    participants: [job.clientId, offer.workerId],
    participantNames: {
      [job.clientId]: job.clientName,
      [offer.workerId]: offer.workerStudioName || offer.workerName,
    },
    clientId: job.clientId,
    workerId: offer.workerId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeConversations(uid: string, callback: (items: Conversation[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  const q = query(collection(db, "conversations"), where("participants", "array-contains", uid));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((snap) => {
      const data = snap.data();
      return {
        id: snap.id,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        participants: data.participants,
        participantNames: data.participantNames || {},
        clientId: data.clientId,
        workerId: data.workerId,
        updatedAt: iso(data.updatedAt),
      } as Conversation;
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    callback(items);
  });
}

export function subscribeMessages(conversationId: string, callback: (items: ChatMessage[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  return onSnapshot(collection(db, "conversations", conversationId, "messages"), (snapshot) => {
    const items = snapshot.docs.map((snap) => {
      const data = snap.data();
      return {
        id: snap.id,
        senderId: data.senderId,
        senderName: data.senderName,
        body: data.body,
        createdAt: iso(data.createdAt),
      } as ChatMessage;
    }).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    callback(items);
  });
}

export async function sendMessage(conversationId: string, senderId: string, senderName: string, body: string) {
  const { db } = requireFirebase();
  if (!body.trim()) return;
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    senderName,
    body: body.trim(),
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "conversations", conversationId), { updatedAt: serverTimestamp() });
}

export function subscribePortfolio(workerId: string, callback: (items: PortfolioItem[]) => void): Unsubscribe {
  const { db } = requireFirebase();
  const q = query(collection(db, "portfolioItems"), where("workerId", "==", workerId));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((snap) => {
      const data = snap.data();
      return {
        id: snap.id,
        workerId: data.workerId,
        title: data.title,
        description: data.description,
        material: data.material,
        imageUrl: data.imageUrl,
        createdAt: iso(data.createdAt),
      } as PortfolioItem;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(items);
  });
}

export async function createPortfolioItem(input: Omit<PortfolioItem, "id" | "createdAt">) {
  const { db } = requireFirebase();
  await addDoc(collection(db, "portfolioItems"), clean({ ...input, createdAt: serverTimestamp() }));
}

export async function deletePortfolioItem(id: string) {
  const { db } = requireFirebase();
  await deleteDoc(doc(db, "portfolioItems", id));
}
