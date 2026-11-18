/**
 * Firebase Admin SDK — server-side only.
 * Initialised from FIREBASE_SERVICE_ACCOUNT_JSON env var.
 * This file must NEVER be imported from client components.
 */
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === "admin");
  if (existing) return existing;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON env var is not set. " +
        "Download a service account key from Firebase Console → Project Settings → Service accounts."
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  return initializeApp(
    {
      credential: cert(serviceAccount),
    },
    "admin"
  );
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
