import { AUTH_EVENT, getStoredProfile, getStoredProfiles, updateStoredProfile } from "@/lib/auth";
import type {
  ChatMessage,
  Conversation,
  Offer,
  PortfolioItem,
  PrintJob,
  UserProfile,
} from "@/types";

type Unsubscribe = () => void;

type SavedJob = {
  workerId: string;
  jobId: string;
  createdAt: string;
};

type LocalDatabase = {
  jobs: PrintJob[];
  offers: Offer[];
  savedJobs: SavedJob[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  portfolioItems: PortfolioItem[];
};

const DB_KEY = "printlink3d_local_database_v1";
const DATA_EVENT = "printlink3d:data-changed";

function browserAvailable() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function emptyDatabase(): LocalDatabase {
  return {
    jobs: [],
    offers: [],
    savedJobs: [],
    conversations: [],
    messages: {},
    portfolioItems: [],
  };
}

function readDatabase(): LocalDatabase {
  if (!browserAvailable()) return emptyDatabase();

  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY) || "{}") as Partial<LocalDatabase>;
    return {
      jobs: parsed.jobs || [],
      offers: parsed.offers || [],
      savedJobs: parsed.savedJobs || [],
      conversations: parsed.conversations || [],
      messages: parsed.messages || {},
      portfolioItems: parsed.portfolioItems || [],
    };
  } catch {
    return emptyDatabase();
  }
}

function writeDatabase(database: LocalDatabase) {
  if (!browserAvailable()) return;
  localStorage.setItem(DB_KEY, JSON.stringify(database));
  window.dispatchEvent(new Event(DATA_EVENT));
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function subscribe<T>(reader: () => T, callback: (value: T) => void, includeAuth = false): Unsubscribe {
  if (!browserAvailable()) {
    callback(reader());
    return () => undefined;
  }

  const emit = () => callback(reader());
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === DB_KEY) emit();
  };

  window.addEventListener(DATA_EVENT, emit);
  window.addEventListener("storage", onStorage);
  if (includeAuth) window.addEventListener(AUTH_EVENT, emit);

  emit();

  return () => {
    window.removeEventListener(DATA_EVENT, emit);
    window.removeEventListener("storage", onStorage);
    if (includeAuth) window.removeEventListener(AUTH_EVENT, emit);
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  return getStoredProfile(uid);
}

export function subscribeWorkers(callback: (items: UserProfile[]) => void): Unsubscribe {
  return subscribe(
    () => getStoredProfiles().filter((profile) => profile.role === "worker"),
    callback,
    true
  );
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  updateStoredProfile(uid, patch);
}

export async function createJob(input: Omit<PrintJob, "id" | "createdAt" | "status">) {
  const database = readDatabase();
  const now = new Date().toISOString();
  const job: PrintJob = {
    ...input,
    id: makeId("job"),
    status: "published",
    createdAt: now,
    updatedAt: now,
  };

  database.jobs.unshift(job);
  writeDatabase(database);
  return job.id;
}

export function subscribeOpenJobs(callback: (jobs: PrintJob[]) => void): Unsubscribe {
  return subscribe(
    () =>
      readDatabase()
        .jobs
        .filter((job) => ["published", "with_offers"].includes(job.status))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    callback
  );
}

export function subscribeMyJobs(uid: string, callback: (jobs: PrintJob[]) => void): Unsubscribe {
  return subscribe(
    () =>
      readDatabase()
        .jobs
        .filter((job) => job.clientId === uid)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    callback
  );
}

export function subscribeAssignedJobs(uid: string, callback: (jobs: PrintJob[]) => void): Unsubscribe {
  return subscribe(
    () =>
      readDatabase()
        .jobs
        .filter((job) => job.workerId === uid)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    callback
  );
}

export function subscribeJob(jobId: string, callback: (job: PrintJob | null) => void): Unsubscribe {
  return subscribe(
    () => readDatabase().jobs.find((job) => job.id === jobId) || null,
    callback
  );
}

export async function getJob(jobId: string): Promise<PrintJob | null> {
  return readDatabase().jobs.find((job) => job.id === jobId) || null;
}

export async function updateJobStatus(jobId: string, status: PrintJob["status"]) {
  const database = readDatabase();
  database.jobs = database.jobs.map((job) =>
    job.id === jobId
      ? { ...job, status, updatedAt: new Date().toISOString() }
      : job
  );
  writeDatabase(database);
}

export async function saveJob(workerId: string, jobId: string) {
  const database = readDatabase();
  if (!database.savedJobs.some((item) => item.workerId === workerId && item.jobId === jobId)) {
    database.savedJobs.push({
      workerId,
      jobId,
      createdAt: new Date().toISOString(),
    });
    writeDatabase(database);
  }
}

export async function unsaveJob(workerId: string, jobId: string) {
  const database = readDatabase();
  database.savedJobs = database.savedJobs.filter(
    (item) => !(item.workerId === workerId && item.jobId === jobId)
  );
  writeDatabase(database);
}

export function subscribeSavedJobIds(workerId: string, callback: (ids: string[]) => void): Unsubscribe {
  return subscribe(
    () =>
      readDatabase()
        .savedJobs
        .filter((item) => item.workerId === workerId)
        .map((item) => item.jobId),
    callback
  );
}

export async function createOffer(input: Omit<Offer, "id" | "createdAt" | "status">) {
  const database = readDatabase();

  const existing = database.offers.find(
    (offer) => offer.jobId === input.jobId && offer.workerId === input.workerId
  );

  if (existing) {
    throw new Error("Ya enviaste una propuesta para este trabajo.");
  }

  const offer: Offer = {
    ...input,
    id: makeId("offer"),
    status: "sent",
    createdAt: new Date().toISOString(),
  };

  database.offers.unshift(offer);
  database.jobs = database.jobs.map((job) =>
    job.id === input.jobId && job.status === "published"
      ? { ...job, status: "with_offers", updatedAt: new Date().toISOString() }
      : job
  );

  writeDatabase(database);
  return offer.id;
}

export function subscribeOffersForJob(jobId: string, callback: (offers: Offer[]) => void): Unsubscribe {
  return subscribe(
    () =>
      readDatabase()
        .offers
        .filter((offer) => offer.jobId === jobId)
        .sort((a, b) => a.price - b.price),
    callback
  );
}

export function subscribeMyOffers(workerId: string, callback: (offers: Offer[]) => void): Unsubscribe {
  return subscribe(
    () =>
      readDatabase()
        .offers
        .filter((offer) => offer.workerId === workerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    callback
  );
}

export async function acceptOffer(job: PrintJob, offer: Offer) {
  const database = readDatabase();
  const now = new Date().toISOString();

  database.offers = database.offers.map((item) =>
    item.jobId === job.id
      ? { ...item, status: item.id === offer.id ? "accepted" : "rejected" }
      : item
  );

  database.jobs = database.jobs.map((item) =>
    item.id === job.id
      ? {
          ...item,
          status: "accepted",
          acceptedOfferId: offer.id,
          workerId: offer.workerId,
          workerName: offer.workerStudioName || offer.workerName,
          updatedAt: now,
        }
      : item
  );

  const existingConversation = database.conversations.find((item) => item.id === job.id);
  const conversation: Conversation = {
    id: job.id,
    jobId: job.id,
    jobTitle: job.title,
    participants: [job.clientId, offer.workerId],
    participantNames: {
      [job.clientId]: job.clientName,
      [offer.workerId]: offer.workerStudioName || offer.workerName,
    },
    clientId: job.clientId,
    workerId: offer.workerId,
    updatedAt: now,
  };

  database.conversations = existingConversation
    ? database.conversations.map((item) => (item.id === job.id ? conversation : item))
    : [conversation, ...database.conversations];

  if (!database.messages[job.id]) database.messages[job.id] = [];

  writeDatabase(database);
}

export function subscribeConversations(uid: string, callback: (items: Conversation[]) => void): Unsubscribe {
  return subscribe(
    () =>
      readDatabase()
        .conversations
        .filter((item) => item.participants.includes(uid))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    callback
  );
}

export function subscribeMessages(conversationId: string, callback: (items: ChatMessage[]) => void): Unsubscribe {
  return subscribe(
    () =>
      [...(readDatabase().messages[conversationId] || [])].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      ),
    callback
  );
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  body: string
) {
  const trimmed = body.trim();
  if (!trimmed) return;

  const database = readDatabase();
  const now = new Date().toISOString();

  const message: ChatMessage = {
    id: makeId("message"),
    senderId,
    senderName,
    body: trimmed,
    createdAt: now,
  };

  database.messages[conversationId] = [
    ...(database.messages[conversationId] || []),
    message,
  ];

  database.conversations = database.conversations.map((conversation) =>
    conversation.id === conversationId
      ? { ...conversation, updatedAt: now }
      : conversation
  );

  writeDatabase(database);
}

export function subscribePortfolio(workerId: string, callback: (items: PortfolioItem[]) => void): Unsubscribe {
  return subscribe(
    () =>
      readDatabase()
        .portfolioItems
        .filter((item) => item.workerId === workerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    callback
  );
}

export async function createPortfolioItem(input: Omit<PortfolioItem, "id" | "createdAt">) {
  const database = readDatabase();
  database.portfolioItems.unshift({
    ...input,
    id: makeId("portfolio"),
    createdAt: new Date().toISOString(),
  });
  writeDatabase(database);
}

export async function deletePortfolioItem(id: string) {
  const database = readDatabase();
  database.portfolioItems = database.portfolioItems.filter((item) => item.id !== id);
  writeDatabase(database);
}
