import { Inject, Injectable } from "@nestjs/common";
import type { App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

@Injectable()
export class FirebaseService {
  constructor(
    @Inject("FIREBASE_APP")
    private readonly firebaseApp: App,
  ) {}

  async sendPush(
    token: string,
    title: string,
    body: string,
    url = "/",
    metadata: Record<string, string> = {},
  ) {
    return getMessaging(this.firebaseApp).send({
      token,
      data: {
        title,
        body,
        url,
        ...metadata,
      },
    });
  }
}
