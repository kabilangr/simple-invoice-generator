import * as admin from 'firebase-admin';

const isBuild = process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PRIVATE_KEY;

let adminApp: admin.app.App;

try {
    if (!admin.apps.length) {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            adminApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            console.warn("Firebase Admin credentials not found. Using mock for build.");
            // Mock admin app if needed, or just don't initialize
        }
    } else {
        adminApp = admin.apps[0]!;
    }
} catch (e) {
    console.warn("Firebase Admin init error:", e);
}

export function getAdminDb() {
    if (admin.apps.length) {
        return admin.firestore();
    }
    // Return a mock Firestore for build time
    return {
        collection: () => ({
            doc: () => ({
                update: () => Promise.resolve(),
                get: () => Promise.resolve({ exists: false }),
            }),
        }),
    } as any;
}

export { admin };
