import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { requireFirebase } from "@/lib/firebase";
import type { UserRole } from "@/types";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studioName?: string;
  location?: string;
};

export async function registerUser(input: RegisterInput) {
  const { auth, db } = requireFirebase();
  const credential = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
  await updateProfile(credential.user, { displayName: input.name.trim() });

  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    studioName: input.role === "worker" ? input.studioName?.trim() || input.name.trim() : "",
    location: input.location?.trim() || "",
    materials: input.role === "worker" ? ["PLA"] : [],
    baseGramPrice: input.role === "worker" ? 250 : null,
    baseHourPrice: input.role === "worker" ? 700 : null,
    bio: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential.user;
}

export async function loginUser(email: string, password: string) {
  const { auth } = requireFirebase();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logoutUser() {
  const { auth } = requireFirebase();
  return signOut(auth);
}

export async function resetPassword(email: string) {
  const { auth } = requireFirebase();
  return sendPasswordResetEmail(auth, email.trim());
}
