import * as admin from "firebase-admin";
import { getEnv } from "@/lib/validation/env";

let firebaseAdmin: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    const env = getEnv();

    if (!admin.apps.length) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    } else {
      firebaseAdmin = admin.app();
    }

    return firebaseAdmin;
  } catch (error) {
    throw new Error(`Firebase Admin 초기화 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}

