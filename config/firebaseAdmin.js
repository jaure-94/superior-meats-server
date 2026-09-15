import dotenv from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

dotenv.config();

const cleanEnvValue = (value = "") => {
    const trimmedValue = value.trim().replace(/,$/, "");

    if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
        return trimmedValue.slice(1, -1);
    }

    return trimmedValue;
};

const firebaseAdminApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
            projectId: cleanEnvValue(process.env.FIREBASE_PROJECT_ID),
            clientEmail: cleanEnvValue(process.env.FIREBASE_CLIENT_EMAIL),
            privateKey: cleanEnvValue(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n"),
        }),
    });

export const firebaseAdminAuth = getAuth(firebaseAdminApp);