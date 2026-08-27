import { ConfigService } from "@nestjs/config";
import { cert, getApps, initializeApp } from "firebase-admin/app";

export const FirebaseProvider = {
  provide: "FIREBASE_APP",

  inject: [ConfigService],

  useFactory: (config: ConfigService) => {
    if (getApps().length > 0) {
      return getApps()[0];
    }

    return initializeApp({
      credential: cert({
        projectId: config.get<string>("FIREBASE_PROJECT_ID"),
        clientEmail: config.get<string>("FIREBASE_CLIENT_EMAIL"),
        privateKey: config
          .get<string>("FIREBASE_PRIVATE_KEY")
          ?.replace(/\\n/g, "\n"),
      }),
    });
  },
};
