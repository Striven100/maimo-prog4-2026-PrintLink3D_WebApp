import type { UserProfile, UserRole } from "@/types";

const USERS_KEY = "printlink3d_local_users_v1";
const SESSION_KEY = "printlink3d_local_session_v1";
export const AUTH_EVENT = "printlink3d:auth-changed";

export type LocalUser = {
  uid: string;
  email: string;
  displayName: string;
};

type LocalAccount = {
  uid: string;
  email: string;
  passwordHash: string;
  salt: string;
  profile: UserProfile;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studioName?: string;
  location?: string;
};

function browserAvailable() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAccounts(): LocalAccount[] {
  if (!browserAvailable()) return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as LocalAccount[];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: LocalAccount[]) {
  if (!browserAvailable()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function hashPassword(password: string, salt: string) {
  const payload = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return bytesToHex(new Uint8Array(digest));
}

function makeUid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `user-${crypto.randomUUID()}`;
  }
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function accountToUser(account: LocalAccount): LocalUser {
  return {
    uid: account.uid,
    email: account.email,
    displayName: account.profile.name,
  };
}

export async function registerUser(input: RegisterInput) {
  if (!browserAvailable()) throw new Error("El registro local solo está disponible en el navegador.");

  const email = input.email.trim().toLowerCase();
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === email)) {
    throw new Error("Ya existe una cuenta local con ese email.");
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(input.password, salt);
  const uid = makeUid();
  const now = new Date().toISOString();

  const profile: UserProfile = {
    uid,
    name: input.name.trim(),
    email,
    role: input.role,
    studioName: input.role === "worker" ? input.studioName?.trim() || input.name.trim() : undefined,
    location: input.location?.trim() || "",
    materials: input.role === "worker" ? ["PLA"] : [],
    baseGramPrice: input.role === "worker" ? 250 : undefined,
    baseHourPrice: input.role === "worker" ? 700 : undefined,
    bio: "",
    createdAt: now,
    updatedAt: now,
  };

  const account: LocalAccount = {
    uid,
    email,
    passwordHash,
    salt,
    profile,
  };

  writeAccounts([...accounts, account]);
  sessionStorage.setItem(SESSION_KEY, uid);
  window.dispatchEvent(new Event(AUTH_EVENT));

  return accountToUser(account);
}

export async function loginUser(email: string, password: string) {
  if (!browserAvailable()) throw new Error("El inicio de sesión local solo está disponible en el navegador.");

  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);

  if (!account) {
    throw new Error("No existe una cuenta local con ese email.");
  }

  const passwordHash = await hashPassword(password, account.salt);
  if (passwordHash !== account.passwordHash) {
    throw new Error("La contraseña no es correcta.");
  }

  sessionStorage.setItem(SESSION_KEY, account.uid);
  window.dispatchEvent(new Event(AUTH_EVENT));
  return accountToUser(account);
}

export async function logoutUser() {
  if (!browserAvailable()) return;
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getCurrentUser(): LocalUser | null {
  if (!browserAvailable()) return null;
  const uid = sessionStorage.getItem(SESSION_KEY);
  if (!uid) return null;
  const account = readAccounts().find((item) => item.uid === uid);
  return account ? accountToUser(account) : null;
}

export function getStoredProfiles(): UserProfile[] {
  return readAccounts().map((account) => account.profile);
}

export function getStoredProfile(uid: string): UserProfile | null {
  return readAccounts().find((account) => account.uid === uid)?.profile || null;
}

export function updateStoredProfile(uid: string, patch: Partial<UserProfile>) {
  const accounts = readAccounts();
  const next = accounts.map((account) => {
    if (account.uid !== uid) return account;

    const safePatch = { ...patch };
    delete safePatch.uid;
    delete safePatch.email;
    delete safePatch.role;

    const profile: UserProfile = {
      ...account.profile,
      ...safePatch,
      uid: account.profile.uid,
      email: account.profile.email,
      role: account.profile.role,
      updatedAt: new Date().toISOString(),
    };

    return { ...account, profile };
  });

  writeAccounts(next);
}

export function subscribeAuth(callback: (user: LocalUser | null) => void) {
  if (!browserAvailable()) return () => undefined;

  const emit = () => callback(getCurrentUser());
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === USERS_KEY) emit();
  };

  window.addEventListener(AUTH_EVENT, emit);
  window.addEventListener("storage", onStorage);
  emit();

  return () => {
    window.removeEventListener(AUTH_EVENT, emit);
    window.removeEventListener("storage", onStorage);
  };
}
